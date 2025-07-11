import 'dotenv/config';
import express from 'express';
import pino from 'pino-http';
import cors from 'cors';

import contactsRouter from './routers/contacts.js';

import { getEnvVariable } from './utils/getEnvVariable.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

async function setupServer() {
  const app = express();

  app.use(express.json());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use(cors());

  app.use('/contacts', contactsRouter);

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
