import 'dotenv/config';
import express from 'express';
import pino from 'pino-http';
import cors from 'cors';

import { getEnvVariable } from './utils/getEnvVariable.js';
import { getAllContacts, getContactById } from './services/contacts.js';

async function setupServer() {
  const app = express();

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use(cors());

  app.get('/contacts', async (req, res) => {
    const contacts = await getAllContacts();
    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  });

  app.get('/contacts/:contactId', async (req, res, next) => {
    const { contactId } = req.params;

    const contact = await getContactById(contactId);

    if (!contact) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }

    res.json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  });

  app.use((req, res, next) => {
    res.status(404).json({ status: 404, message: 'Not found' });
  });

  const PORT = getEnvVariable('PORT') || 3000;

  app.listen(PORT, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Server started on port ${PORT}`);
  });
}

export default setupServer;
