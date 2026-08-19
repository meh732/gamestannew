import React, { useState, useEffect } from 'react';
import { GameId, GameMode, NavTab, UserProfile, ViewMode } from './types';
import { Navbar } from './components/Navbar';
import { WebPortal } from './components/WebPortal';
import { AndroidAppView } from './components/AndroidAppView';
import { AncientPersianBackground } from './components/common/AncientPersianBackground';
import { AuthModal } from './components/auth/AuthModal';
import { PwaInstallModal } from './components/pwa/PwaInstallModal';
import { ChessGame } from './components/games/ChessGame';
import { OthelloGame } from './components/games/OthelloGame';
import { SudokuGame } from './components/games/SudokuGame';
import { LudoGame } from './components/games/LudoGame';
import { DoozGame } from './components/games/DoozGame';
import { QuizGame } from './components/games/QuizGame';
import { WordleGame } from './components/games/WordleGame';
import { PuzzleGame } from './components/games/PuzzleGame';
import { CandyGame } from './components/games/CandyGame';
import { LuckyWheelGame } from './components/games/LuckyWheelGame';
import { LeaguesView } from './components/views/LeaguesView';
import { LawRulesView } from './components/views/LawRulesView';
import { ChatSupportView } from './components/views/ChatSupportView';
import { ProfileWalletView } from './components/views/ProfileWalletView';
import { useBackGesture } from './hooks/useBackGesture';

const INITIAL_PROFILE: UserProfile = {
  username: '',
  displayName: 'کاربر مهمان',
  avatar: '👤',
  isLoggedIn: false,
  authMethod: 'guest',
  coins: 500,
  gems: 10,
  level: 1,
  xp: 0,
  xpToNext: 100,
  rankTitle: 'کاربر تازه‌وارد',
  ratingElo: 1000,
  totalGames: 0,
  wins: 0,
  losses: 0,
  streak: 0,
};

