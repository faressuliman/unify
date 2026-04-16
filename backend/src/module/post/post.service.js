import Post from "../../DB/models/post.model.js";
import MapData from "../../DB/models/mapData.model.js";
import { pagination } from "../../utils/feature/pagination.js";

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

  const post = await Post.create({
    postType,
    userId: req.user._id,
    name: `${firstName} ${lastName}`,
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
    locationId,
    status: "active",
  });

  return res.status(201).json({ message: "Post created successfully", post });
};

// ─── Get All Posts (with filters + pagination) ────────────────────────────────
export const getPosts = async (req, res, next) => {
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
  if (city) filter.city = new RegExp(city, "i");
  if (hairColour) filter.hairColour = new RegExp(hairColour, "i");
  if (eyeColour) filter.eyeColour = new RegExp(eyeColour, "i");
  if (firstName || lastName) {
    const name = [firstName, lastName].filter(Boolean).join(" ");
    filter.name = new RegExp(name, "i");
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
  const { keyword, city, dateMissing, status } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (city) filter.city = new RegExp(city, "i");
  if (keyword) filter.name = new RegExp(keyword, "i");
  if (dateMissing) filter.lastSeenDate = { $gte: new Date(dateMissing) };

  const posts = await Post.find(filter)
    .select("name postType status city postImages locationId createdAt")
    .populate("locationId", "latitude longitude address");

  const markers = posts
    .filter((p) => p.locationId?.latitude && p.locationId?.longitude)
    .map((p) => ({
      id: p._id,
      name: p.name,
      type: p.postType,
      status: p.status,
      city: p.city,
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
