// components/Chat.tsx
"use client";

import { VoiceProvider } from "@humeai/voice-react";
import Messages from "./Messages";
import StartCall from "./StartCall";
import StatusBar from "./StatusBar";
import EmotionMeter from "./EmotionMeter";

export default function Chat({ accessToken }: { accessToken: string }) {
  return (
    <VoiceProvider>
      <div className="flex flex-col lg:flex-row gap-6 h-[75vh] max-w-full overflow-hidden">
        {/* Panel principal de chat */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 rounded-3xl border border-gray-300 dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur p-6 transition-all duration-300 overflow-hidden">
          <StatusBar />
          <Messages />
          <StartCall accessToken={accessToken} />
        </div>
        
        {/* Panel de emociones */}
        <div className="w-full lg:w-64 lg:min-w-0 lg:flex-shrink-0 rounded-3xl border border-gray-300 dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur p-6 transition-all duration-300 overflow-hidden">
          <EmotionMeter />
        </div>
      </div>
    </VoiceProvider>
  );
}