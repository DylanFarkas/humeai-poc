"use client";

import { VoiceProvider } from "@humeai/voice-react";
import StartCall from "@/components/sts/StartCall";
import EmotionMeter from "@/components/sts/EmotionMeter";
type Props = { accessToken: string };

export default function VoiceExpression({ accessToken }: Props) {
  return (
    <VoiceProvider>
      <div className="flex flex-col gap-6 max-w-full min-h-[72vh]">
        {/* Panel de control y acción (arriba) */}
        <div className="rounded-3xl border border-gray-300 dark:border-gray-800 backdrop-blur p-6 transition-all duration-300">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4 transition-all duration-300">
            Sesión de Voz
          </h2>
          <StartCall accessToken={accessToken} />
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Selecciona tu micrófono y presiona Start Session para iniciar el análisis.
          </div>
        </div>

        {/* Panel de emociones (debajo, prominente) */}
        <div className="flex-1 min-h-0 overflow-auto rounded-3xl border border-gray-300 dark:border-gray-800 backdrop-blur p-6 transition-all duration-300">
          <EmotionMeter variant="prominent" />
        </div>

      </div>
    </VoiceProvider>
  );
}
