import mongoose from "mongoose";

const mapDataSchema = new mongoose.Schema({
  address: { type: String },
  zoneType: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  severity: { type: String, enum: ["low", "medium", "high"] },
  missingCount: { type: Number, default: 0 },
});

const MapData = mongoose.model("MapData", mapDataSchema);
export default MapData;
