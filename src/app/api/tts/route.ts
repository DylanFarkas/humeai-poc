// app/api/tts/route.ts
import { HumeClient } from "hume";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceName, stylePreset, description } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Texto inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hume = new HumeClient({
      apiKey: process.env.HUME_API_KEY!,
    });

    // ✅ Usa voice.name + provider
    const result = await hume.tts.synthesizeJson({
      utterances: [
        {
          text,
          voice: {
            name: voiceName || "Male English Actor", // ✅ Nombre de voz público
            provider: "HUME_AI",
          },
          ...(description && { description }),
        },
      ],
      ...(stylePreset && { stylePreset }),
    });

    if (!result.generations?.[0]?.audio) {
      throw new Error("No se generó audio");
    }

    const audioBuffer = Buffer.from(result.generations[0].audio, "base64");

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error en TTS:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Error al generar audio",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}