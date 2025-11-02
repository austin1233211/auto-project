/**
 * Global type declarations for browser globals used in the application
 */

declare global {
  interface Window {
    /**
     * Game server URL configured in index.html
     * Falls back to 'http://localhost:3001' if not set
     */
    GAME_SERVER_URL?: string;
    
    /**
     * Socket.io client library loaded from CDN
     * Available after socket.io client script loads
     */
    io?: (url: string, opts?: any) => any;
  }
}

export {};
