// app/page.tsx
import Link from "next/link";
import { Mic, Speech, ScanFace } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      <div className="relative mx-auto max-w-6xl px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700/50 dark:bg-gray-800/50 mb-6 transition-colors duration-300">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-400 font-medium">AI Emotion Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-6 transition-all duration-300">
            Hume AI
            <span className="block text-2xl md:text-3xl text-emerald-400 mt-2">Expression Measurement Suite</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Experimenta el poder de la IA emocional con nuestras herramientas avanzadas de
            <span className="text-emerald-400 font-medium"> análisis de expresiones</span> en tiempo real.
          </p>
        </header>

        {/* Feature Cards */}
        <section className="grid gap-8 md:grid-cols-3 mb-20">
          <Link
            href="/tts"
            className="group relative overflow-hidden rounded-3xl border border-gray-300 dark:bg-gradient-to-br from-gray-100/80 to-gray-200/40 dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-800/40 p-8 hover:border-emerald-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/10"
          >
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Icon */}
            <div className="relative mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Mic className="w-6 h-6 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-3">Text-to-Speech</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed transition-colors duration-300">
              Convierte texto en audio con voces expresivas que capturan matices emocionales únicos.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-emerald-400 text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                Explorar herramienta →
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
            </div>
          </Link>

          <Link
            href="/sts"
            className="group relative overflow-hidden rounded-3xl border border-gray-300 dark:bg-gradient-to-br from-gray-100/80 to-gray-200/40 dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-800/40 p-8 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10"
          >
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"> </div>

            {/* Icon */}
            <div className="relative mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Speech className="w-6 h-6 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-3">Speech-to-Speech</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed transition-colors duration-300">
              Conversaciones en tiempo real con EVI, analizando emociones y respondiendo con empatía.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-blue-400 text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                Iniciar conversación →
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </Link>

          <Link
            href="/expressions"
            className="group relative overflow-hidden rounded-3xl border border-gray-300 dark:bg-gradient-to-br from-gray-100/80 to-gray-200/40 dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-800/40 p-8 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10"
          >
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Icon */}
            <div className="relative mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ScanFace className="w-6 h-6 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-3">Expression Measurement</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed transition-colors duration-300">
              Analiza expresiones faciales, tono de voz y texto para medir el estado emocional completo.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-purple-400 text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                Analizar emociones →
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
            </div>
          </Link>
        </section>

        {/* Footer Note */}
        <footer className="text-center mt-16">
          <p className="text-gray-500 dark:text-gray-500 text-sm transition-colors duration-300">
            Powered by Hume AI • Emotion Understanding Technology
          </p>
        </footer>
      </div>
    </main>
  );
}