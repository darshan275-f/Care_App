import * as FileSystem from 'expo-file-system';
import { OCR_SPACE_API_KEY } from '@env';

export const extractTextFromImage = async (imageUri) => {
  try {
    console.log(OCR_SPACE_API_KEY);
    if (!OCR_SPACE_API_KEY) throw new Error('OCR_SPACE_API_KEY not set');

    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });

    const formData = new FormData();
    formData.append('base64Image', `data:image/jpg;base64,${base64}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    const res = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { apikey: OCR_SPACE_API_KEY },
      body: formData
    });

    const json = await res.json();
    if (!json.ParsedResults || !json.ParsedResults.length) return [];

    const text = json.ParsedResults[0].ParsedText;
    return text.split('\n').map(l => l.trim()).filter(Boolean);

  } catch (err) {
    console.error('OCR.Space error:', err);
    throw err;
  }
};
