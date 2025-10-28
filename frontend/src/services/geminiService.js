import axios from "axios";
import { GEMINI_API_KEY } from "@env"; // make sure you have GEMINI_API_KEY in .env

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const extractMedicineInfoWithGemini = async (ocrText) => {
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              {
                text: `
You are a medicine information extractor.
Given this text from a medicine label, extract the following info in JSON ONLY:
- name
- dosageForm
- strength
- instructions
- manufacturer
- warnings
Text: "${ocrText}"
Return valid JSON only.
                `,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "x-goog-api-key": GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // Gemini returns text in response.data.contents[0].parts[0].text
    const reply = response?.data?.contents?.[0]?.parts?.[0]?.text;
    if (!reply) return null;

    // extract JSON from response
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Gemini API extraction error:", err);
    return null;
  }
};
