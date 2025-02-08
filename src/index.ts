import e from 'express';
import rateLimit from 'express-rate-limit';
import shortenRouter from '@/routes/shorten';
import analyticsRouter from '@/routes/analytics';
import { ExpressAuth } from "@auth/express"
import authMiddleware from '@/middlewares/auth.middleware';
import geoip from "geoip-lite";

import 'dotenv/config'

const app = e();
app.set("trust proxy", 1)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit : 100 requests per windowMs
});


app.use('/api/auth', limiter);
app.use('/api/shorten', limiter);
app.use('/api/analytics', limiter);

app.use("/api/auth/*", ExpressAuth(authUtils.authOptions))

//set session in res.locals to check if logged in
//auth check is done in the routers separately, if to be kept private
app.use(authMiddleware.authSession)


app.get('/', (req, res) => {
  res.send(`<h2>${JSON.stringify(res.locals.session)}</h2>
    <p>${req.header('Cookie')}</p>
`)
})


app.get('/:alias', async (req: e.Request, res: e.Response) => {
  const alias = req.params.alias;
  console.log("alias is: ", alias);
  if(!alias) {
    console.log("no alias, returning home");
    // we are at the home page, show the user info here if logged in
    res.send(`<h2>${JSON.stringify(res.locals.session)}</h2>
      <p>${req.header('Cookie')}</p>
    `)
    return;
  }

  // we have an alias
  const redisDb = await serverSetup.getCache();
  console.log("redis db is: ", redisDb);
  const db = await serverSetup.getDb(mongoClient);
  try {
    const alias = req.params.alias;
    await redisDb.connect()
    var longUrl = await redisDb.get(alias);
    console.log("redis returned:", longUrl);

    if (!longUrl) {
      // cache miss :(
      // try mongo
      console.log("cache miss");
      const url = await db.collection('urls').findOne({alias});
      console.log("url is:", url);
      if(!url) {
        // nowhere to be found
        res.status(404).json({ error: 'URL not found' });
        return
      }
      longUrl = url.longUrl;

      redisDb.set(alias, longUrl).then(() => {
        redisDb.disconnect();
      });
    }

    const userAgent = req.header('user-agent') || '';
    let os = 'Unknown';
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Macintosh')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    }

    const ip = req.ip || req.header('x-forwarded-for');
    var geo = geoip.lookup(ip);


    // log analytics
    const analytics = {
      alias: alias,
      timestamp: new Date(),
      ip: ip,

      userAgent: userAgent,

      location: {
        lat: geo.ll[0],
        lng: geo.ll[1]
      },
      os: os,
    };

    console.log(analytics);

    const result = await db?.collection('analytics').insertOne(analytics);
    console.log("analytics result: ", result);

    res.redirect(301, longUrl);
  } catch (err) {
    res.status(500).json({ error: `Internal server error: ${err}` });
  }

});




// Parse incoming requests data
app.use(e.urlencoded({ extended: true }))
app.use(e.json())

// auth checking middlewares are in respective routes
app.use('/api/shorten', shortenRouter);
app.use('/api/analytics', analyticsRouter);




// Swagger documentation
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import serverSetup from '@/utils/serverSetup';
import mongoClient from '@/utils/mongodb';
import authUtils from '@/utils/authUtils';
const swaggerDocument = YAML.load('swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    try {
      await serverSetup.closeConnection(mongoClient);
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

