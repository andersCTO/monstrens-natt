'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function DisconnectionWarning() {
  const { isConnected, gameCode, phase } = useGameStore();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Only show warning if we're in an active game and lose connection
    if (!isConnected && gameCode && phase !== 'lobby') {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [isConnected, gameCode, phase]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-md w-full border-2 border-red-500">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Anslutning förlorad
          </h2>
          <p className="text-purple-200 mb-6">
            Din anslutning till servern har brutits. Dina uppgifter är sparade lokalt.
          </p>
          <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-4 mb-6">
            <p className="text-white text-sm">
              ✅ Din roll: <strong>Sparad</strong><br />
              ✅ Dina gissningar: <strong>Sparade</strong><br />
              🔄 Försöker återansluta...
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-yellow-300">
            <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
            <span className="text-sm">Återansluter automatiskt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
