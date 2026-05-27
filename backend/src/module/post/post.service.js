import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import Post from "../../DB/models/post.model.js";
import MapData from "../../DB/models/mapData.model.js";
import { pagination } from "../../utils/feature/pagination.js";
import cloudinary from "../../utils/cloudinary/index.js";
import {
  toSearchKey,
  escapeRegex,
  containsArabic,
  arabicToLatin,
  latinToArabic,
} from "../../utils/language/transliterate.js";

// دالة حساب المسافة الرياضية للمطابقة
function euclideanDistance(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += Math.pow(vec1[i] - vec2[i], 2);
  }
  return Math.sqrt(sum);
}

// ─── Search by Image (AI Face Matching) ───────────────────────────────────────
export const searchByImage = async (req, res, next) => {
  if (!req.file)
    return next(new Error("Please upload an image to search", { cause: 400 }));

  try {
    // 1. طلب البصمة من سيرفر البايثون لصورة البحث
    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path));

    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/get-face-encoding",
      form,
      {
        headers: { ...form.getHeaders() },
        timeout: 15000,
      },
    );

    if (!aiResponse.data.success) {
      return res
        .status(400)
        .json({ message: "No face detected in the search image" });
    }

    const searchVector = aiResponse.data.encoding;

    // 2. جلب كل الحالات النشطة التي تمتلك بصمة وجه
    const allPosts = await Post.find({
      faceEncoding: { $exists: true, $ne: [] },
      status: "active",
    });

    // 3. المقارنة وحساب نسبة الثقة
    const matches = allPosts
      .map((post) => {
        const distance = euclideanDistance(searchVector, post.faceEncoding);
        // تحويل المسافة لنسبة مئوية (المسافة الأقل تعني شبه أكبر)
        const confidence = Math.max(0, 100 - distance * 100).toFixed(2);

        return {
          ...post._doc,
          confidence: parseFloat(confidence),
        };
      })
      .filter((p) => p.confidence > 40) // عرض النتائج التي تتخطى 40% شبه
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);

    return res.status(200).json({
      success: true,
      count: matches.length,
      results: matches,
    });
  } catch (error) {
    console.error("Image Search Error:", error.message);
    return next(new Error("AI Search failed. Ensure AI server is running."));
  }
};

// ─── Create Post ──────────────────────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  const {
    postType,
    firstName,
    lastName,
    age,
    ageUnit,
    gender,
    hairColour,
    eyeColour,
    clothesDescription,
    city,
    lastSeenLocation,
    lastSeenDate,
    foundLocation,
    affiliation,
    organizationName,
    reporterPhone,
    latitude,
    longitude,
  } = req.body;

  // 1. إنشاء بيانات الخريطة
  let locationId;
  let finalLat = latitude;
  let finalLng = longitude;

  if (!finalLat || !finalLng) {
    // Try to geocode from Nominatim based on the location provided
    const addressToGeocode = postType === "missing" ? lastSeenLocation : foundLocation;
    const query = `${addressToGeocode || ''} ${city || ''} Egypt`.trim();
    if (query.length > 5) {
      try {
        const geoob = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
          headers: { "User-Agent": "UnifyMissingPersonsApp/1.0" }
        });
        if (geoob.data && geoob.data.length > 0) {
          finalLat = parseFloat(geoob.data[0].lat);
          finalLng = parseFloat(geoob.data[0].lon);
        }
      } catch (geocodeErr) {
        console.warn("[Geocoding] Fetch failed:", geocodeErr.message);
      }
    }
  }

  if (finalLat && finalLng) {
    const mapEntry = await MapData.create({
      address: postType === "missing" ? lastSeenLocation : foundLocation,
      zoneType: city,
      latitude: parseFloat(finalLat),
      longitude: parseFloat(finalLng),
    });
    locationId = mapEntry._id;
  }

  const postImages = req.files?.map((f) => f.path) || [];
  const fullName = `${firstName} ${lastName}`.trim();

  // 2. استخراج بصمة الوجه آلياً عند إنشاء البوست
  let faceEncoding = [];
  if (postImages.length > 0) {
    try {
      const form = new FormData();
      form.append("image", fs.createReadStream(req.files[0].path));

      const aiResponse = await axios.post(
        "http://127.0.0.1:8000/get-face-encoding",
        form,
        {
          headers: { ...form.getHeaders() },
          timeout: 15000,
        },
      );

      if (aiResponse.data.success) {
        faceEncoding = aiResponse.data.encoding;
      }
    } catch (err) {
      console.warn("[AI Service] Encoding extraction skipped:", err.message);
    }
  }

  // 3. حفظ البوست النهائي
  const post = await Post.create({
    ...req.body,
    userId: req.user._id,
    name: fullName,
    nameSearchKey: toSearchKey(fullName),
    postImages,
    faceEncoding: faceEncoding.length > 0 ? faceEncoding : undefined,
    locationId,
    status: "active",
  });

  return res.status(201).json({ message: "Post successfully created", post });
};

