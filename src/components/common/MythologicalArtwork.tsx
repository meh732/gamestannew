import React from 'react';
import { GameId } from '../../types';

interface MythologicalArtworkProps {
  gameId: GameId;
  className?: string;
}

export const MythologicalArtwork: React.FC<MythologicalArtworkProps> = ({
  gameId,
  className = 'w-full h-full',
}) => {
  switch (gameId) {
    case 'chess':
      // Rostam Dastan in Babr-e Bayan armor studying the mystical Chess board at Persepolis
      return (
        <svg
          viewBox="0 0 400 480"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="rostam-glow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#d97706" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </radialGradient>
            <linearGradient id="gold-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="armor-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="50%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#431407" />
            </linearGradient>
          </defs>

          {/* Deep Night & Palace Architecture */}
          <rect width="400" height="480" fill="#070913" />
          <circle cx="200" cy="180" r="170" fill="url(#rostam-glow)" />

          {/* Ancient Persepolis Bas-Relief Columns (ستون‌های تخت جمشید) */}
          <g opacity="0.35">
            <rect x="25" y="40" width="35" height="400" fill="#78350f" />
            <rect x="340" y="40" width="35" height="400" fill="#78350f" />
            {/* Column Fluting */}
            <line x1="32" y1="40" x2="32" y2="440" stroke="#fde047" strokeWidth="1.5" />
            <line x1="42" y1="40" x2="42" y2="440" stroke="#fde047" strokeWidth="1.5" />
            <line x1="52" y1="40" x2="52" y2="440" stroke="#fde047" strokeWidth="1.5" />
            <line x1="347" y1="40" x2="347" y2="440" stroke="#fde047" strokeWidth="1.5" />
            <line x1="357" y1="40" x2="357" y2="440" stroke="#fde047" strokeWidth="1.5" />
            <line x1="367" y1="40" x2="367" y2="440" stroke="#fde047" strokeWidth="1.5" />
            {/* Double-headed Bull Capital (سرستون دوسر گاو هخامنشی) */}
            <path d="M15 40 Q42 10 70 40 L60 60 L25 60 Z" fill="url(#gold-leaf)" />
            <path d="M330 40 Q357 10 385 40 L375 60 L340 60 Z" fill="url(#gold-leaf)" />
          </g>

          {/* Persian Mythological Faravahar Wings in Sky */}
          <g transform="translate(200, 75) scale(0.65)" opacity="0.85">
            <circle cx="0" cy="0" r="24" stroke="url(#gold-leaf)" strokeWidth="3" fill="#1e1b4b" />
            {/* Central King Crown */}
            <path d="M -10 -15 L 0 -30 L 10 -15 L 6 -5 L -6 -5 Z" fill="url(#gold-leaf)" />
            {/* Faravahar Right Wings */}
            <path d="M 24 -10 C 60 -40, 110 -20, 140 10 C 100 20, 60 15, 24 10 Z" fill="url(#gold-leaf)" />
            <path d="M 24 5 C 60 -15, 100 5, 125 30 C 85 35, 55 25, 24 18 Z" fill="url(#gold-leaf)" opacity="0.8" />
            {/* Faravahar Left Wings */}
            <path d="M -24 -10 C -60 -40, -110 -20, -140 10 C -100 20, -60 15, -24 10 Z" fill="url(#gold-leaf)" />
            <path d="M -24 5 C -60 -15, -100 5, -125 30 C -85 35, -55 25, -24 18 Z" fill="url(#gold-leaf)" opacity="0.8" />
          </g>

          {/* Rostam the Champion Silhouette & Armor */}
          <g transform="translate(200, 260)">
            {/* Rostam Broad Shoulders & Tiger-Skin Cape (ببر بیان) */}
            <path
              d="M -90 90 C -90 10, -50 -30, 0 -35 C 50 -30, 90 10, 90 90 L 105 180 L -105 180 Z"
              fill="url(#armor-gradient)"
              stroke="#fbbf24"
              strokeWidth="2"
            />
            {/* Tiger Skin Stripes */}
            <path d="M -70 40 Q -50 45 -40 30" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
            <path d="M -65 70 Q -45 75 -35 60" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
            <path d="M 70 40 Q 50 45 40 30" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
            <path d="M 65 70 Q 45 75 35 60" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />

            {/* Ancient Persian Golden Gorget & Medallion */}
            <path d="M -35 15 C -20 40, 20 40, 35 15 C 25 -5, -25 -5, -35 15 Z" fill="url(#gold-leaf)" />
            <circle cx="0" cy="22" r="7" fill="#dc2626" stroke="#fef08a" strokeWidth="2" />

            {/* Rostam Helmet with Leopard Head/Horns (کلاه‌خود دیوسار رستم) */}
            <path d="M -30 -35 C -30 -80, 30 -80, 30 -35 Z" fill="#78350f" stroke="url(#gold-leaf)" strokeWidth="3" />
            {/* Golden Horns / Crown Plumes */}
            <path d="M -25 -65 C -45 -95, -30 -115, -15 -100 C -20 -85, -20 -75, -25 -65 Z" fill="url(#gold-leaf)" />
            <path d="M 25 -65 C 45 -95, 30 -115, 15 -100 C 20 -85, 20 -75, 25 -65 Z" fill="url(#gold-leaf)" />
            <circle cx="0" cy="-90" r="5" fill="#f59e0b" />

            {/* Glowing Golden Chessboard in front of Rostam */}
            <g transform="translate(0, 110)">
              <polygon
                points="-110,60 110,60 70,0 -70,0"
                fill="#1e1b4b"
                stroke="url(#gold-leaf)"
                strokeWidth="3"
              />
              {/* Perspective Board Grid */}
              <line x1="-35" y1="0" x2="-55" y2="60" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="0" y2="60" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="35" y1="0" x2="55" y2="60" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="-80" y1="20" x2="80" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="-95" y1="40" x2="95" y2="40" stroke="#f59e0b" strokeWidth="1.5" />

              {/* Glowing King & Knight pieces on Board */}
              <g transform="translate(-25, 25)">
                <path d="M -6 12 L 6 12 L 4 -2 L 0 -8 L -4 -2 Z" fill="#fde047" />
                <circle cx="0" cy="-10" r="3" fill="#fde047" />
              </g>
              <g transform="translate(25, 20)">
                <path d="M -8 14 L 8 14 L 6 2 C 8 -5, 0 -12, -4 -6 L -2 2 Z" fill="#60a5fa" />
              </g>
            </g>
          </g>

          {/* Persian Epic Border Frame */}
          <rect x="10" y="10" width="380" height="460" rx="16" stroke="url(#gold-leaf)" strokeWidth="2.5" />
          <circle cx="10" cy="10" r="6" fill="#f59e0b" />
          <circle cx="390" cy="10" r="6" fill="#f59e0b" />
          <circle cx="10" cy="470" r="6" fill="#f59e0b" />
          <circle cx="390" cy="470" r="6" fill="#f59e0b" />
        </svg>
      );

    case 'othello':
      // Simurgh over Mount Damavand at night with glowing mystic discs
      return (
        <svg
          viewBox="0 0 400 480"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="simurgh-sky" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#0f172a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <linearGradient id="simurgh-feather" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#818cf8" />
              <stop offset="80%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <linearGradient id="damavand-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="35%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          <rect width="400" height="480" fill="#020617" />
          <rect width="400" height="480" fill="url(#simurgh-sky)" />

          {/* Ancient Mount Damavand (کوه اسطوره‌ای دماوند) */}
          <path d="M 200 190 L 370 480 L 30 480 Z" fill="url(#damavand-grad)" />
          {/* Snowy Peak */}
          <path d="M 200 190 L 235 250 L 215 240 L 200 265 L 185 240 L 165 250 Z" fill="#ffffff" opacity="0.95" />

          {/* Simurgh Mythological Giant Bird (سیمرغ افسانه‌ای البرز) */}
          <g transform="translate(200, 130)">
            {/* Radiant Feather Aura */}
            <circle cx="0" cy="0" r="110" fill="url(#simurgh-feather)" opacity="0.25" filter="blur(20px)" />

            {/* Simurgh Crest & Head */}
            <path d="M 0 -35 C 10 -45, 25 -40, 20 -20 C 15 -10, -15 -10, -20 -20 C -25 -40, -10 -45, 0 -35 Z" fill="#facc15" />
            <path d="M 0 -40 L 0 -65 C 10 -60, 15 -55, 0 -40 Z" fill="#f43f5e" />
            <path d="M -5 -40 L -15 -60 C -5 -55, -2 -50, -5 -40 Z" fill="#38bdf8" />
            <path d="M 5 -40 L 15 -60 C 5 -55, 2 -50, 5 -40 Z" fill="#38bdf8" />

            {/* Giant Mystical Wings (بال‌های سیمرغ) */}
            {/* Right Wing */}
            <path
              d="M 15 -15 C 60 -70, 140 -60, 180 -10 C 140 10, 80 15, 20 5 Z"
              fill="url(#simurgh-feather)"
              stroke="#facc15"
              strokeWidth="2"
            />
            <path
              d="M 20 0 C 70 -40, 130 -30, 160 15 C 120 30, 70 25, 20 15 Z"
              fill="url(#simurgh-feather)"
              opacity="0.8"
            />
            {/* Left Wing */}
            <path
              d="M -15 -15 C -60 -70, -140 -60, -180 -10 C -140 10, -80 15, -20 5 Z"
              fill="url(#simurgh-feather)"
              stroke="#facc15"
              strokeWidth="2"
            />
            <path
              d="M -20 0 C -70 -40, -130 -30, -160 15 C -120 30, -70 25, -20 15 Z"
              fill="url(#simurgh-feather)"
              opacity="0.8"
            />

            {/* Radiant Tail Feathers */}
            <path d="M -20 20 C -30 90, -10 140, 0 170 C 10 140, 30 90, 20 20 Z" fill="url(#simurgh-feather)" />
            <circle cx="0" cy="155" r="7" fill="#facc15" />
            <circle cx="-15" cy="125" r="5" fill="#38bdf8" />
            <circle cx="15" cy="125" r="5" fill="#38bdf8" />
          </g>

          {/* Glowing Othello Yin-Yang Discs Floating */}
          <g transform="translate(200, 370)">
            {/* Othello Green Strategic Board Halo */}
            <rect x="-110" y="-30" width="220" height="90" rx="18" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" opacity="0.9" />
            {/* Dark & Light Discs */}
            <circle cx="-50" cy="15" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
            <circle cx="50" cy="15" r="22" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
            {/* Reversi Transition Arrows */}
            <path d="M -15 5 Q 0 -15 15 5" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 15 25 Q 0 45 -15 25" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>

          <rect x="10" y="10" width="380" height="460" rx="16" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
        </svg>
      );

    case 'dooz':
      // Kaveh the Blacksmith raising the Derafsh Kaviani Banner over the Anvil
      return (
        <svg
          viewBox="0 0 400 480"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="forge-fire" cx="50%" cy="65%" r="60%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#b91c1c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <linearGradient id="derafsh-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="40%" stopColor="#dc2626" />
              <stop offset="80%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          <rect width="400" height="480" fill="#0a0a0f" />
          <rect width="400" height="480" fill="url(#forge-fire)" />

          {/* Derafsh Kaviani Flagstaff & Ancient Jewels (درفش کاویانی کاوه) */}
          <g transform="translate(200, 110)">
            {/* Golden Spearhead */}
            <path d="M 0 -80 L 12 -45 L 0 -35 L -12 -45 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="0" cy="-35" r="10" fill="#dc2626" stroke="#fbbf24" strokeWidth="2" />
            {/* Banner Cloth with Four-Petal Mythological Persian Star */}
            <rect x="-80" y="-25" width="160" height="150" rx="8" fill="url(#derafsh-grad)" stroke="#fbbf24" strokeWidth="3" />
            {/* Four Quad Jewels */}
            <circle cx="0" cy="50" r="28" fill="#fbbf24" stroke="#78350f" strokeWidth="3" />
            <polygon points="0,30 18,50 0,70 -18,50" fill="#dc2626" />
            {/* Ribbons / Silk Tassels */}
            <path d="M -60 125 C -75 160, -50 200, -60 230" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M -20 125 C -30 170, -10 200, -15 235" stroke="#eab308" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 20 125 C 10 170, 30 200, 25 235" stroke="#7e22ce" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 60 125 C 45 160, 70 200, 60 230" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>

          {/* Kaveh's Blacksmith Anvil & Tactile Dooz Grid */}
          <g transform="translate(200, 370)">
            {/* Heavy Iron Anvil (سندان آهنگری کاوه) */}
            <path d="M -80 30 L 80 30 L 60 70 L -60 70 Z" fill="#334155" stroke="#f97316" strokeWidth="2.5" />
            <path d="M -110 30 L -80 30 L -70 50 L -100 45 Z" fill="#475569" />

            {/* Glowing 3x3 Dooz Battle Grid on Anvil */}
            <g transform="translate(0, -15)">
              <rect x="-60" y="-60" width="120" height="120" rx="12" fill="#0f172a" stroke="#f97316" strokeWidth="3" />
              <line x1="-20" y1="-50" x2="-20" y2="50" stroke="#f97316" strokeWidth="2.5" />
              <line x1="20" y1="-50" x2="20" y2="50" stroke="#f97316" strokeWidth="2.5" />
              <line x1="-50" y1="-20" x2="50" y2="-20" stroke="#f97316" strokeWidth="2.5" />
              <line x1="-50" y1="20" x2="50" y2="20" stroke="#f97316" strokeWidth="2.5" />

              {/* Glowing X & O tokens */}
              <text x="-40" y="-28" fill="#38bdf8" fontSize="24" fontWeight="bold" textAnchor="middle">✕</text>
              <text x="0" y="10" fill="#f43f5e" fontSize="24" fontWeight="bold" textAnchor="middle">◯</text>
              <text x="40" y="48" fill="#38bdf8" fontSize="24" fontWeight="bold" textAnchor="middle">✕</text>
            </g>
          </g>

          <rect x="10" y="10" width="380" height="460" rx="16" stroke="#f97316" strokeWidth="2.5" opacity="0.8" />
        </svg>
      );

    case 'ludo':
      // Sohrab the Youthful Champion through the Haft Khan Trials
      return (
        <svg
          viewBox="0 0 400 480"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="haftkhan-glow" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#881337" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>

          <rect width="400" height="480" fill="#0b0f19" />
          <rect width="400" height="480" fill="url(#haftkhan-glow)" />

          {/* Persian Mountainous Fortress Path (هفت‌خان شاهنامه) */}
          <path d="M 40 380 Q 150 320 200 240 T 360 120" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" strokeDasharray="14 10" fill="none" />

          {/* 3D Glowing Persian Dice Rolling */}
          <g transform="translate(200, 160)">
            <polygon points="0,-60 60,-25 0,10 -60,-25" fill="#f43f5e" stroke="#fbbf24" strokeWidth="3" />
            <polygon points="0,10 60,-25 60,50 0,85" fill="#be123c" stroke="#fbbf24" strokeWidth="3" />
            <polygon points="-60,-25 0,10 0,85 -60,50" fill="#9f1239" stroke="#fbbf24" strokeWidth="3" />
            {/* Golden Pips on 3D Dice */}
            <circle cx="0" cy="-25" r="5" fill="#fef08a" />
            <circle cx="-30" cy="30" r="4" fill="#fef08a" />
            <circle cx="-15" cy="50" r="4" fill="#fef08a" />
            <circle cx="30" cy="15" r="4" fill="#fef08a" />
            <circle cx="30" cy="45" r="4" fill="#fef08a" />
          </g>

          {/* Sohrab's Royal Warrior Helmet & Shield */}
          <g transform="translate(200, 360)">
            {/* Persian Bronze Shield */}
            <circle cx="0" cy="0" r="65" fill="#881337" stroke="#fbbf24" strokeWidth="4" />
            <circle cx="0" cy="0" r="45" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" fill="none" />
            <circle cx="0" cy="0" r="16" fill="#fbbf24" />
            {/* Cross Swords behind shield */}
            <line x1="-80" y1="-80" x2="80" y2="80" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
            <line x1="80" y1="-80" x2="-80" y2="80" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          </g>

          <rect x="10" y="10" width="380" height="460" rx="16" stroke="#f43f5e" strokeWidth="2.5" opacity="0.8" />
        </svg>
      );

    case 'sudoku':
      // Cyrus the Great & Ancient Cuneiform Numeric Cylinder
      return (
        <svg
          viewBox="0 0 400 480"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="cyrus-glow" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#115e59" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#042f2e" />
            </radialGradient>
          </defs>

          <rect width="400" height="480" fill="#042f2e" />
          <rect width="400" height="480" fill="url(#cyrus-glow)" />

          {/* Ancient Persian Cyrus Cylinder (استوانه حقوق بشر کوروش بزرگ) */}
          <g transform="translate(200, 160)">
            <ellipse cx="0" cy="0" rx="120" ry="40" fill="#ca8a04" stroke="#fef08a" strokeWidth="3" />
            <path d="M -120 0 L -120 100 C -120 135, 120 135, 120 100 L 120 0 Z" fill="#854d0e" stroke="#fef08a" strokeWidth="3" />
            {/* Cuneiform Inscription Lines */}
            <line x1="-90" y1="30" x2="90" y2="30" stroke="#fef08a" strokeWidth="2" strokeDasharray="8 6" />
            <line x1="-100" y1="55" x2="100" y2="55" stroke="#fef08a" strokeWidth="2" strokeDasharray="12 5" />
            <line x1="-90" y1="80" x2="90" y2="80" stroke="#fef08a" strokeWidth="2" strokeDasharray="10 7" />
          </g>

          {/* Sudoku 9x9 Mathematical Palace Grid */}
          <g transform="translate(200, 365)">
            <rect x="-70" y="-70" width="140" height="140" rx="12" fill="#0f172a" stroke="#2dd4bf" strokeWidth="3" />
            {/* Sub-grid thick lines */}
            <line x1="-23" y1="-65" x2="-23" y2="65" stroke="#2dd4bf" strokeWidth="2" />
            <line x1="23" y1="-65" x2="23" y2="65" stroke="#2dd4bf" strokeWidth="2" />
            <line x1="-65" y1="-23" x2="65" y2="-23" stroke="#2dd4bf" strokeWidth="2" />
            <line x1="-65" y1="23" x2="65" y2="23" stroke="#2dd4bf" strokeWidth="2" />
            {/* Persian Mathematical Digits */}
            <text x="-46" y="-38" fill="#fde047" fontSize="18" fontWeight="bold" textAnchor="middle">۷</text>
            <text x="0" y="-38" fill="#fde047" fontSize="18" fontWeight="bold" textAnchor="middle">۲</text>
            <text x="46" y="0" fill="#fde047" fontSize="18" fontWeight="bold" textAnchor="middle">۹</text>
            <text x="-46" y="46" fill="#fde047" fontSize="18" fontWeight="bold" textAnchor="middle">۴</text>
            <text x="0" y="46" fill="#fde047" fontSize="18" fontWeight="bold" textAnchor="middle">۵</text>
          </g>

          <rect x="10" y="10" width="380" height="460" rx="16" stroke="#2dd4bf" strokeWidth="2.5" opacity="0.7" />
        </svg>
      );

    case 'quiz':
    default:
      // Hakim Ferdowsi Tusi with the Holy Shahnameh Manuscripts
      return (
        <svg
          viewBox="0 0 400 480"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="ferdowsi-glow" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#581c87" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>

          <rect width="400" height="480" fill="#0f172a" />
          <rect width="400" height="480" fill="url(#ferdowsi-glow)" />

          {/* Illuminated Persian Manuscript Shahnameh (شاهنامه فردوسی) */}
          <g transform="translate(200, 180)">
            {/* Open Book Scrolls with Tazhib Gold Illumination */}
            <path d="M 0 40 Q -80 -20 -150 -10 L -140 -120 Q -70 -130 0 -80 Q 70 -130 140 -120 L 150 -10 Q 80 -20 0 40 Z" fill="#fef3c7" stroke="#ca8a04" strokeWidth="3" />
            {/* Book Spine */}
            <line x1="0" y1="-80" x2="0" y2="40" stroke="#78350f" strokeWidth="3" />
            {/* Persian Calligraphy Lines */}
            <line x1="-120" y1="-95" x2="-20" y2="-95" stroke="#78350f" strokeWidth="2" strokeDasharray="8 4" />
            <line x1="-125" y1="-70" x2="-20" y2="-70" stroke="#78350f" strokeWidth="2" strokeDasharray="10 5" />
            <line x1="-120" y1="-45" x2="-20" y2="-45" stroke="#78350f" strokeWidth="2" strokeDasharray="6 3" />
            <line x1="20" y1="-95" x2="120" y2="-95" stroke="#78350f" strokeWidth="2" strokeDasharray="8 4" />
            <line x1="20" y1="-70" x2="125" y2="-70" stroke="#78350f" strokeWidth="2" strokeDasharray="10 5" />
            <line x1="20" y1="-45" x2="120" y2="-45" stroke="#78350f" strokeWidth="2" strokeDasharray="6 3" />
          </g>

          {/* Persian Golden Quill Pen & Quill Halo */}
          <g transform="translate(200, 360)">
            <circle cx="0" cy="0" r="55" fill="#581c87" stroke="#c084fc" strokeWidth="3" />
            {/* Golden Feather Pen */}
            <path d="M 25 -40 C 35 -10, 10 30, -30 45 C -15 20, -5 -10, 5 -35 Z" fill="#facc15" />
            <line x1="25" y1="-40" x2="-30" y2="45" stroke="#78350f" strokeWidth="2" />
          </g>

          <rect x="10" y="10" width="380" height="460" rx="16" stroke="#c084fc" strokeWidth="2.5" opacity="0.8" />
        </svg>
      );
  }
};
