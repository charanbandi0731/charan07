/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_FOOD = { x: 5, y: 5 };
const GAME_SPEED_MS = 120;

const TRACKS = [
  {
    title: "NEON_DRIFT.MP3",
    artist: "AI_GEN_ALPHA",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "CYBER_PULSE.WAV",
    artist: "AI_GEN_BETA",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "SYNTH_HORIZON.FLAC",
    artist: "AI_GEN_GAMMA",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function App() {
  // --- Snake Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [dir, setDir] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const dirRef = useRef(dir);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // --- Music Player State ---
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Game Logic ---
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDir(INITIAL_DIRECTION);
    dirRef.current = INITIAL_DIRECTION;
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    });
    setScore(0);
    setGameOver(false);
    setIsGamePaused(false);
    setGameStarted(true);
    
    // Auto-start music if not playing
    if (!isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isGamePaused || !gameStarted) return;

    setSnake(prev => {
      const head = prev[0];
      const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
        return prev;
      }

      // Self collision
      if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
        return prev;
      }

      const newSnake = [newHead, ...prev];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        let newFood;
        while (true) {
          newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          };
          // Ensure food doesn't spawn on snake
          if (!newSnake.some(s => s.x === newFood.x && s.y === newFood.y)) {
            break;
          }
        }
        setFood(newFood);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, gameOver, isGamePaused, gameStarted, score, highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dirRef.current.y !== 1) {
        dirRef.current = { x: 0, y: -1 };
      }
      if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dirRef.current.y !== -1) {
        dirRef.current = { x: 0, y: 1 };
      }
      if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dirRef.current.x !== 1) {
        dirRef.current = { x: -1, y: 0 };
      }
      if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dirRef.current.x !== -1) {
        dirRef.current = { x: 1, y: 0 };
      }
      if (e.key === 'p' || e.key === 'P') {
        setIsGamePaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED_MS);
    return () => clearInterval(interval);
  }, [moveSnake]);

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, [currentTrack, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  return (
    <div className="min-h-screen bg-black text-[#00ffff] font-pixel flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden uppercase">
      
      {/* Glitch Overlays */}
      <div className="static-overlay" />
      <div className="scanlines" />

      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center mb-6 z-10 gap-4 border-b-2 border-[#ff00ff] pb-4">
        <h1 className="text-4xl sm:text-5xl font-bold glitch" data-text="SYS.SNAKE_EXE">
          SYS.SNAKE_EXE
        </h1>
        
        <div className="flex gap-6 bg-black px-6 py-3 border-2 border-[#00ffff] shadow-[2px_2px_0px_#ff00ff]">
          <div className="flex flex-col items-center">
            <span className="text-xs text-[#ff00ff]">SCORE_</span>
            <span className="text-2xl font-bold">{score}</span>
          </div>
          <div className="w-px bg-[#00ffff]" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-[#ff00ff]">MAX_</span>
            <span className="text-2xl font-bold">{highScore}</span>
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex items-center justify-center z-10 w-full">
        <div 
          ref={gameAreaRef}
          className="relative bg-black glitch-container p-1"
          style={{
            width: 'min(90vw, 500px)',
            height: 'min(90vw, 500px)',
          }}
        >
          {/* Grid */}
          <div 
            className="w-full h-full grid bg-[#001111]"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {/* Render Snake */}
            {snake.map((segment, index) => (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                className={`${index === 0 ? 'bg-[#ffffff]' : 'bg-[#00ffff]'}`}
                style={{
                  gridColumnStart: segment.x + 1,
                  gridRowStart: segment.y + 1,
                  border: '1px solid #000'
                }}
              />
            ))}
            
            {/* Render Food */}
            <div
              className="bg-[#ff00ff]"
              style={{
                gridColumnStart: food.x + 1,
                gridRowStart: food.y + 1,
                border: '1px solid #000'
              }}
            />
          </div>

          {/* Overlays */}
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 border-4 border-[#ff00ff]">
              <h2 className="text-3xl font-bold mb-6 glitch" data-text="INITIALIZE?">INITIALIZE?</h2>
              <button 
                onClick={resetGame}
                className="px-8 py-3 bg-black text-[#00ffff] border-2 border-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-none font-bold text-xl shadow-[4px_4px_0px_#ff00ff] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                [ EXECUTE ]
              </button>
              <p className="mt-6 text-sm text-[#ff00ff]">INPUT: W A S D</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 border-4 border-[#ff00ff]">
              <h2 className="text-5xl font-bold text-[#ff00ff] mb-2 glitch" data-text="FATAL_ERR">FATAL_ERR</h2>
              <p className="text-xl mb-8">CYCLES: <span className="text-[#00ffff] font-bold">{score}</span></p>
              <button 
                onClick={resetGame}
                className="px-8 py-3 bg-black text-[#ff00ff] border-2 border-[#ff00ff] hover:bg-[#ff00ff] hover:text-black transition-none font-bold text-xl shadow-[4px_4px_0px_#00ffff] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                [ REBOOT ]
              </button>
            </div>
          )}

          {isGamePaused && !gameOver && gameStarted && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 border-4 border-[#00ffff]">
              <h2 className="text-4xl font-bold glitch" data-text="HALTED">HALTED</h2>
            </div>
          )}
        </div>
      </main>

      {/* Music Player */}
      <footer className="w-full max-w-4xl mt-8 z-10">
        <div className="bg-black border-2 border-[#00ffff] shadow-[4px_4px_0px_#ff00ff] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Track Info */}
          <div className="flex items-center gap-4 w-full sm:w-1/3">
            <div className="w-12 h-12 bg-black border-2 border-[#ff00ff] flex items-center justify-center flex-shrink-0 text-[#ff00ff] font-bold text-xl">
              {isPlaying ? '>>' : '||'}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold truncate text-sm sm:text-base text-[#00ffff]">
                {TRACKS[currentTrack].title}
              </h3>
              <p className="text-[#ff00ff] text-xs sm:text-sm truncate">
                {TRACKS[currentTrack].artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={prevTrack}
              className="px-3 py-1 border border-[#00ffff] hover:bg-[#00ffff] hover:text-black"
            >
              [PRV]
            </button>
            
            <button 
              onClick={togglePlay}
              className="px-4 py-2 border-2 border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black font-bold"
            >
              {isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}
            </button>
            
            <button 
              onClick={nextTrack}
              className="px-3 py-1 border border-[#00ffff] hover:bg-[#00ffff] hover:text-black"
            >
              [NXT]
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 w-full sm:w-1/3 justify-end">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-[#ff00ff] hover:text-[#00ffff]"
            >
              {isMuted || volume === 0 ? 'VOL:0' : 'VOL:' + Math.round(volume * 100)}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-24 sm:w-32"
            />
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef}
          src={TRACKS[currentTrack].url}
          onEnded={handleTrackEnd}
          preload="auto"
        />
      </footer>
    </div>
  );
}
