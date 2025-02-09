declare module '@/index' {
  const index: any;
  export default index;
}

declare module '@/routes/shorten' {
  const shortenRouter: any;
  export default shortenRouter;
}

declare module '@/routes/analytics' {
  const analyticsRouter: any;
  export default analyticsRouter;
}

declare module '@/utils/authUtils' {
  interface AuthUtils {
    authOptions: any;
  }
  const authUtils: AuthUtils;
  export default authUtils;
}

declare module '@/utils/mongodb' {
  const mongodb: any;
  export default mongodb;
}

declare module '@/utils/serverSetup' {
  interface ServerSetup {
    getCache: any;
    closeConnection: any;
    getDb: any;
  }
  const serverSetup: ServerSetup;
  export default serverSetup;
}

declare module '@/middlewares/auth.middleware' {
  interface AuthMiddleware {
    authSession: any;
    authenticatedUser: any;
  }
  const authMiddleware: AuthMiddleware;
  export default authMiddleware;
}

interface IUser {
  googleId: string | undefined;
  name: string;
  email: string;
  image: string;
  createdAt: Date | undefined;
}

interface IUrl {
  longUrl: string;
  alias: string;
  topic: string;
  // the email of the creator
  createdBy: string | undefined;
  createdAt: number | undefined;
}

interface IAnalytic {

  timestamp: Date;
  userAgent: string;
  location: {lat: number; lng: number;};
  alias: string;
  os: string;
  ip: string;
  urlBy: string;
  topic: string;

}
