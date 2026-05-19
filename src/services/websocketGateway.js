/**
 * WebSocketService - Gestor de conexiones WebSocket
 * Maneja conexión, reconexión, heartbeat, y broadcasting de mensajes
 */
class WebSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.token = null;
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect(token) {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = token ? `${this.url}?token=${token}` : this.url;
        this.socket = new WebSocket(wsUrl);
        this.token = token;

        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.socket.onopen = () => {
          clearTimeout(timeout);
          console.debug('[WebSocket] Connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('open');
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.emit('message', message);
            this.emit(message.type, message.data || message);
          } catch (e) {
            console.error('[WebSocket] Parse error:', e);
          }
        };

        this.socket.onerror = (error) => {
          clearTimeout(timeout);
          console.error('[WebSocket] Error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.socket.onclose = () => {
          console.debug('[WebSocket] Disconnected');
          this.stopHeartbeat();
          this.emit('close');
          this.attemptReconnect();
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Enviar mensaje al servidor
   */
  send(type, payload = {}) {
    if (this.isConnected()) {
      const message = { type, ...payload };
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Not connected, message not sent');
    }
  }

  /**
   * Subscribirse a un tipo de evento
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Retornar función para unsubscribirse
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribirse de un evento
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  /**
   * Emitir evento internamente
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`[WebSocket] Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Iniciar heartbeat (ping cada 30 segundos)
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send('ping');
    }, 30000);
  }

  /**
   * Detener heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Intentar reconexión con exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      this.emit('maxReconnectReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.debug(`[WebSocket] Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect(this.token);
    }, delay);
  }

  /**
   * Desconectar
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Obtener estado actual
   */
  getState() {
    return {
      connected: this.isConnected(),
      attempts: this.reconnectAttempts,
      url: this.url,
    };
  }
}

// Singleton instance
let wsInstance = null;

export const getWebSocketService = (url) => {
  if (!wsInstance) {
    wsInstance = new WebSocketService(url);
  }
  return wsInstance;
};

export const resetWebSocketService = () => {
  if (wsInstance) {
    wsInstance.disconnect();
    wsInstance = null;
  }
};

export default WebSocketService;
