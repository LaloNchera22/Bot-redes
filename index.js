import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generarGuion() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = "Actúa como una streamer sarcástica. Escribe un guion corto para TikTok sobre una partida épica en la plataforma OutName, mencionando sutilmente lo cómoda que es tu hoodie de 0xBAD. Devuelve estrictamente un JSON con las claves: 'guion', 'titulo' y 'hashtags'.";
  
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  const data = JSON.parse(result.response.text());
  console.log("Guion generado:", data);
  
  return data;
}

generarGuion();
