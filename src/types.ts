export type ViewMode = 'web' | 'android';

export type GameId = 
  | 'chess' 
  | 'othello' 
  | 'sudoku' 
  | 'ludo' 
  | 'dooz' 
  | 'quiz' 
  | 'wordle' 
  | 'puzzle' 
  | 'candy' 
  | 'wheel';

export type NavTab = 
  | 'home' 
  | 'games' 
  | 'wheel' 
  | 'leagues' 
  | 'chat' 
  | 'rules' 
  | 'profile' 
  | 'wallet' 
  | 'game_view';

export type GameMode = 'ai' | 'pvp' | 'league';

export interface GameInfo {
  id: GameId;
  title: string;
  titleEn: string;
  category: 'فکری و تخته‌ای' | 'استراتژیک' | 'معمایی و منطق' | 'کلمات و اطلاعات' | 'سرگرمی و شانس';
  description: string;
  icon: string;
  badge?: string;
  playersCount: string;
  rating: number;
  playCount: number;
  hasAI: boolean;
  has2P: boolean;
  minCoins: number;
  heroName: string;
  heroAvatar: string;
  heroRole: string;
  heroQuote: string;
  roomTitle: string;
  bgGradient: string;
  accentColor: string;
  leagueEntryFee: number;
  leaguePrize: number;
  heroImage?: string;
  coverImage?: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  avatar: string;
  customAvatarUrl?: string;
  isLoggedIn?: boolean;
  authMethod?: 'google' | 'phone' | 'guest';
  email?: string;
  phone?: string;
  coins: number;
  gems: number;
  level: number;
  xp: number;
  xpToNext: number;
  rankTitle: string;
  ratingElo: number;
  totalGames: number;
  wins: number;
  losses: number;
  streak: number;
  lastWheelSpin?: number; // timestamp
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe?: boolean;
  badge?: string;
}

export interface LeaguePlayer {
  rank: number;
  username: string;
  displayName: string;
  avatar: string;
  score: number;
  wins: number;
  league: 'برنز' | 'نقره' | 'طلا' | 'الماس' | 'استاد بزرگ';
  badgeColor: string;
}

// Chess Types
export type ChessPieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type ChessColor = 'w' | 'b';

export interface ChessPiece {
  type: ChessPieceType;
  color: ChessColor;
}

export type ChessBoard = (ChessPiece | null)[][];

export interface ChessMoveRecord {
  from: [number, number];
  to: [number, number];
  piece: ChessPiece;
  captured?: ChessPiece | null;
  notation: string;
  time: string;
}

// Othello Types
export type OthelloDisc = 'black' | 'white' | null;
export type OthelloBoard = OthelloDisc[][];

// Sudoku Types
export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type SudokuGrid = number[][];
export type SudokuNotes = Set<number>[][];

// Quiz Types
export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Wordle Types
export interface WordleAttempt {
  word: string;
  feedback: ('correct' | 'present' | 'absent')[];
}

// Lucky Wheel Types
export interface WheelSegment {
  id: number;
  label: string;
  icon: string;
  type: 'coins' | 'gems' | 'vip' | 'spin' | 'empty';
  amount: number;
  color: string;
  textColor: string;
  probability: number;
}
