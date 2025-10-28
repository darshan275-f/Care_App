import OpenAI from "openai";
import { OPENAI_API_KEY } from '@env';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const extractMedicineInfoWithOpenAI = async (ocrText) => {
  try {
    const prompt = `
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
`;

    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: prompt,
      store: false, // optional, do not store user data
    });

    // response.output_text contains the model’s full text output
    const reply = response.output_text;
    if (!reply) return null;

    // Extract JSON safely
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No valid JSON found:", reply);
      return null;
    }

    return JSON.parse(jsonMatch[0]);

  } catch (err) {
    console.error("OpenAI extraction error:", err);
    return null;
  }
};
