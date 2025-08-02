import cloudinary from 'cloudinary';
import { getEnvVariable } from './getEnvVariable.js';

cloudinary.v2.config({
  secure: true,
  cloud_name: getEnvVariable('CLOUD_NAME'),
  api_key: getEnvVariable('API_KEY'),
  api_secret: getEnvVariable('API_SECRET'),
});

export const uploadToCloudinary = (filePath) => {
  return cloudinary.v2.uploader.upload(filePath);
};
