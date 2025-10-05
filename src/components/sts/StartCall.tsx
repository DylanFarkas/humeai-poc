"use client";

import { useEffect, useMemo, useState } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";

type DeviceInfo = { deviceId: string; label: string };

export default function StartCall({ accessToken }: { accessToken: string }) {
  const { connect, disconnect, readyState } = useVoice();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lista de micrófonos disponibles (requiere permiso para ver label)
  useEffect(() => {
    async function loadDevices() {
      try {
        // Pedimos permiso de micrófono para obtener labels
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const all = await navigator.mediaDevices.enumerateDevices();
        const mics = all
          .filter(d => d.kind === "audioinput")
          .map(d => ({ deviceId: d.deviceId, label: d.label || "Microphone" }));
        setDevices(mics);
        // Selección por defecto
        if (!selectedDeviceId && mics[0]) setSelectedDeviceId(mics[0].deviceId);
      } catch (e) {
        // Si el usuario niega permiso, igual mostramos un mensaje
        setError("No se pudo acceder al micrófono. Revisa permisos del navegador.");
      }
    }
    loadDevices();
  }, [selectedDeviceId]);

  const isOpen = readyState === VoiceReadyState.OPEN;
  const isConnecting = readyState === VoiceReadyState.CONNECTING || connecting;

  const statusLabel = useMemo(() => {
    switch (readyState) {
      case VoiceReadyState.CONNECTING: return "Conectando…";
      case VoiceReadyState.OPEN:       return "Conectado";
      case VoiceReadyState.CLOSED:     return "Desconectado";
      default:                         return "Desconocido";
    }
  }, [readyState]);

  return (
    <div className="flex flex-col gap-4">
      {/* Status Indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors duration-300 ${
          isOpen 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : isConnecting 
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }`}>
          <span className={`inline-flex h-2 w-2 rounded-full ${
            isOpen ? "bg-emerald-400" : isConnecting ? "bg-amber-400" : "bg-gray-400"
          }`} />
          {statusLabel}
        </div>
        {error && (
          <span className="text-sm text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
            {error}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {/* Microphone Selector */}
        <label className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          <span className="flex-shrink-0">Micrófono:</span>
          <select
            className="flex-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
          >
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
            ))}
          </select>
        </label>

        {/* Action Buttons */}
        <div className="flex justify-center sm:justify-start">
          {!isOpen ? (
            <button
              disabled={isConnecting || !accessToken}
              onClick={async () => {
                setError(null);
                setConnecting(true);
                try {
                  await connect({
                    auth: { type: "accessToken", value: accessToken },
                    // captureDeviceId: selectedDeviceId,
                  });
                } catch (e) {
                  setError("No se pudo iniciar la sesión de voz.");
                } finally {
                  setConnecting(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 disabled:hover:scale-100 disabled:hover:shadow-none min-w-[140px]"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando…
                </>
              ) : (
                "Start Session"
              )}
            </button>
          ) : (
            <button
              onClick={() => disconnect()}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 min-w-[140px]"
            >
              End Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
}