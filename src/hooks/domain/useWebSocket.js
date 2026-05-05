import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getWebSocketService, resetWebSocketService } from '@services/websocketService';

/**
 * Custom hook para usar WebSocket en componentes React
 * Maneja conexión, desconexión, y eventos
 */
export const useWebSocket = (url, token, enabled = true) => {
  const wsRef = useRef(null);
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !url || !token) {
      return;
    }

    // Obtener o crear instancia WebSocket
    if (!wsRef.current) {
      wsRef.current = getWebSocketService(url);
    }

    const ws = wsRef.current;

    // Manejadores de eventos
    const handleOpen = () => {
      console.log('[useWebSocket] Connected');
      setIsReady(true);
      setError(null);
    };

    const handleClose = () => {
      console.log('[useWebSocket] Disconnected');
      setIsReady(false);
    };

    const handleError = (err) => {
      console.error('[useWebSocket] Error:', err);
      setError(err);
      setIsReady(false);
    };

    // Registrar listeners
    ws.on('open', handleOpen);
    ws.on('close', handleClose);
    ws.on('error', handleError);

    // Conectar si no está conectado
    if (!ws.isConnected()) {
      ws.connect(token).catch((err) => {
        console.error('[useWebSocket] Connection failed:', err);
        setError(err);
      });
    } else {
      setIsReady(true);
    }

    // Cleanup
    return () => {
      ws.off('open', handleOpen);
      ws.off('close', handleClose);
      ws.off('error', handleError);
    };
  }, [url, token, enabled]);

  /**
   * Enviar mensaje al servidor
   */
  const send = useCallback((type, payload) => {
    if (wsRef.current?.isConnected()) {
      wsRef.current.send(type, payload);
    } else {
      console.warn('[useWebSocket] Not connected, cannot send');
    }
  }, []);

  /**
   * Subscribirse a un evento
   */
  const subscribe = useCallback((event, callback) => {
    if (wsRef.current) {
      return wsRef.current.on(event, callback);
    }
    return () => {}; // No-op if no connection
  }, []);

  /**
   * Unsubscribirse de un evento
   */
  const unsubscribe = useCallback((event, callback) => {
    if (wsRef.current) {
      wsRef.current.off(event, callback);
    }
  }, []);

  /**
   * Obtener estado actual de la conexión
   */
  const getState = useCallback(() => {
    return wsRef.current?.getState() || {
      connected: false,
      attempts: 0,
    };
  }, []);

  /**
   * Desconectar y limpiar
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      resetWebSocketService();
      wsRef.current = null;
      setIsReady(false);
    }
  }, []);

  return {
    // State
    isReady,
    error,
    isConnected: wsRef.current?.isConnected() || false,
    // Methods
    send,
    subscribe,
    unsubscribe,
    getState,
    disconnect,
  };
};

export default useWebSocket;
