import { OthelloBoard, OthelloDisc } from '../types';

export function createInitialOthelloBoard(): OthelloBoard {
  const board: OthelloBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  board[3][3] = 'white';
  board[4][4] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';

  return board;
}

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

export function getFlips(
  board: OthelloBoard,
  r: number,
  c: number,
  color: 'black' | 'white'
): { r: number; c: number }[] {
  if (board[r][c] !== null) return [];

  const opponent: 'black' | 'white' = color === 'black' ? 'white' : 'black';
  let totalFlips: { r: number; c: number }[] = [];

  for (const [dr, dc] of DIRS) {
    const temp: { r: number; c: number }[] = [];
    let nr = r + dr;
    let nc = c + dc;

    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === opponent) {
      temp.push({ r: nr, c: nc });
      nr += dr;
      nc += dc;
    }

    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === color && temp.length > 0) {
      totalFlips = totalFlips.concat(temp);
    }
  }

  return totalFlips;
}

export function getValidMoves(
  board: OthelloBoard,
  color: 'black' | 'white'
): { r: number; c: number; flips: { r: number; c: number }[] }[] {
  const moves: { r: number; c: number; flips: { r: number; c: number }[] }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === null) {
        const flips = getFlips(board, r, c, color);
        if (flips.length > 0) {
          moves.push({ r, c, flips });
        }
      }
    }
  }

  return moves;
}

export function countDiscs(board: OthelloBoard): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === 'black') black++;
      else if (board[r][c] === 'white') white++;
    }
  }
  return { black, white };
}

// Positional weight matrix for AI
const WEIGHTS = [
  [100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [ 10,  -2,  -1,  -1,  -1,  -1,  -2,  10],
  [  5,  -2,  -1,   0,   0,  -1,  -2,   5],
  [  5,  -2,  -1,   0,   0,  -1,  -2,   5],
  [ 10,  -2,  -1,  -1,  -1,  -1,  -2,  10],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [100, -20,  10,   5,   5,  10, -20, 100],
];

export function getBestOthelloAIMove(
  board: OthelloBoard,
  color: 'black' | 'white'
): { r: number; c: number; flips: { r: number; c: number }[] } | null {
  const validMoves = getValidMoves(board, color);
  if (validMoves.length === 0) return null;

  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    let score = WEIGHTS[move.r][move.c] + move.flips.length * 2;
    // Corners are crucial
    if ((move.r === 0 || move.r === 7) && (move.c === 0 || move.c === 7)) {
      score += 150;
    }
    score += Math.random() * 5;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