// ─── باقي الدوال (Get, Update, Delete, Stats) ──────────────────────────────────

let _searchKeyBackfilled = false;
const backfillSearchKeys = async () => {
  if (_searchKeyBackfilled) return;
  _searchKeyBackfilled = true;
  try {
    const stale = await Post.find({
      $or: [{ nameSearchKey: { $exists: false } }, { nameSearchKey: "" }],
    }).select("_id name");
    for (const doc of stale) {
      doc.nameSearchKey = toSearchKey(doc.name || "");
      await doc.save();
    }
  } catch (err) {
    console.warn("[posts] nameSearchKey backfill failed:", err?.message || err);
  }
};

export const getPosts = async (req, res, next) => {
  await backfillSearchKeys();
  const {
    postType,
    status,
    gender,
    city,
    hairColour,
    eyeColour,
    firstName,
    lastName,
    ageMin,
    ageMax,
    dateMissing,
    page,
    limit,
  } = req.query;

  const filter = {};
  if (postType) filter.postType = postType;
  filter.status = status || "active";
  if (gender) filter.gender = gender;
  if (city) filter.city = new RegExp(escapeRegex(city), "i");
  if (hairColour) filter.hairColour = new RegExp(escapeRegex(hairColour), "i");
  if (eyeColour) filter.eyeColour = new RegExp(escapeRegex(eyeColour), "i");

  if (firstName || lastName) {
    const rawName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (rawName) {
      const escapedRaw = escapeRegex(rawName);
      const orClauses = [{ name: new RegExp(escapedRaw, "i") }];
      const searchKey = toSearchKey(rawName);
      if (searchKey && searchKey.length >= 2) {
        orClauses.push({
          nameSearchKey: new RegExp(escapeRegex(searchKey), "i"),
        });
      }
      filter.$or = orClauses;
    }
  }

  if (ageMin || ageMax) {
    filter.age = {};
    if (ageMin) filter.age.$gte = parseInt(ageMin);
    if (ageMax) filter.age.$lte = parseInt(ageMax);
  }

  const result = await pagination({
    page,
    limit,
    model: Post,
    filter,
    sort: { createdAt: -1 },
    populate: [{ path: "userId", select: "name email" }],
  });
  return res.status(200).json(result);
};

export const getPostById = async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("userId", "name email phoneNumber")
    .populate("locationId");
  if (!post) return next(new Error("Post not found", { cause: 404 }));
  return res.status(200).json({ post });
};

const CITY_COORDS = {
  Cairo: [30.0444, 31.2357],
  "القاهرة": [30.0444, 31.2357],
  Alexandria: [31.2001, 29.9187],
  "الإسكندرية": [31.2001, 29.9187],
  Giza: [30.0131, 31.2089],
  "الجيزة": [30.0131, 31.2089],
  Aswan: [24.0889, 32.8998],
  "أسوان": [24.0889, 32.8998],
  Luxor: [25.6872, 32.6396],
  "الأقصر": [25.6872, 32.6396],
  Asyut: [27.1783, 31.1859],
  "أسيوط": [27.1783, 31.1859],
  Sohag: [26.557, 31.6948],
  "سوهاج": [26.557, 31.6948],
  Ismailia: [30.5965, 32.2715],
  "الإسماعيلية": [30.5965, 32.2715],
  "Port Said": [31.2565, 32.2841],
  "بورسعيد": [31.2565, 32.2841],
  Suez: [29.9668, 32.5498],
  "السويس": [29.9668, 32.5498],
  Mansoura: [31.0409, 31.3785],
  "المنصورة": [31.0409, 31.3785],
  Tanta: [30.7865, 31.0003],
  "طنطا": [30.7865, 31.0003],
  Zagazig: [30.5877, 31.5167],
  "الزقازيق": [30.5877, 31.5167],
  Fayyum: [29.3084, 30.8428],
  "الفيوم": [29.3084, 30.8428],
  Minya: [28.1099, 30.7503],
  "المنيا": [28.1099, 30.7503],
};

