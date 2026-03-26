import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import fs from "fs";

// CONFIGURACIÓN DE APIS
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
const voiceId = "CAvMBIZ0VNTU8XdsUpEq"; // Tu Voice ID

async function generarGuionYAudio() {
  try {
    // 1. FORMATOS SERIALIZABLES (Infinitos)
    const formatos = [
      "resumir la historia completa de un videojuego famoso de forma rápida y con spoilers absurdos",
      "explicar el lore oculto o más oscuro de un personaje de videojuegos",
      "calificar los peores niveles, armas o jefes de la historia del gaming",
      "datos inútiles y curiosidades de videojuegos que no sirven para nada",
      "desmintiendo mitos clásicos de videojuegos",
      "teorías conspirativas ridículas sobre el universo de un juego popular",
      "narrar un 'iceberg' de misterios de un videojuego",
      "explicar por qué un juego amado por todos en realidad está sobrevalorado"
    ];

    const formatoElegido = formatos[Math.floor(Math.random() * formatos.length)];
    const numeroParte = Math.floor(Math.random() * 100) + 1; // Genera un número del 1 al 100
    
    console.log(`🧠 Formato: ${formatoElegido} (Parte ${numeroParte})`);

    // 2. GENERACIÓN DE GUION CON GEMINI
    const prompt = `Actúa como una streamer mexicana sarcástica y experta en gaming.
    Escribe un guion dinámico de 30 segundos para un TikTok basado en este formato: "${formatoElegido}".
    
    REGLAS ESTRICTAS:
    1. Elige UN videojuego o personaje específico al azar para centrar este guion (ej. Halo, Minecraft, FNAF, Elden Ring, etc.).
    2. El título DEBE incluir "(Parte ${numeroParte})".
    3. Usa jerga gamer mexicana actual (ej. 'try-hard', 'f', 'lore', 'nerfear', 'buff').
    4. NUNCA hagas publicidad de ninguna marca, plataforma ni producto.
    
    Devuelve estrictamente un JSON con las claves: 'guion', 'titulo' y 'hashtags'.`;
    
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(result.response.text());
    console.log("✅ Título de la serie:", data.titulo);

    // 3. GENERACIÓN DE AUDIO CON ELEVENLABS
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const audioResponse = await axios.post(url, {
      text: data.guion,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    }, {
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    });

    const writer = fs.createWriteStream('audio.mp3');
    audioResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    console.log("✅ Audio guardado como audio.mp3");

  } catch (error) {
    if (error.response?.data) {
      console.error("❌ Error en la API:", error.response.data);
    } else {
      console.error("❌ Error general:", error.message);
    }
  }
}

generarGuionYAudio();

