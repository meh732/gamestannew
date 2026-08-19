import React from 'react';
import { NavTab, UserProfile } from '../../types';
import { sounds } from '../../utils/audio';
import {
  Gamepad2,
  Trophy,
  Disc,
  MessageSquare,
  User,
  LogIn,
} from 'lucide-react';

interface SleekMobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: UserProfile;
  onOpenAuth?: () => void;
}

export const SleekMobileNav: React.FC<SleekMobileNavProps> = ({
  activeTab,
  onSelectTab,
  profile,
  onOpenAuth,
}) => {
  const handleTabClick = (tab: NavTab) => {
    sounds.playClick();
    onSelectTab(tab);
  };

  const navItems = [
    {
      id: 'home' as NavTab,
      label: 'بازی‌ها',
      icon: <Gamepad2 className="w-4 h-4 text-[#e5d0a1]" />,
    },
    {
      id: 'leagues' as NavTab,
      label: 'لیگ‌ها',
      icon: <Trophy className="w-4 h-4 text-[#e5d0a1]" />,
    },
    {
      id: 'wheel' as NavTab,
      label: 'گردونه شانس',
      icon: <Disc className="w-4 h-4 text-[#f59e0b] animate-spin-slow" />,
      isHighlight: true,
    },
    {
      id: 'chat' as NavTab,
      label: 'گفتگو',
      icon: <MessageSquare className="w-4 h-4 text-[#e5d0a1]" />,
    },
    {
      id: 'profile' as NavTab,
      label: profile.isLoggedIn ? 'پروفایل' : 'ورود',
      icon: profile.isLoggedIn ? (
        <User className="w-4 h-4 text-[#e5d0a1]" />
      ) : (
        <LogIn className="w-4 h-4 text-[#e5d0a1]" />
      ),
      action: onOpenAuth,
    },
  ];

  return (
    <div className="fixed bottom-2 left-2 right-2 sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-40 pointer-events-auto font-['Vazirmatn'] select-none gpu-layer">
      {/* Antique Bronze Embossed Nav Bar (Exact Style Matching User Reference) */}
      <nav className="relative w-full bg-[#120d08]/95 border-2 border-[#a37c2c]/80 rounded-[26px] px-3 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(245,158,11,0.3)] flex items-center justify-around">
        {navItems.map((item, idx) => {
          const isActive =
            activeTab === item.id ||
            (item.id === 'home' && activeTab === 'game_view') ||
            (item.id === 'profile' && activeTab === 'wallet');

          return (
            <button
              key={`${item.label}-${idx}`}
              onClick={() => {
                if (item.action) {
                  sounds.playClick();
                  item.action();
                } else {
                  handleTabClick(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-1.5 transition-all duration-200 active:scale-90 cursor-pointer ${
                isActive ? 'scale-105' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {/* Circular Antique Gold Embossed Button */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  item.isHighlight
                    ? 'bg-gradient-to-b from-[#3d2211] to-[#1a0f05] border-2 border-[#f59e0b] shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                    : isActive
                    ? 'bg-gradient-to-b from-[#2e2213] to-[#140d06] border-2 border-[#c29b38] shadow-[0_2px_10px_rgba(0,0,0,0.8)] ring-1 ring-[#f5d996]/50'
                    : 'bg-gradient-to-b from-[#1f170e] to-[#0f0a05] border border-[#785928] hover:border-[#c29b38]'
                }`}
              >
                {item.icon}
              </div>

              <span
                className={`text-[10px] whitespace-nowrap leading-none ${
                  isActive || item.isHighlight
                    ? 'font-black text-[#f5d996]'
                    : 'font-bold text-[#bfa472]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