export const getMapMarkers = async (req, res, next) => {
  const { keyword, city, dateMissing, status, postType } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (postType) filter.postType = postType;
  if (city) filter.city = new RegExp(city, "i");
  if (keyword) filter.name = new RegExp(keyword, "i");
  if (dateMissing) filter.lastSeenDate = { $gte: new Date(dateMissing) };

  const posts = await Post.find(filter)
    .select(
      "name postType status city postImages locationId createdAt age lastSeenDate foundLocation timeAgo details clothesDescription userId",
    )
    .populate("locationId", "latitude longitude address")
    .populate("userId", "name");

  const markers = posts
    .map((p) => {
      const isLocated = p.locationId?.latitude && p.locationId?.longitude;
      const fallbackCoords = p.city ? CITY_COORDS[p.city] : undefined;
      const [lat, lng] = isLocated
        ? [p.locationId.latitude, p.locationId.longitude]
        : fallbackCoords || [null, null];
      return {
        id: p._id,
        name: p.name,
        type: p.postType,
        status: p.status,
        city: p.city,
        age: p.age,
        details: p.details || p.clothesDescription,
        clothesDescription: p.clothesDescription,
        postedBy: p.userId?.name || undefined,
        createdAt: p.createdAt,
        lastSeenDate: p.lastSeenDate,
        timeAgo: p.timeAgo,
        lat,
        lng,
        image: p.postImages?.[0],
        address:
          p.locationId?.address ||
          p.foundLocation ||
          p.lastSeenLocation ||
          p.city,
      };
    });

  return res.status(200).json({ markers });
};

export const updatePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new Error("Post not found", { cause: 404 }));
  if (
    post.userId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new Error("Unauthorized", { cause: 403 }));
  }
  const { status, clothesDescription } = req.body;
  if (status) post.status = status;
  if (clothesDescription) post.clothesDescription = clothesDescription;
  await post.save();
  return res.status(200).json({ message: "Post updated", post });
};

export const deletePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new Error("Post not found", { cause: 404 }));
  if (
    post.userId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new Error("Unauthorized", { cause: 403 }));
  }
  await post.deleteOne();
  return res.status(200).json({ message: "Post deleted" });
};

export const getPublicMap = async (req, res, next) => {
  const posts = await Post.find({
    status: "active",
    postType: { $in: ["missing", "found"] },
  })
    .populate("locationId", "latitude longitude address")
    .select("name postType postImages city locationId lastSeenDate");

  const cases = posts
    .map((p) => {
      const isLocated = p.locationId?.latitude && p.locationId?.longitude;
      const fallbackCoords = p.city ? CITY_COORDS[p.city] : undefined;
      const [lat, lng] = isLocated
        ? [p.locationId.latitude, p.locationId.longitude]
        : fallbackCoords || [null, null];
      return {
        _id: p._id,
        name: p.name,
        status: p.postType,
        image: p.postImages?.[0],
        location: { lat, lng },
        city: p.city,
        date: p.lastSeenDate,
      };
    })
    .filter((c) => c.location.lat !== null);
  return res.status(200).json({ success: true, cases });
};

export const getPublicStats = async (req, res, next) => {
  const missingCount = await Post.countDocuments({
    postType: "missing",
    status: "active",
  });
  const foundCount = await Post.countDocuments({ postType: "found" });
  return res
    .status(200)
    .json({
      success: true,
      activeMissing: missingCount,
      foundCases: foundCount,
    });
};
