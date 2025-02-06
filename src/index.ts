import e from 'express';
import rateLimit from 'express-rate-limit';
import shortenRouter from './routes/shorten.ts';
import analyticsRouter from './routes/analytics.ts';
import { ExpressAuth } from "@auth/express"
import { authSession } from './middlewares/auth.middleware.ts';

const app = e();
//app.set("trust proxy", true)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit : 100 requests per windowMs
});


app.use('/api/auth', limiter);
app.use('/api/shorten', limiter);
app.use('/api/analytics', limiter);

app.use("/api/auth/*", ExpressAuth(authOptions))

// Parse incoming requests data
app.use(e.urlencoded({ extended: true }))
app.use(e.json())
// Set session in res.locals
app.use(authSession)

// auth checking middlewares are in respective routes
app.use('/api/shorten', shortenRouter);
app.use('/api/analytics', analyticsRouter);

app.use('/', (req, res) => {
  res.send(`<h2>${JSON.stringify(res.locals.session)}</h2>
    <p>${req.header('Cookie')}</p>
`)
})


app.get('/:alias', async (req: e.Request, res: e.Response) => {
  const redisDb = await getCache();
  try {
    const alias = req.params.alias;
    const longUrl = await redisDb.get(alias);

    if (!longUrl) {
      res.status(404).json({ error: 'URL not found' });
      return;
    }

    // log analytics
    const analytics = {
      urlId: longUrl,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
      location: {
        lat: 0,
        lng: 0
      },
      os: 'unknown',
      device: 'unknown'
    };

    // TODO: implement geolocation, etc. data sniff

    res.redirect(301, longUrl);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }

});



// Swagger documentation
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { authOptions } from './utils/authUtils.ts';
import { closeConnection, getCache } from './utils/serverSetup.ts';
import mongoClient from './utils/mongodb.ts';
// TODO
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;

process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    try {
      await closeConnection(mongoClient);
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

