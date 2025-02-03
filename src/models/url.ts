import mongoose, { Schema } from 'mongoose';

interface IUrlType {
  longUrl: string;
  shortUrl: string;
  alias: string;
  topic?: string;
  createdAt: Date;
  createdBy: string;
}

const IUrl = new Schema<IUrlType>({
  longUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  alias: { type: String, required: true },
  topic: { type: String },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true }
});

export default mongoose.model<IUrlType>('Url', IUrl);
