'use client';

// src/app/expressions/HumeClient.ts

export interface Emotion {
  name: string;
  score: number;
}

export interface FacePrediction {
  frame: number;
  time: number;
  bbox: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  emotions: Emotion[];
}

export interface HumeResponse {
  face?: {
    predictions: FacePrediction[];
  };
}

export class HumeWebSocketClient {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private onMessage: (data: HumeResponse) => void;
  private onError: (error: Event) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    apiKey: string,
    onMessage: (data: HumeResponse) => void,
    onError: (error: Event) => void
  ) {
    this.apiKey = apiKey;
    this.onMessage = onMessage;
    this.onError = onError;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // WebSocket con API key en query param (ya que los headers no son soportados en navegador)
      const wsUrl = `wss://api.hume.ai/v0/stream/models?apiKey=${this.apiKey}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket conectado a Hume.ai');
        this.reconnectAttempts = 0;
        
        // Configurar el modelo de facial expressions
        const config = {
          models: {
            face: {}
          }
        };
        
        this.ws?.send(JSON.stringify(config));
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError(error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.attemptReconnect();
      };
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect();
      }, 2000 * this.reconnectAttempts);
    }
  }

  sendFrame(base64Image: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        data: base64Image,
        models: {
          face: {}
        }
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}