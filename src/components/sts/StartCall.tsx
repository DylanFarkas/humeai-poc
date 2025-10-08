// components/sts/startCall.tsx
"use client";

import { useEffect, useState } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { VoiceDesignClient, CustomVoice, EviConfig } from "@/app/voice-design/VoiceDesignClient";

type DeviceInfo = { deviceId: string; label: string };

export default function StartCall({ accessToken }: { accessToken: string }) {
  const { connect, disconnect, readyState } = useVoice();

  // Mic
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();

  // Configs
  const [configs, setConfigs] = useState<EviConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>(""); // "" = ninguna
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  // Voices
  const [voices, setVoices] = useState<CustomVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(""); // "" = ninguna
  const [loadingVoices, setLoadingVoices] = useState(false);

  // Cargar mics
  useEffect(() => {
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const all = await navigator.mediaDevices.enumerateDevices();
        const mics = all.filter(d => d.kind === "audioinput").map(d => ({
          deviceId: d.deviceId, label: d.label || "Microphone"
        }));
        setDevices(mics);
        if (!selectedDeviceId && mics[0]) setSelectedDeviceId(mics[0].deviceId);
      } catch { /* ignore */ }
    })();
  }, [selectedDeviceId]);

  // Cargar configs + voces
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY;
    if (!apiKey) return;
    const client = new VoiceDesignClient(apiKey);

    (async () => {
      try {
        setLoadingConfigs(true);
        const cfgs = await client.listEviConfigs();
        setConfigs(cfgs);
      } catch (e) {
        console.error("No se pudieron cargar las configs:", e);
      } finally {
        setLoadingConfigs(false);
      }
    })();

    (async () => {
      try {
        setLoadingVoices(true);
        const custom = await client.listVoices("CUSTOM_VOICE");
        setVoices(custom);
      } catch (e) {
        console.error("No se pudieron cargar las voces:", e);
      } finally {
        setLoadingVoices(false);
      }
    })();
  }, []);

  const isOpen = readyState === VoiceReadyState.OPEN;
  const isConnecting = readyState === VoiceReadyState.CONNECTING;
  const bothSelected = Boolean(selectedConfigId) && Boolean(selectedVoiceId);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="flex-shrink-0">Configuración EVI:</span>
        <select
          className="flex-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedConfigId}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedConfigId(val);
            if (val) {
              // Si se elige config, limpiar voz y deshabilitarla
              setSelectedVoiceId("");
            }
          }}
          disabled={loadingConfigs || Boolean(selectedVoiceId)} // bloquea si hay voz elegida
        >
          <option value="">Ninguna (usar defaults)</option>
          {configs.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="flex-shrink-0">Voz de EVI:</span>
        <select
          className="flex-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedVoiceId}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedVoiceId(val);
            if (val) {
              // Si se elige voz, limpiar config y deshabilitarla
              setSelectedConfigId("");
            }
          }}
          disabled={loadingVoices || Boolean(selectedConfigId)} // bloquea si hay config elegida
        >
          <option value="">Ninguna (la de la config)</option>
          {voices.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </label>


      {/* Selector Mic */}
      <label className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="flex-shrink-0">Micrófono:</span>
        <select
          className="flex-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
        >
          {devices.map(d => (
            <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
          ))}
        </select>
      </label>

      <div className="flex justify-center sm:justify-start">

        {!isOpen ? (
          <button
            disabled={isConnecting || !accessToken || bothSelected}
            onClick={async () => {
              if (bothSelected) {
                alert("Elige Config o Voz, no ambas.");
                return;
              }
              try {
                await connect({
                  auth: { type: "accessToken", value: accessToken },
                  ...(selectedConfigId ? { configId: selectedConfigId } : {}),
                  ...(selectedVoiceId ? { voiceId: selectedVoiceId } : {}),
                  ...(selectedDeviceId ? { captureDeviceId: selectedDeviceId } : {})
                });
              } catch (e) {
                console.error(e);
                alert("No se pudo iniciar la sesión de voz.");
              }
            }}
            className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-medium text-white"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={() => disconnect()}
            className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-6 py-2.5 text-sm font-medium text-white"
          >
            End Session
          </button>
        )}
      </div>
    </div>
  );
}
