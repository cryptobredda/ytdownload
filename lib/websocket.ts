import { WebSocket } from 'ws';
import { DownloadProgress, PlaylistDownloadTask, DownloadTask } from '@/lib/ytdlp';

// Store active connections
const clients = new Set<WebSocket>();

// Store active tasks
const activeTasks = new Map<string, DownloadTask | PlaylistDownloadTask>();

export function setupWebSocket(wss: any) {
  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(ws, data);
      } catch (error) {
        console.error('Invalid message from client:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    // Send current tasks to new client
    ws.send(JSON.stringify({
      type: 'tasks_update',
      tasks: Array.from(activeTasks.values()),
    }));
  });
}

function handleClientMessage(ws: WebSocket, data: any) {
  // Handle client messages if needed
  console.log('Received from client:', data);
}

export function broadcastProgress(progress: DownloadProgress) {
  const message = JSON.stringify({
    type: 'download_progress',
    data: progress,
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function broadcastTaskUpdate() {
  const message = JSON.stringify({
    type: 'tasks_update',
    tasks: Array.from(activeTasks.values()),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function addTask(task: DownloadTask | PlaylistDownloadTask) {
  activeTasks.set(task.id, task);
  broadcastTaskUpdate();
}

export function updateTask(taskId: string, updates: Partial<DownloadTask | PlaylistDownloadTask>) {
  const task = activeTasks.get(taskId);
  if (task) {
    Object.assign(task, updates);
    broadcastTaskUpdate();
  }
}

export function getTask(taskId: string): DownloadTask | PlaylistDownloadTask | undefined {
  return activeTasks.get(taskId);
}

export function getAllTasks(): (DownloadTask | PlaylistDownloadTask)[] {
  return Array.from(activeTasks.values());
}

export function removeTask(taskId: string) {
  activeTasks.delete(taskId);
  broadcastTaskUpdate();
}

export { clients, activeTasks };
