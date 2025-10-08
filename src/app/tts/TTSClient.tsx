// app/tts/TTSClient.tsx
"use client";

import { useState } from "react";

// ✅ Lista fija de voces públicas que SÍ funcionan en Hume (2025)
const VOICES = [
  // 🇬🇧 Inglés
  { name: "Vince Douglas", language: "English" },
  { name: "Mysterious Woman", language: "English" },
  { name: "Male English Actor", language: "English" },
  { name: "Inspiring Woman", language: "English" },
  { name: "Campfire Narrator", language: "English" },
  { name: "TikTok Fashion Influencer", language: "English" },
  { name: "Colton Rivers", language: "English" },
  { name: "Inspiring Man", language: "English" },
  { name: "Terrence Bentley", language: "English" },
  { name: "Alice Bennett", language: "English" },
  { name: "Sitcom Girl", language: "English" },
  { name: "Unserious Movie Trailer Narrator", language: "English" },
  { name: "Big Dicky", language: "English" },
  { name: "English Children's Book Narrator", language: "English" },
  { name: "Spanish Instructor", language: "English" }, // ¡Ojo! Aunque el nombre dice "Spanish", es voz en inglés
  { name: "Fastidious Robo-Butler", language: "English" },

  // 🇪🇸 Español
  { name: "Daniela", language: "Spanish" },
  { name: "Emma", language: "Spanish" },
  { name: "Isabella", language: "Spanish" },
  { name: "Juan", language: "Spanish" },
  { name: "Leo", language: "Spanish" },
  { name: "Santiago", language: "Spanish" },
  { name: "La Anfitriona Radiante", language: "Spanish" },
];

const EMOTIONS = [
  { value: "", label: "Predeterminado" },
  { value: "joy", label: "Alegría 😊" },
  { value: "sadness", label: "Tristeza 😢" },
  { value: "anger", label: "Ira 😠" },
  { value: "calmness", label: "Calma 🧘" },
  { value: "surprise", label: "Sorpresa 😮" },
  { value: "fear", label: "Miedo 😨" },
  { value: "disgust", label: "Asco 🤢" },
  { value: "embarrassment", label: "Vergüenza 😳" },
];

export default function TTSClient() {
  const [text, setText] = useState("Hola, ¿cómo estás hoy?");
  const [voiceName, setVoiceName] = useState("Male English Actor");
  const [stylePreset, setStylePreset] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceName, stylePreset }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error desconocido");
      }
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo generar el audio");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Texto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Texto a convertir
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Escribe aquí tu mensaje..."
        />
      </div>

      {/* Voz */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Voz
        </label>
        <div className="relative">
          <select
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 appearance-none"
          >
            {VOICES.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.language})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Emoción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Emoción
        </label>
        <div className="relative">
          <select
            value={stylePreset}
            onChange={(e) => setStylePreset(e.target.value)}
            className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 appearance-none"
          >
            {EMOTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Botón */}
      <button
        onClick={handleGenerate}
        disabled={isLoading || !text.trim()}
        className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all ${
          isLoading || !text.trim()
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
        }`}
      >
        {isLoading ? "Generando audio..." : "🔊 Generar y reproducir"}
      </button>

      {/* Panel de emociones visual */}
      {stylePreset && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Emoción seleccionada
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                stylePreset === "joy" ? "bg-yellow-500" :
                stylePreset === "sadness" ? "bg-blue-500" :
                stylePreset === "anger" ? "bg-red-500" :
                stylePreset === "calmness" ? "bg-green-400" :
                stylePreset === "surprise" ? "bg-purple-500" :
                stylePreset === "fear" ? "bg-indigo-600" :
                stylePreset === "disgust" ? "bg-green-700" :
                stylePreset === "embarrassment" ? "bg-pink-400" :
                "bg-gray-500"
              }`}
            >
              {EMOTIONS.find(e => e.value === stylePreset)?.label.split(" ")[0] || "Predeterminado"}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Intensidad: alta
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}