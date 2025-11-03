'use client';

import { useGameStore } from '@/store/gameStore';

export default function ConnectionStatus() {
  const { isConnected, connectionError } = useGameStore();

  if (isConnected && !connectionError) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold">Ansluten</span>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm font-semibold">Anslutning misslyckades</span>
          </div>
          <p className="text-xs opacity-90">{connectionError}</p>
          <p className="text-xs opacity-75 mt-1">Återansluter...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-yellow-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold">Ansluter...</span>
        </div>
      </div>
    );
  }

  return null;
}
