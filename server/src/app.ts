import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import videoRoutes from './routes/video.routes';
import { createRouteHandler } from 'uploadthing/express';
import { uploadRouter } from './utils/uploadthing';

const app = express();

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

// Routes
app.use('/api/video/v1/', videoRoutes);

app.use(
    '/api/uploadthing',
    createRouteHandler({
      router: uploadRouter,
      config: {}
    })
  );
  
  // Simple health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;