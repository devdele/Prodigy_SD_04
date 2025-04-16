document.addEventListener('DOMContentLoaded', () => {
    // Generate the grid
    const grid = document.getElementById('grid');

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'cell';
            input.id = `cell-${row}-${col}`;
            input.maxLength = 1;

            // Add borders for 3x3 subgrids
            if (col === 2 || col === 5) {
                input.classList.add('cell-3-border-right');
            }
            if (row === 2 || row === 5) {
                input.classList.add('cell-3-border-bottom');
            }

            // Only allow numbers 1-9
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (!/^[1-9]$/.test(value) && value !== '') {
                    e.target.value = '';
                }
            });

            grid.appendChild(input);
        }
    }

    // Button event listeners
    document.getElementById('solve-btn').addEventListener('click', solveSudoku);
    document.getElementById('clear-btn').addEventListener('click', clearGrid);
    document.getElementById('example-easy').addEventListener('click', () => loadExample('easy'));
    document.getElementById('example-medium').addEventListener('click', () => loadExample('medium'));
    document.getElementById('example-hard').addEventListener('click', () => loadExample('hard'));

    // Examples
    const examples = {
        easy: [
            "530070000",
            "600195000",
            "098000060",
            "800060003",
            "400803001",
            "700020006",
            "060000280",
            "000419005",
            "000080079"
        ],
        medium: [
            "002030008",
            "000008000",
            "031020000",
            "060000075",
            "490000016",
            "100000020",
            "000060430",
            "000300000",
            "900040100"
        ],
        hard: [
            "800000000",
            "003600000",
            "070090200",
            "050007000",
            "000045700",
            "000100030",
            "001000068",
            "008500010",
            "090000400"
        ]
    };

    // Load an example puzzle
    function loadExample(difficulty) {
        const puzzle = examples[difficulty];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = puzzle[row][col];
                const cell = document.getElementById(`cell-${row}-${col}`);
                cell.value = value !== '0' ? value : '';
            }
        }
        document.getElementById('status').textContent = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} puzzle loaded. Click Solve to solve.`;
    }

    // Get current grid state
    function getGrid() {
        const grid = [];
        for (let row = 0; row < 9; row++) {
            const rowArray = [];
            for (let col = 0; col < 9; col++) {
                const value = document.getElementById(`cell-${row}-${col}`).value;
                rowArray.push(value === '' ? 0 : parseInt(value));
            }
            grid.push(rowArray);
        }
        return grid;
    }

    // Set grid values
    function setGrid(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                const value = grid[row][col];
                cell.value = value !== 0 ? value : '';
            }
        }
    }

    // Clear the grid
    function clearGrid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                document.getElementById(`cell-${row}-${col}`).value = '';
            }
        }
        document.getElementById('status').textContent = 'Grid cleared. Enter numbers and click Solve.';
    }

    // Check if a number can be placed at the given position
    function isValid(grid, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) {
                return false;
            }
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) {
                return false;
            }
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxRow + i][boxCol + j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    // Solve the Sudoku puzzle using backtracking
    function solve(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(grid, row, col, num)) {
                            grid[row][col] = num;

                            if (solve(grid)) {
                                return true;
                            }

                            // If placing num in position (row, col) doesn't lead to a solution,
                            // reset and try next number
                            grid[row][col] = 0;
                        }
                    }
                    // If no number can be placed at this position
                    return false;
                }
            }
        }
        // All cells are filled
        return true;
    }

    // Main function to solve the Sudoku
    function solveSudoku() {
        const statusElement = document.getElementById('status');
        statusElement.textContent = 'Solving...';

        // Disable solve button while solving
        const solveBtn = document.getElementById('solve-btn');
        solveBtn.disabled = true;

        // Get the current grid
        const grid = getGrid();

        // Simple validation for the initial grid
        if (!isValidGrid(grid)) {
            statusElement.textContent = 'Invalid puzzle! Please check your input.';
            solveBtn.disabled = false;
            return;
        }

        // Solve after a small delay to allow UI update
        setTimeout(() => {
            const startTime = performance.now();
            const success = solve(grid);
            const endTime = performance.now();

            if (success) {
                setGrid(grid);
                statusElement.textContent = `Solved in ${((endTime - startTime) / 1000).toFixed(2)} seconds!`;
            } else {
                statusElement.textContent = 'No solution exists for this puzzle!';
            }

            solveBtn.disabled = false;
        }, 50);
    }

    // Validate the initial grid to ensure it's a valid Sudoku
    function isValidGrid(grid) {
        // Check rows
        for (let row = 0; row < 9; row++) {
            const seen = new Set();
            for (let col = 0; col < 9; col++) {
                const num = grid[row][col];
                if (num !== 0) {
                    if (seen.has(num)) return false;
                    seen.add(num);
                }
            }
        }

        // Check columns
        for (let col = 0; col < 9; col++) {
            const seen = new Set();
            for (let row = 0; row < 9; row++) {
                const num = grid[row][col];
                if (num !== 0) {
                    if (seen.has(num)) return false;
                    seen.add(num);
                }
            }
        }

        // Check 3x3 boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const seen = new Set();
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const row = boxRow * 3 + i;
                        const col = boxCol * 3 + j;
                        const num = grid[row][col];
                        if (num !== 0) {
                            if (seen.has(num)) return false;
                            seen.add(num);
                        }
                    }
                }
            }
        }

        return true;
    }
});