export default function App() {
  // Auto-detect mobile screen or PWA standalone mode
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.innerWidth < 768
      ) {
        return 'android';
      }
    }
    return 'web';
  });

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedGameId, setSelectedGameId] = useState<GameId | null>(null);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('ai');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  // User profile with localStorage cache
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('gamestan_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PROFILE;
      }
    }
    return INITIAL_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem('gamestan_user_profile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleWinReward = (coins: number) => {
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + coins,
      wins: prev.wins + 1,
      totalGames: prev.totalGames + 1,
      streak: prev.streak + 1,
      ratingElo: prev.ratingElo + 35,
      xp: prev.xp + 120,
    }));
  };

  const handleWheelPrize = (coins: number, gems: number) => {
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + coins,
      gems: prev.gems + gems,
      lastWheelSpin: Date.now(),
    }));
  };

  const handleSelectGame = (gameId: GameId, mode: GameMode = 'ai') => {
    setSelectedGameId(gameId);
    setSelectedGameMode(mode);
    setActiveTab('game_view');
  };

  const handleBackToLobby = () => {
    setSelectedGameId(null);
    setActiveTab('home');
  };

  // Universal Back Handler (Modals -> Game -> Subtab -> Home)
  const handleUniversalBack = () => {
    if (isAuthModalOpen) {
      setIsAuthModalOpen(false);
      return;
    }
    if (isPwaModalOpen) {
      setIsPwaModalOpen(false);
      return;
    }
    if (selectedGameId !== null || activeTab === 'game_view') {
      setSelectedGameId(null);
      setActiveTab('home');
      return;
    }
    if (activeTab !== 'home') {
      setActiveTab('home');
      return;
    }
  };

  // Sync with Browser History API for native mobile back buttons & swipe gestures
  useEffect(() => {
    const currentState = {
      tab: activeTab,
      gameId: selectedGameId,
      auth: isAuthModalOpen,
      pwa: isPwaModalOpen,
    };
    window.history.pushState(currentState, '');
  }, [activeTab, selectedGameId, isAuthModalOpen, isPwaModalOpen]);

  // Listen to popstate (Hardware / Browser back button or Swipe Back)
  useEffect(() => {
    const handlePopState = () => {
      if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
        return;
      }
      if (isPwaModalOpen) {
        setIsPwaModalOpen(false);
        return;
      }
      if (selectedGameId !== null) {
        setSelectedGameId(null);
        setActiveTab('home');
        return;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, selectedGameId, isAuthModalOpen, isPwaModalOpen]);

  // Edge Swipe Gestures Hook (Active when not in home screen or modal is open)
  const isBackGestureActive =
    activeTab !== 'home' ||
    selectedGameId !== null ||
    isAuthModalOpen ||
    isPwaModalOpen;

  useBackGesture({
    enabled: isBackGestureActive,
    onBack: handleUniversalBack,
    edgeThreshold: 55,
    swipeDistance: 65,
  });

  // Render current active game component
  const renderGame = () => {
    switch (selectedGameId) {
      case 'chess':
        return (
          <ChessGame
            initialMode={selectedGameMode}
            onBack={handleBackToLobby}
            onWinReward={handleWinReward}
          />
        );
      case 'othello':
        return (
          <OthelloGame
            initialMode={selectedGameMode}
            onBack={handleBackToLobby}
            onWinReward={handleWinReward}
          />
        );
      case 'sudoku':
        return <SudokuGame onBack={handleBackToLobby} onWinReward={handleWinReward} />;
      case 'ludo':
        return (
          <LudoGame
            initialMode={selectedGameMode}
            onBack={handleBackToLobby}
            onWinReward={handleWinReward}
          />
        );
      case 'dooz':
        return (
          <DoozGame
            initialMode={selectedGameMode}
            onBack={handleBackToLobby}
            onWinReward={handleWinReward}
          />
        );
      case 'quiz':
        return (
          <QuizGame
            initialMode={selectedGameMode}
            onBack={handleBackToLobby}
            onWinReward={handleWinReward}
          />
        );
      case 'wordle':
        return <WordleGame onBack={handleBackToLobby} onWinReward={handleWinReward} />;
      case 'puzzle':
        return <PuzzleGame onBack={handleBackToLobby} onWinReward={handleWinReward} />;
      case 'candy':
        return <CandyGame onBack={handleBackToLobby} onWinReward={handleWinReward} />;
      case 'wheel':
        return <LuckyWheelGame onBack={handleBackToLobby} onPrizeWon={handleWheelPrize} />;
      default:
        return null;
    }
  };

  // Render primary content depending on tab
  const renderTabContent = () => {
    if (activeTab === 'game_view') {
      return renderGame();
    }
    switch (activeTab) {
      case 'wheel':
        return <LuckyWheelGame onBack={handleBackToLobby} onPrizeWon={handleWheelPrize} />;
      case 'leagues':
        return <LeaguesView onBack={handleBackToLobby} />;
      case 'rules':
        return <LawRulesView onBack={handleBackToLobby} />;
      case 'chat':
        return <ChatSupportView onBack={handleBackToLobby} currentUser={profile} isMobile={viewMode === 'android'} />;
      case 'profile':
      case 'wallet':
        return (
          <ProfileWalletView
            profile={profile}
            onUpdateProfile={updateProfile}
            onBack={handleBackToLobby}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        );
      case 'home':
      default:
        return (
          <WebPortal
            onSelectGame={handleSelectGame}
            onOpenWheel={() => setActiveTab('wheel')}
            onOpenLeagues={() => setActiveTab('leagues')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-['Vazirmatn'] relative overflow-x-hidden">
      {/* Moving Ancient Persian Background with Parallax and Persepolis Relics */}
      <AncientPersianBackground shiftIndex={selectedGameId ? 3 : 0} />

      {/* When in Web Mode: Show Universal Top Navigation Header and Footer */}
      {viewMode === 'web' ? (
        <>
          <Navbar
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            profile={profile}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenPwaInstall={() => setIsPwaModalOpen(true)}
          />

          <main className="flex-1 w-full pb-10 relative z-10">
            <div className="w-full">{renderTabContent()}</div>
          </main>

          <footer className="w-full border-t border-amber-500/20 bg-slate-950/90 py-4 px-6 text-center text-xs text-amber-200/60 relative z-10">
            کاخ اساطیری گیمستان (GameStan) • پلتفرم بازی‌های آنلاین با قابلیت نصب مستقیم PWA بر روی اندروید و آیفون
          </footer>
        </>
      ) : (
        /* When in Android / Mobile App Mode: Pure 100% App Experience with NO website footer and NO double header */
        <AndroidAppView
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onSelectGame={handleSelectGame}
          selectedGameId={selectedGameId}
          profile={profile}
          onToggleViewMode={setViewMode}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenPwaInstall={() => setIsPwaModalOpen(true)}
        >
          {renderTabContent()}
        </AndroidAppView>
      )}

      {/* Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={profile}
        onUpdateUser={updateProfile}
      />

      {/* PWA Install Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />
    </div>
  );
}
