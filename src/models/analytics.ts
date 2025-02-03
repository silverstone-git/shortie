import mongoose, { Schema } from 'mongoose';

interface IAnalytics {
  urlId: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
  location: {
    lat: number;
    lng: number;
  };
  os: string;
  device: string;
}

const analyticsSchema = new Schema<IAnalytics>({
  urlId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  os: { type: String },
  device: { type: String }
});

export default mongoose.model<IAnalytics>('Analytics', analyticsSchema);
