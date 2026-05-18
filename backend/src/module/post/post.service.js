import Post from "../../DB/models/post.model.js";
import MapData from "../../DB/models/mapData.model.js";
import { pagination } from "../../utils/feature/pagination.js";
import cloudinary from "../../utils/cloudinary/index.js";
import axios from "axios";
import FormData from "form-data";
import { cosineSimilarity } from "../../utils/feature/cosineSimilarity.js";
import {
  toSearchKey,
  escapeRegex,
  containsArabic,
  arabicToLatin,
  latinToArabic,
} from "../../utils/language/transliterate.js";

// ─── Search by Image (AI Face Matching) ───────────────────────────────────────
export const searchByFace = async (req, res, next) => {
  if (!req.file) {
    return next(new Error("Please upload an image", { cause: 400 }));
  }

  // 1. Forward to FastAPI AI Service
  const formData = new FormData();
  formData.append('image', req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype,
  });

  let aiResponse;
  try {
    aiResponse = await axios.post('http://127.0.0.1:8000/get-face-encoding', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
  } catch (err) {
    return next(new Error("AI service is currently unavailable.", { cause: 503 }));
  }

  if (!aiResponse.data.success || !aiResponse.data.encoding) {
    return next(new Error("Failed to extract face encoding. Ensure the image is clear and contains a face.", { cause: 400 }));
  }

  const { encoding: searchEncoding } = aiResponse.data;

  // 2. Fetch all reports from DB that have face encodings stored
  const reports = await Post.find({
    faceEncoding: { $exists: true, $not: { $size: 0 } },
    status: "active"
  }).lean();

  // 3. Compute cosine similarity for each document
  const matches = [];
  const THRESHOLD = 0.60;

  for (const report of reports) {
    const score = cosineSimilarity(searchEncoding, report.faceEncoding);
    
    if (score >= THRESHOLD) {
      matches.push({
        _id: report._id,
        name: report.name,
        photos: report.postImages,
        similarity: score,
        postType: report.postType,
        city: report.city
      });
    }
  }

  // 4. Sort descending by similarity and take top 5
  matches.sort((a, b) => b.similarity - a.similarity);
  const top5Matches = matches.slice(0, 5);

  return res.status(200).json({
    success: true,
    matches: top5Matches
  });
};

// ─── Create Post ──────────────────────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  const {
    postType, firstName, lastName, age, ageUnit, gender,
    hairColour, eyeColour, clothesDescription, city,
    lastSeenLocation, lastSeenDate, foundLocation,
    affiliation, organizationName, reporterPhone,
    latitude, longitude,
  } = req.body;

  let locationId;
  if (latitude && longitude) {
    const mapEntry = await MapData.create({
      address: postType === "missing" ? lastSeenLocation : foundLocation,
      zoneType: city,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });
    locationId = mapEntry._id;
  }

  const postImages = req.files?.map((f) => f.path) || [];
  
  let faceEncoding = [];
  // AI Service removed for testing

  const fullName = `${firstName} ${lastName}`.trim();

  const post = await Post.create({
    postType,
    userId: req.user._id,
    name: fullName,
    nameSearchKey: toSearchKey(fullName),
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
    postImages,
    faceEncoding,
    locationId,
    status: "active",
  });

  return res.status(201).json({ message: "Post created successfully", post });
};

// Backfill `nameSearchKey` for any legacy posts that were created before the
// field existed. Runs at most once per process (or after restarts) so that
// cross-script search returns correct results without needing a manual
// migration step.
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
    // Non-fatal; just log and continue.
    console.warn("[posts] nameSearchKey backfill failed:", err?.message || err);
  }
};

