import React, { useState } from 'react';
import { LeaguePlayer } from '../../types';
import { Trophy, Medal, Crown, Flame, ShieldCheck } from 'lucide-react';

interface LeaguesViewProps {
  onBack?: () => void;
}

const LEAGUE_PLAYERS: LeaguePlayer[] = [
  { rank: 1, username: 'Arash_GrandMaster', displayName: 'آرش شطرنج‌باز', avatar: '🦁', score: 2840, wins: 142, league: 'استاد بزرگ', badgeColor: '#f59e0b' },
  { rank: 2, username: 'Kourosh_King', displayName: 'کوروش بزرگ', avatar: '👑', score: 2710, wins: 128, league: 'استاد بزرگ', badgeColor: '#f59e0b' },
  { rank: 3, username: 'Sara_Othello', displayName: 'سارا ملکه اتللو', avatar: '💎', score: 2590, wins: 115, league: 'الماس', badgeColor: '#06b6d4' },
  { rank: 4, username: 'Parsa_Mind', displayName: 'پارسا ذهن برتر', avatar: '🧠', score: 2430, wins: 98, league: 'الماس', badgeColor: '#06b6d4' },
  { rank: 5, username: 'Rostam_Gamer', displayName: 'رستم دستان', avatar: '⚔️', score: 2280, wins: 84, league: 'طلا', badgeColor: '#eab308' },
  { rank: 6, username: 'Aida_Sudoku', displayName: 'آیدا نابغه سودوکو', avatar: '🌸', score: 2150, wins: 76, league: 'طلا', badgeColor: '#eab308' },
  { rank: 7, username: 'Ali_Gamer99', displayName: 'علی استراتژیست', avatar: '🚀', score: 1940, wins: 62, league: 'نقره', badgeColor: '#94a3b8' },
  { rank: 8, username: 'Zahra_WordMaster', displayName: 'زهرا کلمه‌دان', avatar: '📖', score: 1810, wins: 54, league: 'نقره', badgeColor: '#94a3b8' },
];

export const LeaguesView: React.FC<LeaguesViewProps> = ({ onBack }) => {
  const [selectedLeague, setSelectedLeague] = useState<'همه' | 'استاد بزرگ' | 'الماس' | 'طلا' | 'نقره'>('همه');

  const filteredPlayers =
    selectedLeague === 'همه'
      ? LEAGUE_PLAYERS
      : LEAGUE_PLAYERS.filter((p) => p.league === selectedLeague);

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-5 flex flex-col gap-3 sm:gap-5 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl sm:text-3xl shadow-md shadow-amber-500/20">
            🏆
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black text-amber-300">لیگ‌ها و رده‌بندی قهرمانان</h1>
            <p className="text-[10px] sm:text-xs text-slate-400">جوایز هفتگی ۵۰,۰۰۰ سکه طلا برای ۳ نفر اول هر لیگ</p>
          </div>
        </div>

        {onBack && (
          <button
            id="leagues-back-btn"
            onClick={onBack}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            بازگشت
          </button>
        )}
      </div>

      {/* Tier Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/40 p-2.5 sm:p-3.5 rounded-2xl flex flex-col gap-0.5 sm:gap-1 shadow-md">
          <div className="flex items-center justify-between">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">سطح ۱</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-amber-300">لیگ استاد بزرگ</span>
          <span className="text-[10px] text-slate-400">+۲۶۰۰ امتیاز ریتینگ</span>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-700/10 border border-cyan-500/40 p-2.5 sm:p-3.5 rounded-2xl flex flex-col gap-0.5 sm:gap-1 shadow-md">
          <div className="flex items-center justify-between">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">سطح ۲</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-cyan-300">لیگ الماس</span>
          <span className="text-[10px] text-slate-400">۲۳۰۰ الی ۲۶۰۰ امتیاز</span>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-700/10 border border-yellow-500/40 p-2.5 sm:p-3.5 rounded-2xl flex flex-col gap-0.5 sm:gap-1 shadow-md">
          <div className="flex items-center justify-between">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">سطح ۳</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-yellow-300">لیگ طلایی</span>
          <span className="text-[10px] text-slate-400">۲۰۰۰ الی ۲۳۰۰ امتیاز</span>
        </div>

        <div className="bg-gradient-to-br from-slate-500/20 to-slate-700/10 border border-slate-500/40 p-2.5 sm:p-3.5 rounded-2xl flex flex-col gap-0.5 sm:gap-1 shadow-md">
          <div className="flex items-center justify-between">
            <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300">سطح ۴</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-300">لیگ نقره‌ای</span>
          <span className="text-[10px] text-slate-400">زیر ۲۰۰۰ امتیاز</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
        {(['همه', 'استاد بزرگ', 'الماس', 'طلا', 'نقره'] as const).map((league) => (
          <button
            key={league}
            onClick={() => setSelectedLeague(league)}
            className={`flex-1 py-1.5 sm:py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedLeague === league
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {league === 'همه' ? 'همه بازیکنان' : `لیگ ${league}`}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 grid grid-cols-12 text-[10px] sm:text-xs font-bold text-slate-400">
          <span className="col-span-2 text-center">رتبه</span>
          <span className="col-span-5 sm:col-span-6">نام قهرمان</span>
          <span className="col-span-3 sm:col-span-2 text-center">بردها</span>
          <span className="col-span-2 text-center">امتیاز</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredPlayers.map((player) => (
            <div
              key={player.username}
              className={`p-3 grid grid-cols-12 items-center text-xs transition-colors hover:bg-slate-800/50 ${
                player.rank === 1 ? 'bg-amber-500/10' : ''
              }`}
            >
              {/* Rank */}
              <div className="col-span-2 flex justify-center">
                {player.rank === 1 ? (
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                    ۱ 👑
                  </span>
                ) : player.rank === 2 ? (
                  <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                    ۲ 🥈
                  </span>
                ) : player.rank === 3 ? (
                  <span className="w-6 h-6 rounded-full bg-amber-700 text-slate-100 flex items-center justify-center font-black text-xs shadow-md">
                    ۳ 🥉
                  </span>
                ) : (
                  <span className="text-slate-400 font-bold font-mono">{player.rank}</span>
                )}
              </div>

              {/* Player Info */}
              <div className="col-span-5 sm:col-span-6 flex items-center gap-2">
                <span className="text-xl">{player.avatar}</span>
                <div>
                  <div className="font-bold text-slate-200">{player.displayName}</div>
                  <div className="text-[10px] text-amber-400/80">{player.league}</div>
                </div>
              </div>

              {/* Wins */}
              <div className="col-span-3 sm:col-span-2 text-center font-mono text-slate-300">
                {player.wins} برد
              </div>

              {/* Rating Score */}
              <div className="col-span-2 text-center font-mono font-black text-amber-400">
                {player.score.toLocaleString('fa-IR')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
