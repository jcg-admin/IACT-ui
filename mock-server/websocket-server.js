/**
 * Mock WebSocket Server - IACT Dashboard
 * Simula un servidor WebSocket que envía datos en tiempo real
 * 
 * Uso: node mock-server/websocket-server.js
 * Se conecta en: ws://localhost:8080
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.WS_PORT || 8080;

// Crear servidor HTTP base
const server = http.createServer();

// Crear servidor WebSocket
const wss = new WebSocket.Server({ server });

// Datos de métricas iniciales
const metricsData = {
  users: { name: 'Users', value: 1234, change: 5.2 },
  revenue: { name: 'Revenue', value: 45600, change: 12.5 },
  conversions: { name: 'Conversions', value: 342, change: -2.3 },
  activeTime: { name: 'Avg. Session', value: 4.5, change: 8.1 }
};

// Datos de gráficos iniciales
const chartData = [
  { name: 'Jan', sales: 4000, users: 2400 },
  { name: 'Feb', sales: 3000, users: 1398 },
  { name: 'Mar', sales: 2000, users: 9800 },
  { name: 'Apr', sales: 2780, users: 3908 },
  { name: 'May', sales: 1890, users: 4800 },
  { name: 'Jun', sales: 2390, users: 3800 }
];

// Almacenar clientes conectados
const clients = new Set();

// Log helper
function log(msg, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${msg}`);
}

// Generar variación de datos (simular cambios reales)
function generateMetricVariation(baseValue, changePercent) {
  const variation = baseValue * (changePercent / 100);
  const newValue = baseValue + (Math.random() - 0.5) * variation * 2;
  return Math.max(0, Math.round(newValue * 100) / 100);
}

// Generar nuevas métricas
function generateNewMetrics() {
  const updated = { ...metricsData };
  
  Object.keys(updated).forEach(key => {
    updated[key].value = generateMetricVariation(
      updated[key].value,
      updated[key].change
    );
    updated[key].change = (Math.random() - 0.5) * 20;
  });
  
  return updated;
}

// Generar datos de gráfico actualizados
function generateChartData() {
  return chartData.map(point => ({
    ...point,
    sales: point.sales + Math.random() * 500 - 250,
    users: point.users + Math.random() * 200 - 100
  }));
}

// Manejar conexiones WebSocket
wss.on('connection', (ws, req) => {
  const clientId = req.socket.remoteAddress + ':' + req.socket.remotePort;
  clients.add(ws);
  
  log(`Client connected: ${clientId} (Total: ${clients.size})`, 'CONNECT');
  
  // Enviar datos iniciales
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      metrics: metricsData,
      charts: chartData,
      timestamp: new Date().toISOString()
    }
  }));
  
  // Heartbeat para mantener conexión viva
  let heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      }));
    }
  }, 30000);
  
  // Manejar mensajes del cliente
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      log(`Message from ${clientId}: ${data.type}`, 'MESSAGE');
      
      switch (data.type) {
        case 'pong':
          // Responder a heartbeat
          log(`Heartbeat response from ${clientId}`, 'PING');
          break;
          
        case 'subscribe':
          // Cliente se suscribe a actualizaciones
          ws.isSubscribed = true;
          ws.send(JSON.stringify({
            type: 'subscribed',
            channel: data.channel || 'metrics'
          }));
          break;
          
        case 'unsubscribe':
          ws.isSubscribed = false;
          break;
          
        default:
          log(`Unknown message type: ${data.type}`, 'WARN');
      }
    } catch (e) {
      log(`Error parsing message: ${e.message}`, 'ERROR');
    }
  });
  
  // Manejar cierre de conexión
  ws.on('close', () => {
    clients.delete(ws);
    clearInterval(heartbeatInterval);
    log(`Client disconnected: ${clientId} (Total: ${clients.size})`, 'DISCONNECT');
  });
  
  // Manejar errores
  ws.on('error', (error) => {
    log(`WebSocket error: ${error.message}`, 'ERROR');
    clients.delete(ws);
    clearInterval(heartbeatInterval);
  });
});

// Broadcast de actualizaciones a todos los clientes conectados
setInterval(() => {
  if (clients.size === 0) return;
  
  const metrics = generateNewMetrics();
  const charts = generateChartData();
  
  const message = JSON.stringify({
    type: 'metricsUpdate',
    data: {
      metrics,
      charts,
      timestamp: new Date().toISOString(),
      clientCount: clients.size
    }
  });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.isSubscribed !== false) {
      client.send(message);
    }
  });
  
  log(`Broadcast to ${clients.size} clients`, 'BROADCAST');
}, 2000); // Actualizar cada 2 segundos

// Iniciar servidor
server.listen(PORT, () => {
  log(`WebSocket Server running on ws://localhost:${PORT}`, 'START');
  log('Clientes pueden conectarse en ws://localhost:8080', 'INFO');
  log('Datos se actualizan cada 2 segundos', 'INFO');
  log('Press CTRL+C to stop', 'INFO');
});

// Manejo de errores del servidor
server.on('error', (error) => {
  log(`Server error: ${error.message}`, 'ERROR');
  if (error.code === 'EADDRINUSE') {
    log(`Port ${PORT} is already in use`, 'ERROR');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down server...', 'SHUTDOWN');
  
  // Cerrar todas las conexiones
  clients.forEach(client => {
    client.close();
  });
  
  // Cerrar servidor
  wss.close(() => {
    server.close(() => {
      log('Server stopped', 'SHUTDOWN');
      process.exit(0);
    });
  });
  
  // Forzar salida si toma demasiado tiempo
  setTimeout(() => {
    log('Force shutdown', 'SHUTDOWN');
    process.exit(1);
  }, 5000);
});

// Mostrar estadísticas cada 10 segundos
setInterval(() => {
  if (clients.size > 0) {
    log(`Active connections: ${clients.size}`, 'STATS');
  }
}, 10000);
