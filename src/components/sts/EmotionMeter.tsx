// components/EmotionMeter.tsx
"use client";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { useEffect, useState } from "react";

interface EmotionScores {
  [key: string]: number;
}

interface UserState {
  emotions: EmotionScores;
  timestamp: number;
}

export default function EmotionMeter({ variant = 'default' }: { variant?: 'default' | 'prominent' }) {
  const { messages, readyState } = useVoice();
  const [userState, setUserState] = useState<UserState>({
    emotions: {},
    timestamp: Date.now()
  });

  // Resetear emociones cuando la sesión se cierra
  useEffect(() => {
    if (readyState === VoiceReadyState.CLOSED) {
      setUserState({
        emotions: {},
        timestamp: Date.now()
      });
    }
  }, [readyState]);

  // Procesar mensajes para extraer emociones
  useEffect(() => {
    if (readyState === VoiceReadyState.CLOSED) return;

    const userMessages = messages.filter((msg: any) => 
      msg.type.toLowerCase().includes("user") || 
      msg.type.toLowerCase().includes("user_message")
    );

    if (userMessages.length > 0) {
      const latestUserMessage = userMessages[userMessages.length - 1];
      
      const emotions = extractEmotions(latestUserMessage);
      
      if (Object.keys(emotions).length > 0) {
        setUserState({
          emotions,
          timestamp: Date.now()
        });
      }
    }
  }, [messages, readyState]);

  const extractEmotions = (message: any): EmotionScores => {
    const emotions: EmotionScores = {};
    
    if (message.models?.prosody?.scores) {
      return message.models.prosody.scores;
    }
    
    if (message.models?.face?.scores) {
      return message.models.face.scores;
    }
    
    if (message.models?.burst?.scores) {
      return message.models.burst.scores;
    }
    
    if (message.scores) {
      return message.scores;
    }
    
    if (message.models) {
      Object.values(message.models).forEach((model: any) => {
        if (model.scores) {
          Object.assign(emotions, model.scores);
        }
      });
    }
    
    return emotions;
  };

  // Ordenar emociones por score (mayor a menor) y tomar las top 5
  const topEmotions = Object.entries(userState.emotions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Función para formatear el nombre de la emoción
  const formatEmotionName = (emotion: string): string => {
    return emotion.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Función para obtener el color basado en la emoción
  const getEmotionColor = (emotion: string): string => {
    const emotionColors: { [key: string]: string } = {
      'admiration': 'bg-blue-500',
      'adoration': 'bg-pink-500',
      'aesthetic': 'bg-purple-500',
      'amusement': 'bg-yellow-500',
      'anger': 'bg-red-500',
      'annoyance': 'bg-orange-500',
      'anxiety': 'bg-indigo-500',
      'awe': 'bg-purple-600',
      'awkwardness': 'bg-gray-500',
      'boredom': 'bg-gray-400',
      'calmness': 'bg-green-400',
      'concentration': 'bg-blue-400',
      'confusion': 'bg-yellow-600',
      'contempt': 'bg-orange-600',
      'contentment': 'bg-green-300',
      'craving': 'bg-red-400',
      'desire': 'bg-pink-400',
      'disappointment': 'bg-blue-600',
      'disgust': 'bg-green-600',
      'distress': 'bg-red-600',
      'doubt': 'bg-yellow-700',
      'ecstasy': 'bg-pink-600',
      'embarrassment': 'bg-red-300',
      'empathic pain': 'bg-purple-400',
      'enthusiasm': 'bg-orange-400',
      'entrancement': 'bg-purple-300',
      'envy': 'bg-green-700',
      'excitement': 'bg-orange-500',
      'fear': 'bg-indigo-600',
      'gratitude': 'bg-blue-300',
      'guilt': 'bg-red-700',
      'horror': 'bg-indigo-700',
      'interest': 'bg-teal-500',
      'joy': 'bg-yellow-400',
      'love': 'bg-pink-300',
      'neutral': 'bg-gray-300',
      'nostalgia': 'bg-purple-500',
      'pain': 'bg-red-500',
      'pride': 'bg-orange-300',
      'realization': 'bg-teal-400',
      'relief': 'bg-green-500',
      'romance': 'bg-pink-500',
      'sadness': 'bg-blue-700',
      'sarcasm': 'bg-yellow-500',
      'satisfaction': 'bg-green-200',
      'sexual desire': 'bg-red-400',
      'shame': 'bg-red-800',
      'surprise': 'bg-teal-600',
      'sympathy': 'bg-blue-400',
      'tiredness': 'bg-gray-600',
      'triumph': 'bg-orange-700'
    };
    
    return emotionColors[emotion.toLowerCase()] || 'bg-gray-500';
  };

  const isSessionClosed = readyState === VoiceReadyState.CLOSED;

  return (
    <div className={`h-full flex flex-col ${variant === 'prominent' ? 'lg:p-1' : ''}`}>
      <h3 className={`${variant === 'prominent' 
          ? 'text-2xl md:text-3xl' 
          : 'text-xl'} font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4 transition-all duration-300`}>
        Expression Measurement
      </h3>
      
      <div className="flex-1 space-y-4">
        {isSessionClosed ? (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
            <div className="text-center">
              <div className="mb-2 text-2xl">🔴</div>
              <div>Sesión finalizada</div>
              <div className="text-xs mt-1">Inicia una nueva sesión para ver emociones</div>
            </div>
          </div>
        ) : topEmotions.length > 0 ? (
          <>
            {/* Timestamp */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
              {new Date(userState.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            
            {/* Lista de emociones */}
            <div className={`${variant === 'prominent' ? 'space-y-4' : 'space-y-3'}`}>
              {topEmotions.map(([emotion, score]) => (
                <div key={emotion} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 capitalize transition-colors duration-300">
                      {formatEmotionName(emotion)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 font-mono transition-colors duration-300">
                      {score.toFixed(2)}
                    </span>
                  </div>
                  <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${variant === 'prominent' ? 'h-3' : 'h-2'} transition-colors duration-300`}>
                    <div
                      className={`${variant === 'prominent' ? 'h-3' : 'h-2'} rounded-full ${getEmotionColor(emotion)} transition-all duration-500 ease-out`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Indicador visual adicional */}
            <div className={`${variant === 'prominent' ? 'mt-8 p-5' : 'mt-6 p-4'} bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300`}>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                Emotional State
              </div>
              <div className="flex flex-wrap gap-1">
                {topEmotions.slice(0, 3).map(([emotion, score]) => (
                  <div
                    key={emotion}
                    className={`px-2 py-1 rounded-full text-xs ${getEmotionColor(emotion)} text-white font-medium transition-all duration-300`}
                  >
                    {formatEmotionName(emotion).split(' ')[0]}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
            <div className="text-center">
              <div className="mb-2 text-2xl">🎭</div>
              <div>Las emociones aparecerán aquí</div>
              <div className="text-xs mt-1">Habla para ver el análisis</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer informativo */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
          {isSessionClosed 
            ? "Sesión finalizada - Hume AI" 
            : "Análisis en tiempo real mediante Hume AI"
          }
        </div>
      </div>
    </div>
  );
}