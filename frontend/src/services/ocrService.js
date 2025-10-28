import * as FileSystem from 'expo-file-system';
import { OCR_SPACE_API_KEY } from '@env';

export const extractTextFromImage = async (imageUri) => {
  try {
    // If the API key isn't set, don't throw — return an empty result so
    // callers (e.g. MedicineScanner) can continue to function.
    if (!OCR_SPACE_API_KEY) {
      console.warn('OCR_SPACE_API_KEY not set — OCR disabled. Set OCR_SPACE_API_KEY in your environment to enable OCR.');
      return [];
    }

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

    if (!res.ok) {
      console.warn('OCR.Space responded with non-OK status', res.status);
      return [];
    }

    const json = await res.json();
    if (!json.ParsedResults || !json.ParsedResults.length) return [];

    const text = json.ParsedResults[0].ParsedText || '';
    return text.split('\n').map(l => l.trim()).filter(Boolean);

  } catch (err) {
    // Log and return empty array so UI doesn't crash; callers expect an array.
    console.error('OCR.Space error:', err);
    return [];
  }
};
