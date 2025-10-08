"use client";

import { useEffect, useMemo, useRef } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";

interface MessageInput {
  message?: string | { 
    content?: string; 
    text?: string; 
    models?: {
      [key: string]: {
        scores?: Record<string, unknown>;
        predictions?: Array<{ emotions?: Record<string, unknown> }>;
        [key: string]: unknown;
      };
    };
    scores?: Record<string, unknown>;
    [key: string]: unknown;
  };
  content?: string;
  text?: string;
  type?: string;
  models?: {
    [key: string]: {
      scores?: Record<string, unknown>;
      predictions?: Array<{ emotions?: Record<string, unknown> }>;
      [key: string]: unknown;
    };
  };
  scores?: Record<string, unknown>;
  prosody?: {
    predictions?: Array<{ emotions?: Record<string, unknown> }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

type NormalizedMsg = {
  role: "assistant" | "user" | "system" | "other";
  text: string;
  type: string;
  originalMessage?: MessageInput;
};

export default function Messages() {
  const { messages, readyState } = useVoice();

  const endRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Índice donde empieza la sesión actual (baseline de corte)
  const sessionStartRef = useRef<number>(0);
  const prevStateRef = useRef<VoiceReadyState | null>(null);

  // --- Gestión de límites por sesión ---
  useEffect(() => {
    const prev = prevStateRef.current;
    const curr = readyState;

    // CLOSED -> CONNECTING: marcar baseline ANTES de que llegue el primer mensaje de la nueva sesión
    if (curr === VoiceReadyState.CONNECTING && prev !== VoiceReadyState.CONNECTING) {
      sessionStartRef.current = messages.length;
      // reset de scroll visual al iniciar sesión
      setTimeout(() => {
        containerRef.current?.scrollTo({ top: 0, behavior: "auto" });
      }, 0);
    }

    // Al cerrar sesión, avanzar baseline al final (vista vacía)
    if (curr === VoiceReadyState.CLOSED && prev !== VoiceReadyState.CLOSED) {
      sessionStartRef.current = messages.length;
      // opcional: llevar scroll arriba
      setTimeout(() => {
        containerRef.current?.scrollTo({ top: 0, behavior: "auto" });
      }, 0);
    }

    prevStateRef.current = curr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState]); // intencional: no dependas de messages

  // --- Autoscroll cuando llegan nuevos mensajes de la sesión actual ---
  useEffect(() => {
    if (messages.length > 0) {
      endRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [messages]);

  // --- Helpers de texto/rol ---
  const getText = (m: MessageInput): string => {
    if (typeof m?.message === "string") return m.message;
    if (typeof m?.content === "string") return m.content;
    if (typeof m?.text === "string") return m.text;

    if (typeof m?.message?.content === "string") return m.message.content;
    if (typeof m?.message?.text === "string") return m.message.text;

    if (m?.message && typeof m.message === "object") {
      try {
        return JSON.stringify(m.message);
      } catch {
        return "";
      }
    }
    return "";
  };

  const getRole = (type: string): NormalizedMsg["role"] => {
    const t = type?.toLowerCase?.() ?? "";
    if (t.includes("assistant")) return "assistant";
    if (t.includes("user")) return "user";
    if (t.includes("system")) return "system";
    return "other";
  };

  // --- Normalización de emociones ---
  function normalizeToMap(input: unknown): Record<string, number> {
    if (!input) return {};
    if (Array.isArray(input)) {
      const out: Record<string, number> = {};
      for (const e of input) {
        if (e && typeof e.name === "string" && typeof e.score === "number") {
          out[e.name] = e.score;
        }
      }
      return out;
    }
    if (typeof input === "object") {
      const out: Record<string, number> = {};
      for (const [k, v] of Object.entries(input)) {
        const n = Number(v);
        if (!Number.isNaN(n)) out[k] = n;
      }
      return out;
    }
    return {};
  }

  function extractEmotions(message: MessageInput): Record<string, number> {
    const messageObj = typeof message.message === 'object' ? message.message : null;
    
    const candidates = [
      // Prosodia en vivo (rutas comunes)
      message?.models?.prosody?.scores,
      messageObj?.models?.prosody?.scores,
      message?.models?.prosody?.predictions?.[0]?.emotions,
      messageObj?.models?.prosody?.predictions?.[0]?.emotions,
      message?.prosody?.predictions?.[0]?.emotions,

      // Otros modelos
      message?.models?.face?.scores,
      message?.models?.burst?.scores,

      // Plano
      message?.scores,
      messageObj?.scores,
    ];

    for (const c of candidates) {
      const mapped = normalizeToMap(c);
      if (Object.keys(mapped).length) return mapped;
    }

    // Barrido por modelos si vinieron raros
    if (message?.models && typeof message.models === "object") {
      let agg: Record<string, number> = {};
      for (const model of Object.values(message.models)) {
        const mapped = normalizeToMap(model?.scores);
        if (Object.keys(mapped).length) agg = { ...agg, ...mapped };
      }
      if (Object.keys(agg).length) return agg;
    }

    return {};
  }

  const getEmotionBadges = (message: MessageInput) => {
    const emotions = extractEmotions(message);
    const topEmotions = Object.entries(emotions)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 2);

    if (topEmotions.length === 0) return null;

    return (
      <div className="flex gap-1 mt-2">
        {topEmotions.map(([emotion, score]) => (
          <span
            key={emotion}
            className={`text-xs px-1.5 py-0.5 rounded text-white transition-colors duration-300 ${
              emotion.toLowerCase().includes("joy") ||
              emotion.toLowerCase().includes("happy")
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : emotion.toLowerCase().includes("sad") ||
                  emotion.toLowerCase().includes("sorrow")
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : emotion.toLowerCase().includes("anger") ||
                  emotion.toLowerCase().includes("angry")
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
            }`}
            title={`${emotion}: ${(score as number).toFixed(2)}`}
          >
            {emotion.split("_")[0]}
          </span>
        ))}
      </div>
    );
  };

  // --- Construcción de mensajes visibles solo para la sesión actual ---
  const normalized: NormalizedMsg[] = useMemo(() => {
    // buffer de 1 para cubrir carreras raras al pasar a CONNECTING/OPEN
    const start = Math.max(0, sessionStartRef.current - 1);
    const current = messages.slice(start);

    return current
      .map((m: unknown): NormalizedMsg => {
        const message = m as MessageInput;
        const rawType = String(message?.type ?? "unknown");
        const text = getText(message);
        const role = getRole(rawType);
        return { role, text, type: rawType, originalMessage: message };
      })
      .filter((m) => m.text.trim().length > 0);
  }, [messages]);

  const showEmpty =
    readyState !== VoiceReadyState.OPEN && normalized.length === 0;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border bg-white/50 dark:bg-gray-900/60 backdrop-blur transition-colors duration-300
                        border-gray-300 dark:border-gray-700`}
    >
      <div ref={containerRef} className="h-[50vh] overflow-y-auto p-4 space-y-3">
        {showEmpty && (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8 transition-colors duration-300">
            Aún no hay mensajes. Inicia la sesión y empieza a hablar.
          </div>
        )}

        {normalized.map((m, i) => (
          <div
            key={m.type + i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-lg transition-all duration-300
                ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20"
                    : m.role === "assistant"
                    ? "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-100 shadow-gray-500/10 dark:shadow-gray-900/20"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/70 dark:to-gray-700/70 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                }`}
            >
              {m.text}
              {m.role === "user" && m.originalMessage && getEmotionBadges(m.originalMessage)}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </section>
  );
}
