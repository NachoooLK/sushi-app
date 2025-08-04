"use client";

import { useState } from "react";

export default function Home() {
  const [sushiCount, setSushiCount] = useState(0);

  const incrementSushi = () => {
    setSushiCount(prev => prev + 1);
  };

  const decrementSushi = () => {
    setSushiCount(prev => Math.max(0, prev - 1));
  };

  const resetSushi = () => {
    setSushiCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🍣</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Sushi Counter</h2>
          <p className="text-gray-500 mt-2">¿Cuántos sushis has comido hoy?</p>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-indigo-600 mb-4">
            {sushiCount}
          </div>
          <div className="text-sm text-gray-500">
            {sushiCount === 0 && "¡Empieza a contar!"}
            {sushiCount === 1 && "¡Un sushi!"}
            {sushiCount > 1 && `${sushiCount} sushis`}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={decrementSushi}
            disabled={sushiCount === 0}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            -1
          </button>
          <button
            onClick={incrementSushi}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            +1
          </button>
        </div>

        <button
          onClick={resetSushi}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Resetear
        </button>

        <div className="mt-8 text-center">
          <div className="text-xs text-gray-400">
            {sushiCount > 10 && "¡Eres un experto en sushi! 🍣"}
            {sushiCount > 5 && sushiCount <= 10 && "¡Buen apetito! 😋"}
            {sushiCount > 0 && sushiCount <= 5 && "¡Sigue así! 👍"}
          </div>
        </div>
      </div>
    </div>
  );
}
