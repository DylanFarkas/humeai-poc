'use client';

import { useState, useRef, useEffect } from 'react';
import { VoiceDesignClient, VoiceGeneration, CustomVoice } from './VoiceDesignClient';
import {
  Play,
  Pause,
  Save,
  Sparkles,
  Volume2,
  Trash2,
  Loader2
} from 'lucide-react';

export default function VoiceDesignPage() {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generations, setGenerations] = useState<VoiceGeneration[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const clientRef = useRef<VoiceDesignClient | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY;
    if (!apiKey) {
      console.error('API Key no configurada');
      return;
    }
    clientRef.current = new VoiceDesignClient(apiKey);
    loadCustomVoices();
  }, []);

  const loadCustomVoices = async () => {
    if (!clientRef.current) return;
    try {
      const voices = await clientRef.current.listAllCustomVoices();
      setCustomVoices(voices);
    } catch (error) {
      console.error('Error loading custom voices:', error);
    }
  };

  const handleGenerate = async () => {
    if (!clientRef.current || !text || !description) return;

    setIsGenerating(true);
    try {
      const response = await clientRef.current.generateVoiceSamples(
        text,
        description,
        3
      );
      setGenerations(response.generations);
      setSelectedGeneration(null);
    } catch (error) {
      console.error('Error generating voice:', error);
      alert('Error al generar voces. Por favor intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayAudio = (generationId: string, base64Audio: string) => {
    if (!clientRef.current) return;

    // Si ya está reproduciendo este audio, pausar
    if (playingAudio === generationId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
      return;
    }

    // Detener audio anterior si existe
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }

    // Crear nuevo audio
    const audioUrl = clientRef.current.createAudioUrl(base64Audio);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setPlayingAudio(null);
      URL.revokeObjectURL(audioUrl);
    };

    audio.play();
    audioRef.current = audio;
    setPlayingAudio(generationId);
  };

  const handleSelectGeneration = (generationId: string) => {
    setSelectedGeneration(generationId);
    setShowSaveModal(true);
  };

  const handleSaveVoice = async () => {
    if (!clientRef.current || !selectedGeneration || !voiceName) return;

    setIsSaving(true);
    try {
      await clientRef.current.saveCustomVoice(
        selectedGeneration,
        voiceName,
        voiceDescription
      );
      alert('¡Voz guardada exitosamente!');
      setShowSaveModal(false);
      setVoiceName('');
      setVoiceDescription('');
      setSelectedGeneration(null);
      loadCustomVoices();
    } catch (error) {
      console.error('Error saving voice:', error);
      alert('Error al guardar la voz. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVoice = async (voiceName: string) => {
    if (!clientRef.current) return;
    if (!confirm('¿Estás seguro de eliminar esta voz?')) return;

    try {
      await clientRef.current.deleteCustomVoiceByName(voiceName);
      await loadCustomVoices();
    } catch (error) {
      console.error('Error deleting voice:', error);
      alert('Error al eliminar la voz.');
    }
  };

  const examplePrompts = [
    {
      text: "Hume's AI voice generator is incredible, you can tell it exactly how you want the voice to sound.",
      description: "A confident, charismatic tech guru explaining new technology with infectious enthusiasm."
    },
    {
      text: "Welcome to our podcast, where we explore the fascinating world of artificial intelligence.",
      description: "A warm, professional podcast host with a friendly and engaging tone."
    },
    {
      text: "Breaking news: scientists have made a groundbreaking discovery in renewable energy.",
      description: "A news anchor with an authoritative, clear voice delivering important information."
    }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="relative mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-200 bg-yellow-50 dark:border-yellow-700/50 dark:bg-yellow-900/20 mb-6 transition-colors duration-300">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
              Voice Design Studio
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4 transition-all duration-300">
            Create Custom Voices
            <span className="block text-xl md:text-2xl text-yellow-400 mt-2">
              Diseña tu voz perfecta con IA
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Describe cómo quieres que suene tu voz y genera muestras personalizadas.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voice Creation Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input */}
            <div className="rounded-3xl border border-gray-300 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/80 dark:to-gray-800/40 p-6 transition-all duration-300">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2 transition-colors duration-300">
                Text to Speak
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Introduce el texto que quieres que diga la voz..."
                className="w-full h-24 px-4 py-3 text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:text-gray-100 resize-none transition-all duration-300"
              />
            </div>

            {/* Voice Description */}
            <div className="rounded-3xl border border-gray-300 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/80 dark:to-gray-800/40 p-6 transition-all duration-300">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Voice Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe cómo quieres que suene la voz: tono, estilo, emoción, personalidad..."
                className="w-full h-32 px-4 py-3 bg-white text-gray-800 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:text-gray-100 resize-none transition-all duration-300"
              />

              {/* Example Prompts */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">
                  Prueba estos ejemplos:
                </p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setText(prompt.text);
                        setDescription(prompt.description);
                      }}
                      className="text-xs cursor-pointer px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors duration-300"
                    >
                      Ejemplo {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !text || !description}
              className="w-full py-4 rounded-xl text-gray-700 bg-yellow-400 hover:bg-yellow-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-101 hover:shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generando muestras...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generar muestras
                </>
              )}
            </button>

            {/* Generated Samples */}
            {generations.length > 0 && (
              <div className="rounded-3xl border border-gray-300 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/80 dark:to-gray-800/40 p-6 transition-all duration-300">
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4 transition-all duration-300">
                  Muestras generadas
                </h2>
                <div className="space-y-3">
                  {generations.map((gen, index) => (
                    <div
                      key={gen.generation_id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handlePlayAudio(gen.generation_id, gen.audio)}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white flex items-center justify-center transition-all duration-300 hover:scale-105"
                        >
                          {playingAudio === gen.generation_id ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                          )}
                        </button>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                            Muestra {index + 1}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            {gen.duration.toFixed(1)}s • {(gen.file_size / 1024).toFixed(1)}KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectGeneration(gen.generation_id)}
                        className="cursor-pointer px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all duration-300 flex items-center gap-2 hover:scale-105"
                      >
                        <Save className="w-4 h-4" />
                        Guardar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* My Voices Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-300 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/80 dark:to-gray-800/40 p-6 transition-all duration-300">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4 flex items-center gap-2 transition-all duration-300">
                <Volume2 className="w-5 h-5 text-yellow-500" />
                Mis Voces
              </h2>

              {customVoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  <div className="text-2xl mb-2">🎵</div>
                  <p className="text-sm">No custom voices yet.</p>
                  <p className="text-xs mt-1">Generate and save your first voice!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {customVoices.map((voice) => (
                    <div
                      key={voice.id}
                      className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-yellow-300 dark:hover:border-yellow-400"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                            {voice.name}
                          </p>
                          {voice.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                              {voice.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteVoice(voice.name)}
                          className="text-red-500 hover:text-red-600 transition-colors duration-300 p-1 hover:scale-110 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <footer className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-500 text-sm transition-colors duration-300">
            Powered by Hume AI • Voice Design Technology
          </p>
        </footer>
      </div>

      {/* Save Voice Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-800 transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              Guardar voz personalizada
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Voice Name *
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="My Custom Voice"
                  className="w-full px-4 text-gray-700 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:text-gray-100 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Description (optional)
                </label>
                <textarea
                  value={voiceDescription}
                  onChange={(e) => setVoiceDescription(e.target.value)}
                  placeholder="Add notes about this voice..."
                  className="w-full h-20 px-4 py-2 text-gray-700 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:text-gray-100 resize-none transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setVoiceName('');
                  setVoiceDescription('');
                }}
                className="flex-1 px-4 py-2 rounded-lg cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVoice}
                disabled={isSaving || !voiceName}
                className="flex-1 px-4 py-2 rounded-lg cursor-pointer bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Voice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}