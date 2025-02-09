export interface IAnalytics {
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
  topic: string;
  urlBy: string;
}