// ─── Get All Posts (with filters + pagination) ────────────────────────────────
export const getPosts = async (req, res, next) => {
  await backfillSearchKeys();

  const {
    postType, status, gender, city,
    hairColour, eyeColour, firstName, lastName,
    ageMin, ageMax, dateMissing, page, limit,
  } = req.query;

  const filter = {};
  if (postType) filter.postType = postType;
  if (status) filter.status = status;
  else filter.status = "active";
  if (gender) filter.gender = gender;
  if (city) filter.city = new RegExp(escapeRegex(city), "i");
  if (hairColour) filter.hairColour = new RegExp(escapeRegex(hairColour), "i");
  if (eyeColour) filter.eyeColour = new RegExp(escapeRegex(eyeColour), "i");
  if (firstName || lastName) {
    const rawName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (rawName) {
      // Build cross-script matchers so a user typing "أحمد" also matches
      // "Ahmed" in the stored Latin name and vice versa.
      const orClauses = [];
      const escapedRaw = escapeRegex(rawName);
      orClauses.push({ name: new RegExp(escapedRaw, "i") });

      const isArabic = containsArabic(rawName);
      const searchKey = toSearchKey(rawName);
      // Require ≥2 chars in the consonant skeleton to avoid spurious hits
      // (e.g. "Ali" → "l" would otherwise match every record).
      if (searchKey && searchKey.replace(/\s+/g, "").length >= 2) {
        orClauses.push({ nameSearchKey: new RegExp(escapeRegex(searchKey), "i") });
      }
      if (isArabic) {
        const latin = arabicToLatin(rawName);
        if (latin && latin.length >= 2) {
          orClauses.push({ name: new RegExp(escapeRegex(latin), "i") });
        }
      } else {
        const arabic = latinToArabic(rawName);
        if (arabic && arabic.length >= 2) {
          orClauses.push({ name: new RegExp(escapeRegex(arabic), "i") });
        }
      }
      filter.$or = orClauses;
    }
  }
  if (ageMin || ageMax) {
    filter.age = {};
    if (ageMin) filter.age.$gte = parseInt(ageMin);
    if (ageMax) filter.age.$lte = parseInt(ageMax);
  }
  if (dateMissing) {
    const date = new Date(dateMissing);
    filter.lastSeenDate = { $gte: date };
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

// ─── Get Post By ID ───────────────────────────────────────────────────────────
export const getPostById = async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("userId", "name email phoneNumber")
    .populate("locationId");

  if (!post) return next(new Error("Post not found", { cause: 404 }));

  return res.status(200).json({ post });
};

// ─── Get Map Markers ──────────────────────────────────────────────────────────
export const getMapMarkers = async (req, res, next) => {
  const { keyword, city, dateMissing, status, postType } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (postType) filter.postType = postType;
  if (city) filter.city = new RegExp(city, "i");
  if (keyword) filter.name = new RegExp(keyword, "i");
  if (dateMissing) filter.lastSeenDate = { $gte: new Date(dateMissing) };

  const posts = await Post.find(filter)
    .select("name postType status city postImages locationId createdAt age lastSeenDate foundLocation")
    .populate("locationId", "latitude longitude address");

  const markers = posts
    .filter((p) => p.locationId?.latitude && p.locationId?.longitude)
    .map((p) => ({
      id: p._id,
      name: p.name,
      type: p.postType,
      status: p.status,
      city: p.city,
      age: p.age,
      lastSeenDate: p.lastSeenDate,
      foundLocation: p.foundLocation,
      createdAt: p.createdAt,
      image: p.postImages?.[0],
      lat: p.locationId.latitude,
      lng: p.locationId.longitude,
      address: p.locationId.address,
    }));

  return res.status(200).json({ markers });
};

// ─── Update Post ──────────────────────────────────────────────────────────────
export const updatePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  if (post.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new Error("Unauthorized", { cause: 403 }));
  }

  const { status, clothesDescription } = req.body;
  if (status) post.status = status;
  if (clothesDescription) post.clothesDescription = clothesDescription;
  await post.save();

  return res.status(200).json({ message: "Post updated", post });
};

// ─── Delete Post ──────────────────────────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  if (post.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new Error("Unauthorized", { cause: 403 }));
  }

  await post.deleteOne();
  return res.status(200).json({ message: "Post deleted" });
};
