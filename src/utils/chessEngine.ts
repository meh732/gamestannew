import { ChessBoard, ChessColor, ChessPiece, ChessPieceType } from '../types';

export const INITIAL_CHESS_BOARD: ChessBoard = [
  [
    { type: 'r', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'q', color: 'b' },
    { type: 'k', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'r', color: 'b' },
  ],
  [
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
  ],
  [
    { type: 'r', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'q', color: 'w' },
    { type: 'k', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'r', color: 'w' },
  ],
];

export const PIECE_SYMBOLS: Record<string, string> = {
  'w-k': '♔',
  'w-q': '♕',
  'w-r': '♖',
  'w-b': '♗',
  'w-n': '♘',
  'w-p': '♙',
  'b-k': '♚',
  'b-q': '♛',
  'b-r': '♜',
  'b-b': '♝',
  'b-n': '♞',
  'b-p': '♟',
};

export const PIECE_VALUES: Record<ChessPieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export function cloneBoard(board: ChessBoard): ChessBoard {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

// Generate pseudo-legal moves
export function getPseudoLegalMoves(
  board: ChessBoard,
  r: number,
  c: number
): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];

  const moves: [number, number][] = [];
  const color = piece.color;
  const isOpponent = (nr: number, nc: number) => {
    const target = board[nr][nc];
    return target !== null && target.color !== color;
  };
  const isEmpty = (nr: number, nc: number) => board[nr][nc] === null;

  const inBounds = (nr: number, nc: number) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8;

  switch (piece.type) {
    case 'p': {
      const dir = color === 'w' ? -1 : 1;
      const startRank = color === 'w' ? 6 : 1;

      // 1 square forward
      if (inBounds(r + dir, c) && isEmpty(r + dir, c)) {
        moves.push([r + dir, c]);
        // 2 squares forward from starting rank
        if (r === startRank && inBounds(r + 2 * dir, c) && isEmpty(r + 2 * dir, c)) {
          moves.push([r + 2 * dir, c]);
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const nr = r + dir;
        const nc = c + dc;
        if (inBounds(nr, nc) && isOpponent(nr, nc)) {
          moves.push([nr, nc]);
        }
      }
      break;
    }

    case 'n': {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dr, dc] of offsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc) && (isEmpty(nr, nc) || isOpponent(nr, nc))) {
          moves.push([nr, nc]);
        }
      }
      break;
    }

    case 'b':
    case 'r':
    case 'q': {
      const directions: [number, number][] = [];
      if (piece.type === 'b' || piece.type === 'q') {
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      }
      if (piece.type === 'r' || piece.type === 'q') {
        directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      }

      for (const [dr, dc] of directions) {
        let nr = r + dr;
        let nc = c + dc;
        while (inBounds(nr, nc)) {
          if (isEmpty(nr, nc)) {
            moves.push([nr, nc]);
          } else {
            if (isOpponent(nr, nc)) {
              moves.push([nr, nc]);
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'k': {
      const offsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [dr, dc] of offsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc) && (isEmpty(nr, nc) || isOpponent(nr, nc))) {
          moves.push([nr, nc]);
        }
      }
      break;
    }
  }

  return moves;
}

// Find king position
export function findKing(board: ChessBoard, color: ChessColor): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

// Is king under check
export function isKingInCheck(board: ChessBoard, color: ChessColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponentColor: ChessColor = color === 'w' ? 'b' : 'w';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === opponentColor) {
        const pseudo = getPseudoLegalMoves(board, r, c);
        if (pseudo.some(([pr, pc]) => pr === kingPos[0] && pc === kingPos[1])) {
          return true;
        }
      }
    }
  }
  return false;
}

// Get fully legal moves (ensures move does not leave own king in check)
export function getLegalMoves(
  board: ChessBoard,
  r: number,
  c: number
): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];

  const pseudo = getPseudoLegalMoves(board, r, c);
  const legal: [number, number][] = [];

  for (const [tr, tc] of pseudo) {
    const simBoard = cloneBoard(board);
    simBoard[tr][tc] = simBoard[r][c];
    simBoard[r][c] = null;

    // Auto promote pawn in simulation
    if (piece.type === 'p' && (tr === 0 || tr === 7)) {
      simBoard[tr][tc] = { type: 'q', color: piece.color };
    }

    if (!isKingInCheck(simBoard, piece.color)) {
      legal.push([tr, tc]);
    }
  }

  return legal;
}

// Get all legal moves for a player
export function getAllLegalMoves(
  board: ChessBoard,
  color: ChessColor
): { from: [number, number]; to: [number, number] }[] {
  const allMoves: { from: [number, number]; to: [number, number] }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        const moves = getLegalMoves(board, r, c);
        for (const m of moves) {
          allMoves.push({ from: [r, c], to: m });
        }
      }
    }
  }
  return allMoves;
}

// Notation generator (e.g. Nf3, e4, Qxf7+)
export function getAlgebraicNotation(
  from: [number, number],
  to: [number, number],
  piece: ChessPiece,
  captured: ChessPiece | null,
  isCheck: boolean,
  isCheckmate: boolean
): string {
  const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const fromSquare = `${cols[from[1]]}${8 - from[0]}`;
  const toSquare = `${cols[to[1]]}${8 - to[0]}`;

  let piecePrefix = '';
  if (piece.type !== 'p') {
    piecePrefix = piece.type.toUpperCase();
  }

  const captureSymbol = captured ? (piece.type === 'p' ? cols[from[1]] + 'x' : 'x') : '';
  let note = `${piecePrefix}${captureSymbol}${toSquare}`;

  if (isCheckmate) {
    note += '#';
  } else if (isCheck) {
    note += '+';
  }

  return note;
}

// AI Engine Move Evaluator
export function getBestAIMove(
  board: ChessBoard,
  aiColor: ChessColor
): { from: [number, number]; to: [number, number] } | null {
  const allMoves = getAllLegalMoves(board, aiColor);
  if (allMoves.length === 0) return null;

  let bestMove = allMoves[0];
  let bestScore = -Infinity;

  for (const move of allMoves) {
    const simBoard = cloneBoard(board);
    const captured = simBoard[move.to[0]][move.to[1]];
    const movingPiece = simBoard[move.from[0]][move.from[1]]!;
    
    simBoard[move.to[0]][move.to[1]] = movingPiece;
    simBoard[move.from[0]][move.from[1]] = null;

    if (movingPiece.type === 'p' && (move.to[0] === 0 || move.to[0] === 7)) {
      simBoard[move.to[0]][move.to[1]] = { type: 'q', color: aiColor };
    }

    let score = 0;
    if (captured) {
      score += PIECE_VALUES[captured.type] * 10 - PIECE_VALUES[movingPiece.type];
    }

    // Center preference
    const centerDist = Math.abs(3.5 - move.to[0]) + Math.abs(3.5 - move.to[1]);
    score += (7 - centerDist) * 3;

    // Check bonus
    const opponentColor: ChessColor = aiColor === 'w' ? 'b' : 'w';
    if (isKingInCheck(simBoard, opponentColor)) {
      score += 50;
    }

    // Random noise to prevent robotic repetition
    score += Math.random() * 8;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
