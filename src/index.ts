import express from 'express';
import rateLimit from 'express-rate-limit';
import shortenRouter from './routes/shorten';
import analyticsRouter from './routes/analytics';
import authRouter from './routes/auth';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit : 100 requests per windowMs
});

app.use('/api/auth', limiter);
app.use('/api/shorten', limiter);
app.use('/api/analytics', limiter);

app.use('/api/auth', authRouter);
app.use('/api/shorten', shortenRouter);
app.use('/api/analytics', analyticsRouter);

// Swagger documentation
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
// TODO
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;

