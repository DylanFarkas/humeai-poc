// app/tts/page.tsx
import TTSClient from "./TTSClient";

export default function TTSPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700/50 dark:bg-gray-800/50 mb-6 transition-colors duration-300">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Text-to-Speech</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4 transition-all duration-300">
            Text-to-Speech
            <span className="block text-xl md:text-2xl text-green-400 mt-2">Convierte texto en voz</span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Escribe un mensaje y escucha cómo lo dice tu asistente de IA.
          </p>
        </header>

        <div className="rounded-3xl border border-gray-300 dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-800/40 p-6 transition-all duration-300">
          <TTSClient />
        </div>

        <footer className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-500 text-sm transition-colors duration-300">
            Powered by Hume AI • Emotion Understanding Technology
          </p>
        </footer>
      </div>
    </main>
  );
}