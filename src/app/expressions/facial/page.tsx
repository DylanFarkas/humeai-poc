'use client';

import { useState, useEffect, useRef } from 'react';
import { HumeWebSocketClient, Emotion, HumeResponse } from './FacialClient';
import { useWebcam } from './useWebcam';
import { Video, VideoOff, Activity, Camera, ChartColumn, Laugh } from 'lucide-react';

export default function ExpressionsPage() {
  const {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    devices,
    selectedDeviceId,
    startWebcam,
    stopWebcam,
    captureFrame,
    changeCamera
  } = useWebcam();
  const [isConnected, setIsConnected] = useState(false);
  const [topEmotions, setTopEmotions] = useState<Emotion[]>([]);
  const [allEmotions, setAllEmotions] = useState<Emotion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceBbox, setFaceBbox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const humeClientRef = useRef<HumeWebSocketClient | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY;

    if (!apiKey) {
      console.error('API Key no configurada');
      return;
    }

    const client = new HumeWebSocketClient(
      apiKey,
      handleHumeResponse,
      handleHumeError
    );

    humeClientRef.current = client;

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
      client.disconnect();
    };
  }, []);

  const handleHumeResponse = (data: HumeResponse) => {
    //console.log('Hume Response:', data); // Debug
    if (data.face && data.face.predictions && data.face.predictions.length > 0) {
      const prediction = data.face.predictions[0];
      const emotions = prediction.emotions;

      // Guardar el bounding box
      //console.log('Bounding Box:', prediction.bbox); // Debug
      setFaceBbox(prediction.bbox);

      // Ordenar emociones por score
      const sortedEmotions = [...emotions].sort((a, b) => b.score - a.score);

      // Top 3 emociones
      setTopEmotions(sortedEmotions.slice(0, 3));

      // Todas las emociones
      setAllEmotions(sortedEmotions);

      setIsProcessing(false);
    } else {
      //console.log('No face detected'); // Debug
      // No se detectó cara
      setFaceBbox(null);
    }
  };

  const handleHumeError = (error: Event) => {
    console.error('Hume error:', error);
    setIsConnected(false);
  };

  const startAnalysis = async () => {
    if (!humeClientRef.current) return;

    try {
      await humeClientRef.current.connect();
      setIsConnected(true);
      await startWebcam();

      // Enviar frames cada 1000ms
      frameIntervalRef.current = setInterval(() => {
        if (humeClientRef.current?.isConnected()) {
          const frame = captureFrame();
          if (frame) {
            setIsProcessing(true);
            humeClientRef.current.sendFrame(frame);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting analysis:', error);
    }
  };

  const stopAnalysis = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    if (humeClientRef.current) {
      humeClientRef.current.disconnect();
    }

    stopWebcam();
    setIsConnected(false);
    setTopEmotions([]);
    setAllEmotions([]);
    setFaceBbox(null);
  };

  // Dibujar el bounding box en el canvas overlay
  useEffect(() => {
    if (!overlayCanvasRef.current || !videoRef.current) return;

    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const drawBoundingBox = () => {
      // Ajustar el tamaño del canvas al contenedor
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Limpiar el canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (faceBbox && video.videoWidth > 0 && video.videoHeight > 0) {
        // Las coordenadas vienen en píxeles del video original
        // Necesitamos escalarlas al tamaño del display
        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;

        // Calcular coordenadas escaladas
        const x = faceBbox.x * scaleX;
        const y = faceBbox.y * scaleY;
        const w = faceBbox.w * scaleX;
        const h = faceBbox.h * scaleY;

        //console.log('Drawing bbox:', { x, y, w, h, canvasWidth: canvas.width, canvasHeight: canvas.height }); // Debug

        // Dibujar el rectángulo principal
        ctx.strokeStyle = '#a855f7'; // Purple-500
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // Dibujar las esquinas decorativas
        const cornerLength = 25;
        ctx.strokeStyle = '#c084fc'; // Purple-400
        ctx.lineWidth = 4;

        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(x, y + cornerLength);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerLength, y);
        ctx.stroke();

        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(x + w - cornerLength, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + cornerLength);
        ctx.stroke();

        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(x, y + h - cornerLength);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + cornerLength, y + h);
        ctx.stroke();

        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(x + w - cornerLength, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w, y + h - cornerLength);
        ctx.stroke();

        // Agregar etiqueta "Face Detected"
        const labelY = y > 35 ? y - 10 : y + h + 20;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
        ctx.fillRect(x, labelY - 20, 120, 25);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Face Detected', x + 8, labelY);
      }

      if (isStreaming) {
        animationFrameId = requestAnimationFrame(drawBoundingBox);
      }
    };

    if (isStreaming) {
      // Esperar a que el video esté listo
      const checkVideoReady = () => {
        if (video.readyState >= 2) {
          drawBoundingBox();
        } else {
          setTimeout(checkVideoReady, 100);
        }
      };
      checkVideoReady();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [faceBbox, isStreaming, videoRef]);

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      <div className="relative mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700/50 dark:bg-gray-800/50 mb-6 transition-colors duration-300">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-purple-400 font-medium">Facial Expression Analysis</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4 transition-all duration-300">
            Expression Measurement
            <span className="block text-xl md:text-2xl text-purple-400 mt-2">Análisis Facial en Tiempo Real</span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Analiza expresiones faciales en tiempo real utilizando la tecnología avanzada de Hume AI.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-gray-300  dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur p-6 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Estado del streaming:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${isConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    Procesando...
                  </div>
                )}
              </div>

              {/* Video Container with Overlay */}
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden border-none" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Canvas overlay para el bounding box */}
                <canvas
                  ref={overlayCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ objectFit: 'cover' }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm">
                    <div className="text-center">
                      <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Cámara desactivada</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 transition-colors duration-300">
                  {error}
                </div>
              )}

              {/* Camera Selector */}
              {devices.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                    Seleccionar cámara
                  </label>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 transition-colors duration-300">
                    <Camera className="w-5 h-5 text-gray-400" />
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => changeCamera(e.target.value)}
                      className="flex-1 bg-transparent focus:outline-none cursor-pointer text-gray-700 dark:text-gray-300"
                    >
                      {devices.map((device) => (
                        <option
                          key={device.deviceId}
                          value={device.deviceId}
                          className="bg-white dark:bg-gray-800"
                        >
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                {!isStreaming ? (
                  <button
                    onClick={startAnalysis}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
                  >
                    <Video className="w-5 h-5" />
                    Iniciar Detección
                  </button>
                ) : (
                  <button
                    onClick={stopAnalysis}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 cursor-pointer"
                  >
                    <VideoOff className="w-5 h-5" />
                    Detener Análisis
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Emotions Display */}
          <div className="space-y-6">
            {/* Top Expressions */}
            <div className="rounded-3xl border border-gray-300 bg-gradient-to-br from-gray-100/80 to-gray-200/40 dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur p-6 transition-all duration-300">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4 transition-all duration-300">
                Top Expressions
              </h2>
              <div className="space-y-4">
                {topEmotions.map((emotion, index) => (
                  <div key={emotion.name} className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${index === 0 ? 'text-gray-700 dark:text-gray-300' :
                        index === 1 ? 'text-blue-500' :
                          'text-gray-500'
                        }`}>
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-sm ${index === 0 ? 'bg-purple-500' :
                          index === 1 ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {emotion.name.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {emotion.score.toFixed(2)}
                    </span>
                  </div>
                ))}
                {topEmotions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-2">
                      <Laugh className='w-6 h-6'/>
                    </div>
                    <p className="text-sm">Las emociones aparecerán aquí</p>
                  </div>
                )}
              </div>
            </div>

            {/* All Emotions Levels */}
            <div className="rounded-3xl border border-gray-300 bg-gradient-to-br from-gray-100/80 to-gray-200/40 dark:border-gray-800 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur p-6 transition-all duration-300">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4 transition-all duration-300">
                Expression Levels
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allEmotions.map((emotion) => (
                  <div key={emotion.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {emotion.name.toLowerCase()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {emotion.score.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${emotion.score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {allEmotions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-2">
                      <ChartColumn className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-center">Los niveles de expresión aparecerán aquí</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <footer className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-500 text-sm transition-colors duration-300">
            Powered by Hume AI • Facial Expression Technology
          </p>
        </footer>
      </div>
    </main>
  );
}