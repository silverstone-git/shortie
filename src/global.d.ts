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
  const authMiddleware: any;
  export default authMiddleware;
}

