import 'dotenv/config';
import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

import router from './routers/index.js';

import { getEnvVariable } from './utils/getEnvVariable.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { TEMP_UPLOAD_DIR } from './constants/index.js';

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

  app.use('/uploads', express.static(TEMP_UPLOAD_DIR));
  app.use('/api-docs', swaggerDocs());
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
