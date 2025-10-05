// app/voice/page.tsx
import { fetchAccessToken } from "hume";
import ChatClient from "@/app/sts/ChatClient"; 

export default async function Page() {
  const accessToken = await fetchAccessToken({
    apiKey: String(process.env.HUME_API_KEY),
    secretKey: String(process.env.HUME_SECRET_KEY),
  });

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700/50 dark:bg-gray-800/50 mb-6 transition-colors duration-300">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-400 font-medium">Live Conversation</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4 transition-all duration-300">
            Speech-to-Speech
            <span className="block text-xl md:text-2xl text-blue-400 mt-2">Conversación con EVI</span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Presiona <span className="font-medium text-blue-400">Start Session</span> y habla con tu asistente de IA emocional en tiempo real.
          </p>
        </header>
        
        <div className="rounded-3xl border border-gray-300 border-none dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-800/40 p-6 transition-all duration-300">
          <ChatClient accessToken={accessToken} />
        </div>

        {/* Footer Note */}
        <footer className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-500 text-sm transition-colors duration-300">
            Powered by Hume AI • Emotion Understanding Technology
          </p>
        </footer>
      </div>
    </main>
  );
}