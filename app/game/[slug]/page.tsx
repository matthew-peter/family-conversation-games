'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getGame } from '@/lib/games';
import { DATA, TabooCard } from '@/lib/data';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaEye, FaRedo, FaCheck, FaTimes, FaPlay, FaUsers, FaLightbulb, FaCog, FaBan, FaForward } from 'react-icons/fa';

// Taboo settings type
type TabooSettings = {
  turnLength: number;
  rounds: number;
  freeSkips: number;
  skipPenalty: number;
  buzzerPenalty: number;
  selectedCategories: string[];
};

const DEFAULT_TABOO_SETTINGS: TabooSettings = {
  turnLength: 60,
  rounds: 4,
  freeSkips: 3,
  skipPenalty: -1,
  buzzerPenalty: -1,
  selectedCategories: [], // empty means all
};

// Team game settings type (for charades, pictionary, neanderthal)
type TeamSettings = {
  turnLength: number;
  rounds: number;
  freeSkips: number;
  selectedCategories: string[];
};

const DEFAULT_TEAM_SETTINGS: TeamSettings = {
  turnLength: 60,
  rounds: 4,
  freeSkips: 3,
  selectedCategories: [], // empty means all
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  
  const slug = params?.slug as string;
  const game = getGame(slug);

  // -- STATE --
  const [currentData, setCurrentData] = useState<any>(null);
  const [revealed, setRevealed] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  
  // Taboo State
  const [tabooSettings, setTabooSettings] = useState<TabooSettings>(DEFAULT_TABOO_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [timer, setTimer] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [skipsUsed, setSkipsUsed] = useState(0);
  const [turnScore, setTurnScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Team Game State (for charades, pictionary, neanderthal)
  const [teamSettings, setTeamSettings] = useState<TeamSettings>(DEFAULT_TEAM_SETTINGS);
  const [teamGameStarted, setTeamGameStarted] = useState(false);
  const [teamScoreA, setTeamScoreA] = useState(0);
  const [teamScoreB, setTeamScoreB] = useState(0);
  const [teamCurrentTeam, setTeamCurrentTeam] = useState<'A' | 'B'>('A');
  const [teamTimer, setTeamTimer] = useState(60);
  const [teamIsPlaying, setTeamIsPlaying] = useState(false);
  const [teamCurrentRound, setTeamCurrentRound] = useState(1);
  const [teamSkipsUsed, setTeamSkipsUsed] = useState(0);
  const [teamTurnScore, setTeamTurnScore] = useState(0);
  const [teamGameOver, setTeamGameOver] = useState(false);
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  const teamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Category selection for different games
  const [selectedIcebreakerCategories, setSelectedIcebreakerCategories] = useState<string[]>([]);
  const [selectedCharadesCategories, setSelectedCharadesCategories] = useState<string[]>([]);
  const [selectedPictionaryCategories, setSelectedPictionaryCategories] = useState<string[]>([]);

  // Get all taboo cards based on selected categories
  const tabooCards = useMemo(() => {
    const tabooData = DATA.taboo;
    const categories = tabooSettings.selectedCategories.length > 0 
      ? tabooSettings.selectedCategories 
      : Object.keys(tabooData.categories);
    
    const cards: TabooCard[] = [];
    categories.forEach(catKey => {
      const category = tabooData.categories[catKey];
      if (category) {
        cards.push(...category.cards);
      }
    });
    return cards;
  }, [tabooSettings.selectedCategories]);

  // Get all icebreaker questions based on selected categories
  const icebreakerQuestions = useMemo(() => {
    const icebreakerData = DATA.icebreaker;
    const categories = selectedIcebreakerCategories.length > 0 
      ? selectedIcebreakerCategories 
      : Object.keys(icebreakerData.categories);
    
    const questions: string[] = [];
    categories.forEach(catKey => {
      const category = icebreakerData.categories[catKey];
      if (category) {
        questions.push(...category.questions);
      }
    });
    return questions;
  }, [selectedIcebreakerCategories]);

  // Get all charades prompts based on selected categories
  const charadesPrompts = useMemo(() => {
    const charadesData = DATA.charades;
    const categories = selectedCharadesCategories.length > 0 
      ? selectedCharadesCategories 
      : Object.keys(charadesData.categories);
    
    const prompts: string[] = [];
    categories.forEach(catKey => {
      const category = charadesData.categories[catKey];
      if (category) {
        prompts.push(...category.prompts);
      }
    });
    return prompts;
  }, [selectedCharadesCategories]);

  // Get all pictionary words based on selected categories
  const pictionaryWords = useMemo(() => {
    const pictionaryData = DATA.pictionary;
    const categories = selectedPictionaryCategories.length > 0 
      ? selectedPictionaryCategories 
      : Object.keys(pictionaryData.categories);
    
    const words: string[] = [];
    categories.forEach(catKey => {
      const category = pictionaryData.categories[catKey];
      if (category) {
        words.push(...category.words);
      }
    });
    return words;
  }, [selectedPictionaryCategories]);

  // Get team game words based on game type and selected categories
  const teamGameWords = useMemo(() => {
    if (!game) return [];
    
    if (game.teamGameType === 'charades') {
      const cats = teamSettings.selectedCategories.length > 0 
        ? teamSettings.selectedCategories 
        : Object.keys(DATA.charades.categories);
      const prompts: string[] = [];
      cats.forEach(catKey => {
        const category = DATA.charades.categories[catKey];
        if (category) prompts.push(...category.prompts);
      });
      return prompts;
    }
    
    if (game.teamGameType === 'pictionary') {
      const cats = teamSettings.selectedCategories.length > 0 
        ? teamSettings.selectedCategories 
        : Object.keys(DATA.pictionary.categories);
      const words: string[] = [];
      cats.forEach(catKey => {
        const category = DATA.pictionary.categories[catKey];
        if (category) words.push(...category.words);
      });
      return words;
    }
    
    if (game.teamGameType === 'neanderthal') {
      // Use contact data, filter to longer words
      const contactData = DATA.contact as string[];
      return contactData.filter(word => word.length >= 6);
    }
    
    return [];
  }, [game, teamSettings.selectedCategories]);

  // Timer effect for Taboo
  useEffect(() => {
    if (isPlaying && timer > 0) {
      intervalRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && isPlaying) {
      endTurn();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, timer]);

  // Timer effect for Team Games
  useEffect(() => {
    if (teamIsPlaying && teamTimer > 0) {
      teamIntervalRef.current = setInterval(() => setTeamTimer((t) => t - 1), 1000);
    } else if (teamTimer === 0 && teamIsPlaying) {
      endTeamTurn();
    }
    return () => {
      if (teamIntervalRef.current) clearInterval(teamIntervalRef.current);
    };
  }, [teamIsPlaying, teamTimer]);

  // Generate new card for Taboo
  const generateCard = useCallback(() => {
    if (!game?.dataKey) return;
    setCardKey(prev => prev + 1);
    
    if (game.id === 'taboo' && tabooCards.length > 0) {
      const randomItem = tabooCards[Math.floor(Math.random() * tabooCards.length)];
      setCurrentData(randomItem);
      return;
    }
    
    // Fallback for other games
    const list = DATA[game.dataKey as keyof typeof DATA];
    if (list && Array.isArray(list) && list.length > 0) {
      const randomItem = list[Math.floor(Math.random() * list.length)];
      setCurrentData(randomItem);
    }
  }, [game, tabooCards]);

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScoreA(0);
    setScoreB(0);
    setCurrentRound(1);
    setCurrentTeam('A');
  };

  // Start a turn
  const startTurn = () => {
    setTimer(tabooSettings.turnLength);
    setSkipsUsed(0);
    setTurnScore(0);
    setIsPlaying(true);
    generateCard();
  };

  // End turn and switch teams
  const endTurn = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Add turn score to team
    if (currentTeam === 'A') {
      setScoreA(s => s + turnScore);
    } else {
      setScoreB(s => s + turnScore);
    }
    
    setCurrentData(null);
    
    // Check if round is over (both teams played)
    if (currentTeam === 'B') {
      if (currentRound >= tabooSettings.rounds) {
        setGameOver(true);
      } else {
        setCurrentRound(r => r + 1);
        setCurrentTeam('A');
      }
    } else {
      setCurrentTeam('B');
    }
  };

  // Handle correct answer
  const handleCorrect = () => {
    setTurnScore(s => s + 1);
    generateCard();
  };

  // Handle skip
  const handleSkip = () => {
    if (skipsUsed < tabooSettings.freeSkips) {
      // Free skip
      setSkipsUsed(s => s + 1);
    } else {
      // Penalty skip
      setTurnScore(s => s + tabooSettings.skipPenalty);
    }
    generateCard();
  };

  // Handle buzzer (said forbidden word)
  const handleBuzzer = () => {
    setTurnScore(s => s + tabooSettings.buzzerPenalty);
    generateCard();
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setIsPlaying(false);
    setCurrentData(null);
    setScoreA(0);
    setScoreB(0);
    setCurrentRound(1);
    setCurrentTeam('A');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // -- TEAM GAME FUNCTIONS --
  
  // Generate new word for team games
  const generateTeamWord = useCallback(() => {
    if (teamGameWords.length === 0) return;
    setCardKey(prev => prev + 1);
    const randomItem = teamGameWords[Math.floor(Math.random() * teamGameWords.length)];
    setCurrentData(randomItem);
  }, [teamGameWords]);

  // Start team game
  const startTeamGame = () => {
    setTeamGameStarted(true);
    setTeamGameOver(false);
    setTeamScoreA(0);
    setTeamScoreB(0);
    setTeamCurrentRound(1);
    setTeamCurrentTeam('A');
  };

  // Start a team turn
  const startTeamTurn = () => {
    setTeamTimer(teamSettings.turnLength);
    setTeamSkipsUsed(0);
    setTeamTurnScore(0);
    setTeamIsPlaying(true);
    generateTeamWord();
  };

  // End team turn
  const endTeamTurn = () => {
    setTeamIsPlaying(false);
    if (teamIntervalRef.current) clearInterval(teamIntervalRef.current);
    
    if (teamCurrentTeam === 'A') {
      setTeamScoreA(s => s + teamTurnScore);
    } else {
      setTeamScoreB(s => s + teamTurnScore);
    }
    
    setCurrentData(null);
    
    if (teamCurrentTeam === 'B') {
      if (teamCurrentRound >= teamSettings.rounds) {
        setTeamGameOver(true);
      } else {
        setTeamCurrentRound(r => r + 1);
        setTeamCurrentTeam('A');
      }
    } else {
      setTeamCurrentTeam('B');
    }
  };

  // Team correct answer
  const handleTeamCorrect = () => {
    setTeamTurnScore(s => s + 1);
    generateTeamWord();
  };

  // Team skip
  const handleTeamSkip = () => {
    if (teamSkipsUsed < teamSettings.freeSkips) {
      setTeamSkipsUsed(s => s + 1);
    } else {
      setTeamTurnScore(s => s - 1);
    }
    generateTeamWord();
  };

  // Reset team game
  const resetTeamGame = () => {
    setTeamGameStarted(false);
    setTeamGameOver(false);
    setTeamIsPlaying(false);
    setCurrentData(null);
    setTeamScoreA(0);
    setTeamScoreB(0);
    setTeamCurrentRound(1);
    setTeamCurrentTeam('A');
    if (teamIntervalRef.current) clearInterval(teamIntervalRef.current);
  };

  // -- MAIN DATA HANDLER (for non-Taboo games) --
  const handleGenerate = useCallback(() => {
    if (!game) return;
    setRevealed(false);
    setCardKey(prev => prev + 1);

    // Special handling for ice-breaker with categories
    if (game.id === 'ice-breaker') {
      if (icebreakerQuestions.length > 0) {
        const randomItem = icebreakerQuestions[Math.floor(Math.random() * icebreakerQuestions.length)];
        setCurrentData(randomItem);
      }
      return;
    }

    // Special handling for charades with categories
    if (game.id === 'charades') {
      if (charadesPrompts.length > 0) {
        const randomItem = charadesPrompts[Math.floor(Math.random() * charadesPrompts.length)];
        setCurrentData(randomItem);
      }
      return;
    }

    // Special handling for pictionary with categories
    if (game.id === 'pictionary') {
      if (pictionaryWords.length > 0) {
        const randomItem = pictionaryWords[Math.floor(Math.random() * pictionaryWords.length)];
        setCurrentData(randomItem);
      }
      return;
    }

    if (game.dataKey) {
      const data = DATA[game.dataKey as keyof typeof DATA];
      
      // Handle array data (riddles, lateral, contact, categories)
      if (Array.isArray(data) && data.length > 0) {
        let randomItem = data[Math.floor(Math.random() * data.length)];
        if (game.id === 'neanderthal') {
          let attempts = 0;
          while (typeof randomItem === 'string' && randomItem.length < 6 && attempts < 20) {
            randomItem = data[Math.floor(Math.random() * data.length)];
            attempts++;
          }
        }
        setCurrentData(randomItem);
      } else {
        // Data might be categorized or another format
        alert(`No data found for ${game.name}`);
      }
    }
  }, [game, icebreakerQuestions, charadesPrompts, pictionaryWords]);


  // -- RENDER GUARD --
  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-6">
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Game Not Found</h1>
        <p className="text-gray-500 mb-6">"{slug}" doesn't exist</p>
        <button
          onClick={() => router.push('/')}
          className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      
      {/* Header */}
      <header className={`${game.color} text-white px-4 py-4 flex items-center gap-3 shadow-lg sticky top-0 z-10 safe-area-inset-top`}>
        <button
          onClick={() => router.push('/')}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Go back"
        >
          <FaArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{game.name}</h1>
          <p className="text-white/70 text-xs truncate">{game.description}</p>
        </div>
        <div className="p-2 bg-white/20 rounded-xl">
          <game.icon size={20} />
        </div>
      </header>


      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-lg mx-auto w-full">
        
          {/* RULES MODE */}
          {game.mode === 'rules' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${game.color} text-white`}>
                    <FaLightbulb size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">How to Play</h2>
                </div>
                <ul className="p-5 space-y-4">
                  {game.rulesText?.map((rule, i) => (
                    <li key={i} className={`flex gap-3 animate-slide-up stagger-${i + 1}`}>
                      <span className={`font-black text-lg ${game.color.replace('bg-', 'text-')}`}>
                        {i + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">No phone needed to play—just follow the rules above!</p>
              </div>
            </div>
          )}

          {/* TABOO MODE */}
          {game.mode === 'taboo' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* SETTINGS SCREEN */}
              {!gameStarted && !gameOver && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-800">Game Settings</h2>
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <FaCog size={18} />
                      </button>
                    </div>
                    
                    {showSettings && (
                      <div className="p-4 space-y-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Turn Length</span>
                          <select
                            value={tabooSettings.turnLength}
                            onChange={(e) => setTabooSettings(s => ({...s, turnLength: Number(e.target.value)}))}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2"
                          >
                            <option value={30}>30 sec</option>
                            <option value={45}>45 sec</option>
                            <option value={60}>60 sec</option>
                            <option value={90}>90 sec</option>
                            <option value={120}>2 min</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Rounds</span>
                          <select
                            value={tabooSettings.rounds}
                            onChange={(e) => setTabooSettings(s => ({...s, rounds: Number(e.target.value)}))}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2"
                          >
                            <option value={2}>2 rounds</option>
                            <option value={3}>3 rounds</option>
                            <option value={4}>4 rounds</option>
                            <option value={5}>5 rounds</option>
                            <option value={6}>6 rounds</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Free Skips per Turn</span>
                          <select
                            value={tabooSettings.freeSkips}
                            onChange={(e) => setTabooSettings(s => ({...s, freeSkips: Number(e.target.value)}))}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2"
                          >
                            <option value={0}>None</option>
                            <option value={1}>1 skip</option>
                            <option value={2}>2 skips</option>
                            <option value={3}>3 skips</option>
                            <option value={5}>5 skips</option>
                            <option value={99}>Unlimited</option>
                          </select>
                        </div>
                      </div>
                    )}
                    
                    {!showSettings && (
                      <div className="p-4 text-sm text-gray-500 space-y-1">
                        <p>⏱️ {tabooSettings.turnLength} seconds per turn</p>
                        <p>🔄 {tabooSettings.rounds} rounds (each team plays {tabooSettings.rounds} times)</p>
                        <p>⏭️ {tabooSettings.freeSkips === 99 ? 'Unlimited' : tabooSettings.freeSkips} free skips, then -1 per skip</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Category Selection */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h2 className="text-lg font-bold text-gray-800">Categories</h2>
                      <p className="text-sm text-gray-500">Choose which word types to include</p>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-2">
                      {Object.entries(DATA.taboo.categories).map(([key, category]) => {
                        const isSelected = tabooSettings.selectedCategories.length === 0 || 
                                          tabooSettings.selectedCategories.includes(key);
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setTabooSettings(s => {
                                const current = s.selectedCategories;
                                if (current.length === 0) {
                                  // All were selected, now select only this one's opposite
                                  const allKeys = Object.keys(DATA.taboo.categories);
                                  return {...s, selectedCategories: allKeys.filter(k => k !== key)};
                                } else if (current.includes(key)) {
                                  // Deselect this one (but keep at least one)
                                  const newSelection = current.filter(k => k !== key);
                                  return {...s, selectedCategories: newSelection.length > 0 ? newSelection : []};
                                } else {
                                  // Add this one
                                  return {...s, selectedCategories: [...current, key]};
                                }
                              });
                            }}
                            className={`p-3 rounded-xl text-left transition-all ${
                              isSelected 
                                ? 'bg-purple-100 border-2 border-purple-500 text-purple-800' 
                                : 'bg-gray-50 border-2 border-transparent text-gray-400'
                            }`}
                          >
                            <span className="text-lg mr-2">{category.emoji}</span>
                            <span className="font-medium text-sm">{category.name}</span>
                            <div className="text-xs opacity-60 mt-1">{category.cards.length} cards</div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="px-4 pb-4">
                      <p className="text-xs text-gray-400 text-center">
                        {tabooSettings.selectedCategories.length === 0 ? 'All' : tabooSettings.selectedCategories.length} categories selected ({tabooCards.length} cards)
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={startGame}
                    className={`w-full ${game.color} text-white py-4 rounded-2xl text-xl font-bold shadow-lg flex items-center justify-center gap-3`}
                  >
                    <FaPlay /> Start Game
                  </button>
                </div>
              )}

              {/* GAME OVER SCREEN */}
              {gameOver && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-2xl font-black text-gray-800 mb-2">Game Over!</h2>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${scoreA > scoreB ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50'}`}>
                        <div className="text-sm font-bold text-gray-500">Team A</div>
                        <div className="text-4xl font-black text-blue-600">{scoreA}</div>
                        {scoreA > scoreB && <div className="text-sm text-blue-600 font-bold mt-1">🎉 Winner!</div>}
                      </div>
                      <div className={`p-4 rounded-xl ${scoreB > scoreA ? 'bg-orange-100 ring-2 ring-orange-500' : 'bg-gray-50'}`}>
                        <div className="text-sm font-bold text-gray-500">Team B</div>
                        <div className="text-4xl font-black text-orange-600">{scoreB}</div>
                        {scoreB > scoreA && <div className="text-sm text-orange-600 font-bold mt-1">🎉 Winner!</div>}
                      </div>
                    </div>
                    {scoreA === scoreB && <p className="mt-4 text-gray-600 font-bold">It's a tie!</p>}
                  </div>
                  <button
                    onClick={resetGame}
                    className={`${game.color} text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg`}
                  >
                    Play Again
                  </button>
                </div>
              )}

              {/* ACTIVE GAME */}
              {gameStarted && !gameOver && (
                <>
                  {/* Scoreboard */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                    <div className="text-center text-xs text-gray-400 mb-2">
                      Round {currentRound} of {tabooSettings.rounds}
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className={`text-center p-3 rounded-xl ${currentTeam === 'A' ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50'}`}>
                        <div className="text-xs font-bold text-gray-400 uppercase">Team A</div>
                        <div className="text-3xl font-black text-blue-600">{scoreA}</div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`text-4xl font-mono font-black tabular-nums ${timer <= 10 ? 'timer-warning' : 'text-gray-700'}`}>
                          {timer}
                        </div>
                        <div className="text-xs text-gray-400">seconds</div>
                      </div>
                      
                      <div className={`text-center p-3 rounded-xl ${currentTeam === 'B' ? 'bg-orange-100 ring-2 ring-orange-500' : 'bg-gray-50'}`}>
                        <div className="text-xs font-bold text-gray-400 uppercase">Team B</div>
                        <div className="text-3xl font-black text-orange-600">{scoreB}</div>
                      </div>
                    </div>
                  </div>

                  {/* Turn Score & Skips */}
                  {isPlaying && (
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="bg-white px-4 py-2 rounded-full shadow-sm">
                        <span className="text-gray-500">This turn:</span>{' '}
                        <span className={`font-bold ${turnScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {turnScore >= 0 ? '+' : ''}{turnScore}
                        </span>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-full shadow-sm">
                        <span className="text-gray-500">Skips:</span>{' '}
                        <span className="font-bold text-gray-700">
                          {skipsUsed}/{tabooSettings.freeSkips === 99 ? '∞' : tabooSettings.freeSkips}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Waiting to Start Turn */}
                  {!isPlaying && (
                    <div className="text-center py-8">
                      <div className={`inline-block px-4 py-2 rounded-full text-white font-bold mb-4 ${currentTeam === 'A' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                        Team {currentTeam}'s Turn
                      </div>
                      <p className="text-gray-500 mb-6">
                        Get ready! One person describes, others guess.
                      </p>
                      <button
                        onClick={startTurn}
                        className={`${game.color} text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-lg inline-flex items-center gap-3`}
                      >
                        <FaPlay /> Start Turn
                      </button>
                    </div>
                  )}

                  {/* Active Card */}
                  {isPlaying && currentData && (
                    <div key={cardKey} className="animate-scale-in">
                      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
                        <div className={`${game.color} text-white p-4 text-center`}>
                          <h2 className="text-2xl font-black uppercase tracking-wide">
                            {currentData.target}
                          </h2>
                        </div>
                        <div className="p-4 bg-red-50">
                          <p className="text-xs text-red-400 uppercase font-bold mb-3 text-center">
                            🚫 Do Not Say
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {currentData.forbidden?.map((word: string, i: number) => (
                              <div key={word} className="text-center py-2 px-4 bg-white rounded-lg border border-red-100 text-red-800 font-bold">
                                {word}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <button
                          onClick={handleSkip}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-3 rounded-2xl flex flex-col items-center font-bold transition-colors"
                        >
                          <FaForward size={20} />
                          <span className="text-xs mt-1">
                            Skip {skipsUsed >= tabooSettings.freeSkips && tabooSettings.freeSkips !== 99 ? '(-1)' : ''}
                          </span>
                        </button>
                        <button
                          onClick={handleBuzzer}
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-3 rounded-2xl flex flex-col items-center font-bold transition-colors"
                        >
                          <FaBan size={20} />
                          <span className="text-xs mt-1">Taboo! (-1)</span>
                        </button>
                        <button
                          onClick={handleCorrect}
                          className="bg-green-100 hover:bg-green-200 text-green-600 p-3 rounded-2xl flex flex-col items-center font-bold transition-colors"
                        >
                          <FaCheck size={20} />
                          <span className="text-xs mt-1">Got It! (+1)</span>
                        </button>
                      </div>
                      
                      <button
                        onClick={endTurn}
                        className="w-full mt-4 text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
                      >
                        End Turn Early
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TEAM MODE (Charades, Pictionary, Neanderthal) */}
          {game.mode === 'team' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* SETTINGS SCREEN */}
              {!teamGameStarted && !teamGameOver && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-800">Game Settings</h2>
                      <button
                        onClick={() => setShowTeamSettings(!showTeamSettings)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <FaCog size={18} />
                      </button>
                    </div>
                    
                    {showTeamSettings && (
                      <div className="p-4 space-y-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Turn Length</span>
                          <select
                            value={teamSettings.turnLength}
                            onChange={(e) => setTeamSettings(s => ({...s, turnLength: Number(e.target.value)}))}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2"
                          >
                            <option value={30}>30 sec</option>
                            <option value={45}>45 sec</option>
                            <option value={60}>60 sec</option>
                            <option value={90}>90 sec</option>
                            <option value={120}>2 min</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Rounds</span>
                          <select
                            value={teamSettings.rounds}
                            onChange={(e) => setTeamSettings(s => ({...s, rounds: Number(e.target.value)}))}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2"
                          >
                            <option value={2}>2 rounds</option>
                            <option value={3}>3 rounds</option>
                            <option value={4}>4 rounds</option>
                            <option value={5}>5 rounds</option>
                            <option value={6}>6 rounds</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Free Skips per Turn</span>
                          <select
                            value={teamSettings.freeSkips}
                            onChange={(e) => setTeamSettings(s => ({...s, freeSkips: Number(e.target.value)}))}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2"
                          >
                            <option value={0}>None</option>
                            <option value={1}>1 skip</option>
                            <option value={2}>2 skips</option>
                            <option value={3}>3 skips</option>
                            <option value={5}>5 skips</option>
                            <option value={99}>Unlimited</option>
                          </select>
                        </div>
                      </div>
                    )}
                    
                    {!showTeamSettings && (
                      <div className="p-4 text-sm text-gray-500 space-y-1">
                        <p>⏱️ {teamSettings.turnLength} seconds per turn</p>
                        <p>🔄 {teamSettings.rounds} rounds (each team plays {teamSettings.rounds} times)</p>
                        <p>⏭️ {teamSettings.freeSkips === 99 ? 'Unlimited' : teamSettings.freeSkips} free skips, then -1 per skip</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Category Selection for Charades */}
                  {game.teamGameType === 'charades' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Categories</h2>
                        <p className="text-sm text-gray-500">Choose what to act out</p>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-2">
                        {Object.entries(DATA.charades.categories).map(([key, category]) => {
                          const isSelected = teamSettings.selectedCategories.length === 0 || 
                                            teamSettings.selectedCategories.includes(key);
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                setTeamSettings(s => {
                                  const current = s.selectedCategories;
                                  if (current.length === 0) {
                                    const allKeys = Object.keys(DATA.charades.categories);
                                    return {...s, selectedCategories: allKeys.filter(k => k !== key)};
                                  } else if (current.includes(key)) {
                                    const newSelection = current.filter(k => k !== key);
                                    return {...s, selectedCategories: newSelection.length > 0 ? newSelection : []};
                                  } else {
                                    return {...s, selectedCategories: [...current, key]};
                                  }
                                });
                              }}
                              className={`p-3 rounded-xl text-left transition-all ${
                                isSelected 
                                  ? 'bg-fuchsia-100 border-2 border-fuchsia-500 text-fuchsia-800' 
                                  : 'bg-gray-50 border-2 border-transparent text-gray-400'
                              }`}
                            >
                              <span className="text-lg mr-2">{category.emoji}</span>
                              <span className="font-medium text-sm">{category.name}</span>
                              <div className="text-xs opacity-60 mt-1">{category.prompts.length} prompts</div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="px-4 pb-4">
                        <p className="text-xs text-gray-400 text-center">
                          {teamSettings.selectedCategories.length === 0 ? 'All' : teamSettings.selectedCategories.length} categories ({teamGameWords.length} prompts)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Category Selection for Pictionary */}
                  {game.teamGameType === 'pictionary' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Categories</h2>
                        <p className="text-sm text-gray-500">Choose what to draw</p>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-2">
                        {Object.entries(DATA.pictionary.categories).map(([key, category]) => {
                          const isSelected = teamSettings.selectedCategories.length === 0 || 
                                            teamSettings.selectedCategories.includes(key);
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                setTeamSettings(s => {
                                  const current = s.selectedCategories;
                                  if (current.length === 0) {
                                    const allKeys = Object.keys(DATA.pictionary.categories);
                                    return {...s, selectedCategories: allKeys.filter(k => k !== key)};
                                  } else if (current.includes(key)) {
                                    const newSelection = current.filter(k => k !== key);
                                    return {...s, selectedCategories: newSelection.length > 0 ? newSelection : []};
                                  } else {
                                    return {...s, selectedCategories: [...current, key]};
                                  }
                                });
                              }}
                              className={`p-3 rounded-xl text-left transition-all ${
                                isSelected 
                                  ? 'bg-cyan-100 border-2 border-cyan-500 text-cyan-800' 
                                  : 'bg-gray-50 border-2 border-transparent text-gray-400'
                              }`}
                            >
                              <span className="text-lg mr-2">{category.emoji}</span>
                              <span className="font-medium text-sm">{category.name}</span>
                              <div className="text-xs opacity-60 mt-1">{category.words.length} words</div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="px-4 pb-4">
                        <p className="text-xs text-gray-400 text-center">
                          {teamSettings.selectedCategories.length === 0 ? 'All' : teamSettings.selectedCategories.length} categories ({teamGameWords.length} words)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Neanderthal info */}
                  {game.teamGameType === 'neanderthal' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-100 rounded-xl">
                          <FaLightbulb className="text-amber-600" />
                        </div>
                        <h3 className="font-bold text-gray-800">How to Play</h3>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Describe the word using <strong>only one-syllable words</strong></li>
                        <li>• No saying part of the word or rhyming words!</li>
                        <li>• Think like a caveman: "Big cat with stripes" for Tiger</li>
                      </ul>
                      <p className="text-xs text-gray-400 mt-3">{teamGameWords.length} words available</p>
                    </div>
                  )}
                  
                  <button
                    onClick={startTeamGame}
                    className={`w-full ${game.color} text-white py-4 rounded-2xl text-xl font-bold shadow-lg flex items-center justify-center gap-3`}
                  >
                    <FaPlay /> Start Game
                  </button>
                </div>
              )}

              {/* GAME OVER SCREEN */}
              {teamGameOver && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-2xl font-black text-gray-800 mb-2">Game Over!</h2>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${teamScoreA > teamScoreB ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50'}`}>
                        <div className="text-sm font-bold text-gray-500">Team A</div>
                        <div className="text-4xl font-black text-blue-600">{teamScoreA}</div>
                        {teamScoreA > teamScoreB && <div className="text-sm text-blue-600 font-bold mt-1">🎉 Winner!</div>}
                      </div>
                      <div className={`p-4 rounded-xl ${teamScoreB > teamScoreA ? 'bg-orange-100 ring-2 ring-orange-500' : 'bg-gray-50'}`}>
                        <div className="text-sm font-bold text-gray-500">Team B</div>
                        <div className="text-4xl font-black text-orange-600">{teamScoreB}</div>
                        {teamScoreB > teamScoreA && <div className="text-sm text-orange-600 font-bold mt-1">🎉 Winner!</div>}
                      </div>
                    </div>
                    {teamScoreA === teamScoreB && <p className="mt-4 text-gray-600 font-bold">It's a tie!</p>}
                  </div>
                  <button
                    onClick={resetTeamGame}
                    className={`${game.color} text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg`}
                  >
                    Play Again
                  </button>
                </div>
              )}

              {/* ACTIVE GAME */}
              {teamGameStarted && !teamGameOver && (
                <>
                  {/* Scoreboard */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                    <div className="text-center text-xs text-gray-400 mb-2">
                      Round {teamCurrentRound} of {teamSettings.rounds}
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className={`text-center p-3 rounded-xl ${teamCurrentTeam === 'A' ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50'}`}>
                        <div className="text-xs font-bold text-gray-400 uppercase">Team A</div>
                        <div className="text-3xl font-black text-blue-600">{teamScoreA}</div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`text-4xl font-mono font-black tabular-nums ${teamTimer <= 10 ? 'timer-warning' : 'text-gray-700'}`}>
                          {teamTimer}
                        </div>
                        <div className="text-xs text-gray-400">seconds</div>
                      </div>
                      
                      <div className={`text-center p-3 rounded-xl ${teamCurrentTeam === 'B' ? 'bg-orange-100 ring-2 ring-orange-500' : 'bg-gray-50'}`}>
                        <div className="text-xs font-bold text-gray-400 uppercase">Team B</div>
                        <div className="text-3xl font-black text-orange-600">{teamScoreB}</div>
                      </div>
                    </div>
                  </div>

                  {/* Turn Score & Skips */}
                  {teamIsPlaying && (
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="bg-white px-4 py-2 rounded-full shadow-sm">
                        <span className="text-gray-500">This turn:</span>{' '}
                        <span className={`font-bold ${teamTurnScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {teamTurnScore >= 0 ? '+' : ''}{teamTurnScore}
                        </span>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-full shadow-sm">
                        <span className="text-gray-500">Skips:</span>{' '}
                        <span className="font-bold text-gray-700">
                          {teamSkipsUsed}/{teamSettings.freeSkips === 99 ? '∞' : teamSettings.freeSkips}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Waiting to Start Turn */}
                  {!teamIsPlaying && (
                    <div className="text-center py-8">
                      <div className={`inline-block px-4 py-2 rounded-full text-white font-bold mb-4 ${teamCurrentTeam === 'A' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                        Team {teamCurrentTeam}'s Turn
                      </div>
                      <p className="text-gray-500 mb-2">
                        {game.teamGameType === 'charades' && "One person acts, others guess!"}
                        {game.teamGameType === 'pictionary' && "One person draws, others guess!"}
                        {game.teamGameType === 'neanderthal' && "One person describes using only one-syllable words!"}
                      </p>
                      <button
                        onClick={startTeamTurn}
                        className={`${game.color} text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-lg inline-flex items-center gap-3`}
                      >
                        <FaPlay /> Start Turn
                      </button>
                    </div>
                  )}

                  {/* Active Card */}
                  {teamIsPlaying && currentData && (
                    <div key={cardKey} className="animate-scale-in">
                      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
                        <div className={`${game.color} text-white p-6 text-center`}>
                          <div className="text-xs uppercase tracking-wide opacity-75 mb-1">
                            {game.teamGameType === 'charades' && "Act This Out"}
                            {game.teamGameType === 'pictionary' && "Draw This"}
                            {game.teamGameType === 'neanderthal' && "Describe This"}
                          </div>
                          <h2 className="text-3xl font-black uppercase tracking-wide">
                            {currentData}
                          </h2>
                        </div>
                        {game.teamGameType === 'neanderthal' && (
                          <div className="p-3 bg-amber-50 text-amber-700 text-center text-sm font-medium">
                            🗿 One-syllable words only!
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                          onClick={handleTeamSkip}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-4 rounded-2xl flex flex-col items-center font-bold transition-colors"
                        >
                          <FaForward size={24} />
                          <span className="text-sm mt-1">
                            Skip {teamSkipsUsed >= teamSettings.freeSkips && teamSettings.freeSkips !== 99 ? '(-1)' : ''}
                          </span>
                        </button>
                        <button
                          onClick={handleTeamCorrect}
                          className="bg-green-100 hover:bg-green-200 text-green-600 p-4 rounded-2xl flex flex-col items-center font-bold transition-colors"
                        >
                          <FaCheck size={24} />
                          <span className="text-sm mt-1">Got It! (+1)</span>
                        </button>
                      </div>
                      
                      <button
                        onClick={endTeamTurn}
                        className="w-full mt-4 text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
                      >
                        End Turn Early
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* GENERATOR MODE */}
          {game.mode === 'generator' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Category Selection for Ice Breaker */}
              {game.id === 'ice-breaker' && !currentData && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">Categories</h2>
                    <p className="text-xs text-gray-500">Tap to toggle</p>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {Object.entries(DATA.icebreaker.categories).map(([key, category]) => {
                      const isSelected = selectedIcebreakerCategories.length === 0 || 
                                        selectedIcebreakerCategories.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedIcebreakerCategories(current => {
                              if (current.length === 0) {
                                const allKeys = Object.keys(DATA.icebreaker.categories);
                                return allKeys.filter(k => k !== key);
                              } else if (current.includes(key)) {
                                const newSelection = current.filter(k => k !== key);
                                return newSelection.length > 0 ? newSelection : [];
                              } else {
                                return [...current, key];
                              }
                            });
                          }}
                          className={`p-2 rounded-xl text-left transition-all active:scale-95 ${
                            isSelected 
                              ? 'bg-sky-100 border-2 border-sky-400 text-sky-800' 
                              : 'bg-gray-50 border-2 border-transparent text-gray-400'
                          }`}
                        >
                          <span className="text-base mr-1">{category.emoji}</span>
                          <span className="font-medium text-xs">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-xs text-gray-400 text-center">{icebreakerQuestions.length} questions</p>
                  </div>
                </div>
              )}

              {/* Category Selection for Charades */}
              {game.id === 'charades' && !currentData && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">Categories</h2>
                    <p className="text-xs text-gray-500">Choose what to act out</p>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {Object.entries(DATA.charades.categories).map(([key, category]) => {
                      const isSelected = selectedCharadesCategories.length === 0 || 
                                        selectedCharadesCategories.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedCharadesCategories(current => {
                              if (current.length === 0) {
                                const allKeys = Object.keys(DATA.charades.categories);
                                return allKeys.filter(k => k !== key);
                              } else if (current.includes(key)) {
                                const newSelection = current.filter(k => k !== key);
                                return newSelection.length > 0 ? newSelection : [];
                              } else {
                                return [...current, key];
                              }
                            });
                          }}
                          className={`p-2 rounded-xl text-left transition-all active:scale-95 ${
                            isSelected 
                              ? 'bg-fuchsia-100 border-2 border-fuchsia-400 text-fuchsia-800' 
                              : 'bg-gray-50 border-2 border-transparent text-gray-400'
                          }`}
                        >
                          <span className="text-base mr-1">{category.emoji}</span>
                          <span className="font-medium text-xs">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-xs text-gray-400 text-center">{charadesPrompts.length} prompts</p>
                  </div>
                </div>
              )}

              {/* Category Selection for Pictionary */}
              {game.id === 'pictionary' && !currentData && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">Categories</h2>
                    <p className="text-xs text-gray-500">Choose what to draw</p>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {Object.entries(DATA.pictionary.categories).map(([key, category]) => {
                      const isSelected = selectedPictionaryCategories.length === 0 || 
                                        selectedPictionaryCategories.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedPictionaryCategories(current => {
                              if (current.length === 0) {
                                const allKeys = Object.keys(DATA.pictionary.categories);
                                return allKeys.filter(k => k !== key);
                              } else if (current.includes(key)) {
                                const newSelection = current.filter(k => k !== key);
                                return newSelection.length > 0 ? newSelection : [];
                              } else {
                                return [...current, key];
                              }
                            });
                          }}
                          className={`p-2 rounded-xl text-left transition-all active:scale-95 ${
                            isSelected 
                              ? 'bg-cyan-100 border-2 border-cyan-400 text-cyan-800' 
                              : 'bg-gray-50 border-2 border-transparent text-gray-400'
                          }`}
                        >
                          <span className="text-base mr-1">{category.emoji}</span>
                          <span className="font-medium text-xs">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-xs text-gray-400 text-center">{pictionaryWords.length} words</p>
                  </div>
                </div>
              )}
              
              {/* Empty State for non-category games */}
              {!currentData && !['ice-breaker', 'charades', 'pictionary'].includes(game.id) && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4 opacity-20 mx-auto w-fit">
                    <game.icon />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">Ready to play?</p>
                  <p className="text-gray-400 text-sm">Tap below to start</p>
                </div>
              )}

              {/* Content Card */}
              {currentData && (
                <div key={cardKey} className="animate-scale-in">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    
                    {/* Simple string content (charades, pictionary, icebreaker, etc) */}
                    {typeof currentData === 'string' && (
                      <div className={`p-6 text-center ${game.color}`}>
                        <p className="text-2xl sm:text-3xl font-black text-white leading-relaxed">
                          {currentData}
                        </p>
                      </div>
                    )}

                    {/* Riddle/Lateral content */}
                    {currentData.q && (
                      <div className="p-4 sm:p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${game.color} text-white flex-shrink-0`}>
                            <FaLightbulb size={14} />
                          </div>
                          <p className="text-lg sm:text-xl font-medium text-gray-800 leading-relaxed">
                            {currentData.q}
                          </p>
                        </div>
                        
                        {revealed ? (
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200 animate-scale-in">
                            <p className="text-xs text-green-600 uppercase font-bold mb-1">Answer</p>
                            <p className="text-green-800 font-medium text-base sm:text-lg">{currentData.a}</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRevealed(true)}
                            className="w-full flex items-center justify-center gap-2 text-gray-500 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                          >
                            <FaEye /> Reveal Answer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Footer Action Button */}
      {game.mode === 'generator' && (
        <div className="sticky bottom-0 p-3 sm:p-4 bg-white/95 backdrop-blur-lg border-t border-gray-100" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleGenerate}
            className={`w-full py-4 rounded-2xl text-lg sm:text-xl font-bold text-white shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-3 ${game.color}`}
          >
            {currentData ? (
              <><FaRedo /> Next</>
            ) : (
              <><FaPlay /> {game.buttonText || 'Start'}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}