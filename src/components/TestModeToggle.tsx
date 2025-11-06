'use client';

import { useState, useEffect } from 'react';

export default function TestModeToggle() {
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    // Load test mode state from localStorage
    const savedMode = localStorage.getItem('testMode') === 'true';
    setTestMode(savedMode);
  }, []);

  const toggleTestMode = () => {
    const newMode = !testMode;
    setTestMode(newMode);
    localStorage.setItem('testMode', newMode.toString());
    
    // Show confirmation
    if (newMode) {
      alert('🧪 TEST MODE AKTIVERAT\n\nAlla telling tales, förbjudna ord och fraser kommer nu visas som Lorem Ipsum-text.\n\nReflesha sidan för att ändringen ska träda i kraft.');
    } else {
      alert('✅ TEST MODE INAKTIVERAT\n\nAlla telling tales, förbjudna ord och fraser visas nu korrekt.\n\nReflesha sidan för att ändringen ska träda i kraft.');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={toggleTestMode}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105 ${
          testMode
            ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
        title={testMode ? 'Test mode är aktivt - Lorem Ipsum används' : 'Test mode är inaktivt - Riktig text används'}
      >
        <span className="text-xl">{testMode ? '🧪' : '📝'}</span>
        <span className="text-sm">
          {testMode ? 'TEST MODE' : 'NORMAL MODE'}
        </span>
      </button>
      {testMode && (
        <div className="mt-2 bg-yellow-100 border-2 border-yellow-500 text-yellow-900 px-3 py-2 rounded text-xs max-w-xs">
          ⚠️ Test mode aktiv - Lorem Ipsum används istället för riktig speltext
        </div>
      )}
    </div>
  );
}
