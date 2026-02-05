'use client'

import { useState } from 'react'

interface Flashcard {
  front: string
  back: string
}

export default function QuizPlayer({ cards, onExit }: { cards: Flashcard[], onExit: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [finished, setFinished] = useState(false)

  const currentCard = cards[currentIndex]

  const handleNext = () => {
    setIsFlipped(false)
    if (currentIndex < cards.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300) // Small delay for reset
    } else {
      setFinished(true)
    }
  }

  const handlePrev = () => {
    setIsFlipped(false)
    if (currentIndex > 0) {
      setTimeout(() => setCurrentIndex(prev => prev - 1), 300)
    }
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-green-50 rounded-2xl border border-green-100 p-8 text-center animate-in zoom-in">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-900 mb-2">Quiz Complete!</h2>
        <p className="text-green-700 mb-6">You reviewed {cards.length} cards.</p>
        <button 
          onClick={onExit}
          className="px-6 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors"
        >
          Start Another Quiz
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Progress Bar */}
      <div className="flex justify-between text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">
        <span>Card {currentIndex + 1} / {cards.length}</span>
        <span>{Math.round(((currentIndex + 1) / cards.length) * 100)}% Complete</span>
      </div>
      <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-black h-full transition-all duration-500 ease-out" 
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* THE CARD (Click to Flip) */}
      <div 
        className="group h-80 w-full cursor-pointer"
        style={{ perspective: '1000px' }} // Perspective is crucial for 3D effect
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className="relative w-full h-full duration-500 transition-transform"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          
          {/* FRONT (Question) */}
          <div 
            className="absolute inset-0 bg-white border-2 border-black rounded-2xl flex flex-col items-center justify-center p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{ backfaceVisibility: 'hidden' }} // This prevents seeing the mirrored text
          >
            <span className="absolute top-4 left-4 text-xs font-bold bg-black text-white px-2 py-1 rounded">QUESTION</span>
            <p className="text-xl md:text-2xl font-medium text-center text-gray-900 leading-relaxed overflow-y-auto max-h-full">
              {currentCard.front}
            </p>
            <p className="absolute bottom-6 text-xs text-gray-400 font-medium animate-pulse">Click to flip ↺</p>
          </div>

          {/* BACK (Answer) */}
          <div 
            className="absolute inset-0 bg-black rounded-2xl flex flex-col items-center justify-center p-8 shadow-[8px_8px_0px_0px_rgba(100,100,100,0.2)]"
            style={{ 
              backfaceVisibility: 'hidden', 
              transform: 'rotateY(180deg)' // Pre-rotate the back so it looks correct when flipped
            }}
          >
            <span className="absolute top-4 left-4 text-xs font-bold bg-white text-black px-2 py-1 rounded">ANSWER</span>
            <p className="text-lg md:text-xl font-medium text-center text-white leading-relaxed overflow-y-auto max-h-full">
              {currentCard.back}
            </p>
          </div>

        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex justify-center gap-4 mt-10">
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
          disabled={currentIndex === 0}
          className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        
        {isFlipped ? (
          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="px-10 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg transition-all transform hover:scale-105"
          >
            {currentIndex === cards.length - 1 ? "Finish" : "Next Card →"}
          </button>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
            className="px-10 py-3 bg-gray-100 text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Show Answer
          </button>
        )}
      </div>

    </div>
  )
}