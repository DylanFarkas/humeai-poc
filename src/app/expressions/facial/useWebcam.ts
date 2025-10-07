'use client';

// src/app/expressions/useWebcam.ts
import { useRef, useEffect, useState } from 'react';

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
}

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);

  // Detectar todas las cámaras disponibles
  const getVideoDevices = async () => {
    try {
      // Primero solicitar permisos
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceInfos
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Cámara ${device.deviceId.slice(0, 8)}`
        }));
      
      setDevices(videoDevices);
      
      // Seleccionar la primera cámara por defecto
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting video devices:', err);
      setError('No se pudo acceder a las cámaras. Por favor, verifica los permisos.');
    }
  };

  const startWebcam = async (deviceId?: string) => {
    try {
      // Detener el stream anterior si existe
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId || selectedDeviceId ? 
            { exact: deviceId || selectedDeviceId } : 
            undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const changeCamera = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (isStreaming) {
      await startWebcam(deviceId);
    }
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    return base64Image;
  };

  useEffect(() => {
    getVideoDevices();
    
    // Escuchar cambios en dispositivos
    navigator.mediaDevices.addEventListener('devicechange', getVideoDevices);

    return () => {
      stopWebcam();
      navigator.mediaDevices.removeEventListener('devicechange', getVideoDevices);
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    devices,
    selectedDeviceId,
    startWebcam,
    stopWebcam,
    captureFrame,
    changeCamera,
    getVideoDevices
  };
}