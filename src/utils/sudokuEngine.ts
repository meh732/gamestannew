import { SudokuDifficulty, SudokuGrid } from '../types';

export function createEmptyGrid(): SudokuGrid {
  return Array(9).fill(0).map(() => Array(9).fill(0));
}

// Check if placing num at grid[r][c] is valid according to Sudoku rules
export function isValid(grid: SudokuGrid, r: number, c: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[r][i] === num && i !== c) return false;
    if (grid[i][c] === num && i !== r) return false;
  }

  const boxR = Math.floor(r / 3) * 3;
  const boxC = Math.floor(c / 3) * 3;

  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      const nr = boxR + dr;
      const nc = boxC + dc;
      if (grid[nr][nc] === num && (nr !== r || nc !== c)) {
        return false;
      }
    }
  }

  return true;
}

// Find all conflicting cells in a Sudoku board
export function findConflicts(grid: SudokuGrid): Set<string> {
  const conflicts = new Set<string>();

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        if (!isValid(grid, r, c, val)) {
          conflicts.add(`${r},${c}`);
        }
      }
    }
  }

  return conflicts;
}

// Backtracking solver
export function solveSudoku(grid: SudokuGrid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValid(grid, r, c, num)) {
            grid[r][c] = num;
            if (solveSudoku(grid)) {
              return true;
            }
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Generate new Sudoku puzzle
export function generateSudoku(difficulty: SudokuDifficulty): {
  initial: SudokuGrid;
  solution: SudokuGrid;
} {
  const full = createEmptyGrid();
  solveSudoku(full);

  const solution = full.map((row) => [...row]);
  const initial = full.map((row) => [...row]);

  let cluesToRemove: number;
  switch (difficulty) {
    case 'easy':
      cluesToRemove = 30;
      break;
    case 'medium':
      cluesToRemove = 42;
      break;
    case 'hard':
      cluesToRemove = 52;
      break;
    case 'expert':
      cluesToRemove = 58;
      break;
  }

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  positions.sort(() => Math.random() - 0.5);

  for (let i = 0; i < cluesToRemove && i < positions.length; i++) {
    const [r, c] = positions[i];
    initial[r][c] = 0;
  }

  return { initial, solution };
}
