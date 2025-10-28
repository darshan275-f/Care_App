// Simple unsigned upload to Cloudinary from React Native
// Expect env-like config to be set in app config

import { Platform } from 'react-native';

const CLOUDINARY_UPLOAD_PRESET = 'careapp_unsigned';
const CLOUDINARY_CLOUD_NAME = 'demo'; // TODO: replace via .env or app config

export async function uploadImageToCloudinary(uri) {
  // React Native: fetch the file and send as form-data
  const formData = new FormData();
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: `upload_${Date.now()}.jpg`,
  });

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Cloudinary upload failed');
  }

  const data = await res.json();
  return data.secure_url;
}


