
/**
 * Solves a Sudoku board using backtracking.
 * @param {number[][]} board - NxN array, 0 = empty (N = 4 or 9)
 * @returns {number[][]|null} - solved board or null if unsolvable
 */
function solveSudoku(board) {
    const grid = board.map(row => [...row]);
    const size = grid.length;
    const boxSize = Math.floor(Math.sqrt(size));

    if (solveGrid(grid, size, boxSize)) {
        return grid;
    }
    return null;
}

function solveGrid(grid, size, boxSize) {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (grid[row][col] === 0) {
                for (let num = 1; num <= size; num++) {
                    if (isValidPlacement(grid, row, col, num, size, boxSize)) {
                        grid[row][col] = num;

                        if (solveGrid(grid, size, boxSize)) {
                            return true;
                        }

                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValidPlacement(grid, row, col, num, size, boxSize) {

    for (let j = 0; j < size; j++) {
        if (grid[row][j] === num) return false;
    }

    for (let i = 0; i < size; i++) {
        if (grid[i][col] === num) return false;
    }

    const startRow = Math.floor(row / boxSize) * boxSize;
    const startCol = Math.floor(col / boxSize) * boxSize;
    for (let i = startRow; i < startRow + boxSize; i++) {
        for (let j = startCol; j < startCol + boxSize; j++) {
            if (grid[i][j] === num) return false;
        }
    }

    return true;
}

function isValid(grid, row, col, num) {
    return isValidPlacement(grid, row, col, num, 9, 3);
}

function solve(grid) {
    return solveGrid(grid, 9, 3);
}
