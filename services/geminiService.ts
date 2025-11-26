import { GoogleGenAI, Type } from "@google/genai";
import { Product, StrainType, Terpene } from "../types";

// We use the Gemini API to act as the "Catalog Service" requested.
// It estimates terpenes and stats based on its training data.

interface EnrichedData {
  strain_type: StrainType;
  typical_thc_percentage?: number;
  typical_cbd_percentage?: number;
  dominant_terpenes: { name: string; percentage?: number; effects?: string }[];
  suggested_tags: string[];
  description_summary: string;
}

export const enrichProductData = async (
  brand: string,
  productName: string,
  variant?: string
): Promise<EnrichedData | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API Key found for Gemini enrichment.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze this cannabis or psychedelic product and provide a best-effort estimation of its profile based on common market data.
    Brand: ${brand}
    Product: ${productName}
    Variant/Flavor: ${variant || "N/A"}

    Return JSON data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strain_type: {
              type: Type.STRING,
              enum: ["Indica", "Sativa", "Hybrid", "Unknown"],
            },
            typical_thc_percentage: { type: Type.NUMBER, description: "Estimated THC percentage (0-100)" },
            typical_cbd_percentage: { type: Type.NUMBER, description: "Estimated CBD percentage (0-100)" },
            dominant_terpenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  percentage: { type: Type.NUMBER, description: "Estimated percentage if known, else approximate" },
                  effects: { type: Type.STRING, description: "Short description of effects (e.g. 'Calming')" },
                },
                required: ["name", "effects"],
              },
            },
            suggested_tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 short tags like 'Sleepy', 'Social', 'Pain Relief'",
            },
            description_summary: { type: Type.STRING, description: "A 1-sentence summary of what this strain/product is known for." },
          },
          required: ["strain_type", "dominant_terpenes", "suggested_tags", "description_summary"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    
    // Map string enum from JSON to TypeScript enum
    let strainType = StrainType.UNKNOWN;
    if (data.strain_type === 'Indica') strainType = StrainType.INDICA;
    else if (data.strain_type === 'Sativa') strainType = StrainType.SATIVA;
    else if (data.strain_type === 'Hybrid') strainType = StrainType.HYBRID;

    return {
      strain_type: strainType,
      typical_thc_percentage: data.typical_thc_percentage,
      typical_cbd_percentage: data.typical_cbd_percentage,
      dominant_terpenes: data.dominant_terpenes || [],
      suggested_tags: data.suggested_tags || [],
      description_summary: data.description_summary || "",
    };

  } catch (error) {
    console.error("Gemini enrichment failed:", error);
    return null;
  }
};
