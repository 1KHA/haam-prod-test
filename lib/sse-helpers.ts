// SSE (Server-Sent Events) Helpers

/**
 * Map to store active SSE connections
 * Key: userId
 * Value: Array of controller objects to emit events to connected clients
 */
type SseControllerMap = Map<
  string,
  { controller: ReadableStreamDefaultController<Uint8Array>; lastEventId?: string }[]
>;

/**
 * Global map to track active SSE connections per user
 * This allows us to emit events to specific users when their permissions change
 */
export const sseConnections: SseControllerMap = new Map();

/**
 * Register an SSE controller for a user
 * @param userId User ID
 * @param controller ReadableStream controller
 * @param lastEventId Last event ID for resuming stream
 */
export function registerSseController(
  userId: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  lastEventId?: string
) {
  if (!sseConnections.has(userId)) {
    sseConnections.set(userId, []);
  }
  sseConnections.get(userId)?.push({ controller, lastEventId });
  console.log(`SSE: Registered controller for user ${userId}, total connections: ${sseConnections.get(userId)?.length}`);
}

/**
 * Unregister an SSE controller for a user
 * @param userId User ID
 * @param controller ReadableStream controller to remove
 */
export function unregisterSseController(
  userId: string,
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  const userControllers = sseConnections.get(userId);
  if (userControllers) {
    const newControllers = userControllers.filter(c => c.controller !== controller);
    if (newControllers.length === 0) {
      sseConnections.delete(userId);
      console.log(`SSE: Removed last controller for user ${userId}`);
    } else {
      sseConnections.set(userId, newControllers);
      console.log(`SSE: Removed controller for user ${userId}, remaining: ${newControllers.length}`);
    }
  }
}

/**
 * Emit a permission refresh event for a specific user
 * This will notify all connected clients for that user to refresh their permissions
 * 
 * @param userId User ID to send refresh event to
 * @param options Optional parameters for the event
 * @returns Promise that resolves once event has been emitted
 */
export async function emitPermissionsRefresh(
  userId: string,
  options: { includeConnectedUsers?: boolean } = {}
): Promise<void> {
  const { includeConnectedUsers = false } = options;
  
  try {
    console.log(`SSE: Emitting permissions refresh for user ${userId}`);
    
    const encoder = new TextEncoder();
    const message = {
      event: 'force-permissions-refresh',
      data: {
        userId,
        timestamp: new Date().toISOString()
      }
    };
    
    const encodedMessage = encoder.encode(`event: ${message.event}\ndata: ${JSON.stringify(message.data)}\n\n`);
    
    // Emit to the specific user
    const userControllers = sseConnections.get(userId);
    if (userControllers?.length) {
      console.log(`SSE: Sending to ${userControllers.length} active connections for user ${userId}`);
      for (const { controller } of userControllers) {
        try {
          controller.enqueue(encodedMessage);
        } catch (error) {
          console.error(`SSE: Error emitting to user ${userId}:`, error);
          // We'll handle cleanup in the main SSE handler
        }
      }
    } else {
      console.log(`SSE: No active connections for user ${userId}`);
    }
    
    // If we should also emit to connected users (e.g. admins/managers who need to see updated permissions)
    if (includeConnectedUsers) {
      console.log(`SSE: Broadcasting permissions refresh for user ${userId} to all connected users`);
      
      // Emit to all connected users (useful for admins who are viewing user details)
      // Using Array.from to avoid TypeScript iterator issues
      Array.from(sseConnections.entries()).forEach(([connectedUserId, controllers]) => {
        if (connectedUserId !== userId) {
          const broadcastMessage = {
            event: 'user-permissions-changed',
            data: {
              changedUserId: userId,
              timestamp: new Date().toISOString()
            }
          };
          
          const encodedBroadcast = encoder.encode(
            `event: ${broadcastMessage.event}\ndata: ${JSON.stringify(broadcastMessage.data)}\n\n`
          );
          
          controllers.forEach(({ controller }) => {
            try {
              controller.enqueue(encodedBroadcast);
            } catch (error) {
              console.error(`SSE: Error broadcasting to user ${connectedUserId}:`, error);
            }
          });
        }
      });
    }
  } catch (error) {
    console.error(`SSE: Error emitting permissions refresh for user ${userId}:`, error);
  }
}

/**
 * Broadcast a system-wide message to all connected clients
 * @param event Event name
 * @param data Event data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function broadcastSystemMessage(event: string, data: any): void {
  const encoder = new TextEncoder();
  const message = encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  
  console.log(`SSE: Broadcasting system message: ${event} to all users`);
  
  // Send to all connected clients
  // Using Array.from to avoid TypeScript iterator issues
  Array.from(sseConnections.entries()).forEach(([userId, controllers]) => {
    controllers.forEach(({ controller }) => {
      try {
        controller.enqueue(message);
      } catch (error) {
        console.error(`SSE: Error broadcasting to user ${userId}:`, error);
      }
    });
  });
}
