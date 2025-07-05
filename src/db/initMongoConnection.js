import mongoose from 'mongoose';

import { getEnvVariable } from '../utils/getEnvVariable.js';

export const initMongoDB = async () => {
  try {
    const user = getEnvVariable('MONGODB_USER');
    const password = getEnvVariable('MONGODB_PASSWORD');
    const url = getEnvVariable('MONGODB_URL');
    const db = getEnvVariable('MONGODB_DB');

    await mongoose.connect(
      `mongodb+srv://${user}:${password}@${url}/${db}?retryWrites=true&w=majority`,
    );

    console.log('Mongo connection successfully established!');
  } catch (e) {
    console.log('Error while setting up mongo connection', e);
    throw e;
  }
};

// mongodb+srv://IaroslavMarchuk:SqUwIWE9bBEr1ehp@cluster0.4um4aez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
