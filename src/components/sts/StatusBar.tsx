"use client";

import { useMemo } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";

export default function StatusBar() {
  const { readyState } = useVoice();

  const badge = useMemo(() => {
    switch (readyState) {
      case VoiceReadyState.OPEN:
        return (
          <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-medium transition-colors duration-300">
            Conectado
          </span>
        );
      case VoiceReadyState.CONNECTING:
        return (
          <span className="rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 text-xs font-medium transition-colors duration-300">
            Conectando…
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 px-3 py-1 text-xs font-medium transition-colors duration-300">
            Desconectado
          </span>
        );
    }
  }, [readyState]);

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent transition-all duration-300">
            Sesión de Voz
          </h2>
          {badge}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">
          Consejo: Usa audífonos para evitar eco. Permite el micrófono cuando el navegador lo pida.
        </p>
      </div>
    </div>
  );
}