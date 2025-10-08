'use client';

// src/app/voice-design/VoiceDesignClient.ts

export interface VoiceGeneration {
  generation_id: string;
  duration: number;
  file_size: number;
  audio: string;
  snippets?: Record<string, unknown>[];
}

export interface EviConfig {
  id: string;
  name: string;
  description?: string;
}

export interface VoiceSynthesisResponse {
  request_id: string;
  generations: VoiceGeneration[];
}

export interface CustomVoice {
  id: string;
  name: string;
  description?: string;
  provider: string;
}

export class VoiceDesignClient {
  private apiKey: string;
  private baseUrl = 'https://api.hume.ai/v0/tts';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Genera muestras de voz basadas en texto y descripción
   */
  async generateVoiceSamples(
    text: string,
    description: string,
    numGenerations: number = 3
  ): Promise<VoiceSynthesisResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hume-Api-Key': this.apiKey,
      },
      body: JSON.stringify({
        utterances: [
          {
            text,
            description,
          },
        ],
        num_generations: numGenerations,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error generating voice: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Guarda una generación como voz personalizada
   */
  async saveCustomVoice(
    generationId: string,
    name: string,
    description?: string
  ): Promise<CustomVoice> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hume-Api-Key': this.apiKey,
      },
      body: JSON.stringify({
        generation_id: generationId,
        name,
        description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error saving voice: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Lista todas las voces personalizadas
   */
  async listAllCustomVoices(): Promise<CustomVoice[]> {
    let page = 0;
    const pageSize = 100;
    const acc: CustomVoice[] = [];

    while (true) {
      const res = await fetch(
        `${this.baseUrl}/voices?provider=CUSTOM_VOICE&page_number=${page}&page_size=${pageSize}`,
        { headers: { 'X-Hume-Api-Key': this.apiKey } }
      );
      if (!res.ok) throw new Error(`List voices failed: ${await res.text()}`);
      const data = await res.json();
      acc.push(...(data?.voices_page ?? []));
      if (page + 1 >= (data?.total_pages ?? 1)) break;
      page += 1;
    }
    return acc;
  }

  // VoiceDesignClient.ts
  async listVoices(provider: 'CUSTOM_VOICE' | 'HUME_AI', pageSize = 100) {
    let page = 0;
    const out: CustomVoice[] = [];
    while (true) {
      const res = await fetch(
        `${this.baseUrl}/voices?provider=${provider}&page_number=${page}&page_size=${pageSize}`,
        { headers: { 'X-Hume-Api-Key': this.apiKey } }
      );
      if (!res.ok) throw new Error(`List voices failed: ${await res.text()}`);
      const data = await res.json();
      out.push(...(data?.voices_page ?? []));
      if (page + 1 >= (data?.total_pages ?? 1)) break;
      page += 1;
    }
    return out;
  }

  async listEviConfigs(pageSize = 100): Promise<EviConfig[]> {
    const base = 'https://api.hume.ai/v0/evi';
    let page = 0;
    const out: EviConfig[] = [];

    while (true) {
      const res = await fetch(
        `${base}/configs?page_number=${page}&page_size=${pageSize}`,
        { headers: { 'X-Hume-Api-Key': this.apiKey } }
      );
      if (!res.ok) throw new Error(`List configs failed: ${await res.text()}`);
      const data = await res.json();

      // Soporta posibles formatos:
      const pageItems =
        Array.isArray(data) ? data :
          Array.isArray(data?.configs_page) ? data.configs_page :
            Array.isArray(data?.configs) ? data.configs :
              [];

      out.push(...pageItems);

      const totalPages =
        typeof data?.total_pages === 'number' ? data.total_pages :
          // si no hay paginación, rompe
          1;

      if (page + 1 >= totalPages) break;
      page += 1;

      // Si la API no usa total_pages pero devolvió array plano, también rompemos:
      if (Array.isArray(data) || Array.isArray(data?.configs)) break;
    }
    return out;
  }

  /**
   * Elimina una voz personalizada
   */
  // En VoiceDesignClient.ts
  async deleteCustomVoiceByName(name: string): Promise<void> {
    const url = `${this.baseUrl}/voices?name=${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'X-Hume-Api-Key': this.apiKey },
    });
    if (!res.ok) {
      throw new Error(`Error deleting voice: ${await res.text()}`);
    }
  }


  /**
   * Convierte audio base64 a blob para reproducción
   */
  base64ToBlob(base64: string, mimeType: string = 'audio/mp3'): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Crea una URL de audio reproducible desde base64
   */
  createAudioUrl(base64Audio: string): string {
    const blob = this.base64ToBlob(base64Audio);
    return URL.createObjectURL(blob);
  }
}