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
  res.send(`<h2>${JSON.stringify(res.locals.session)}</h2>`)
})

// Swagger documentation
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { authOptions } from './utils/authUtils.ts';
// TODO
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;

