import 'dotenv/config';
import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import router from './routers/index.js';

import { getEnvVariable } from './utils/getEnvVariable.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

async function setupServer() {
  const app = express();

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());
  app.use(router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = getEnvVariable('PORT') || 3000;

  app.listen(PORT, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Server started on port ${PORT}`);
  });
}

export default setupServer;
