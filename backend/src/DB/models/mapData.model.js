import mongoose from "mongoose";

const mapDataSchema = new mongoose.Schema({
  address: { type: String },
  zoneType: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const MapData = mongoose.model("MapData", mapDataSchema);
export default MapData;
