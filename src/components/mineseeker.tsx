"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type CellState = "hidden" | "revealed" | "flagged" | "exploded";
type CellValue = number | "mine";

interface Cell {
  state: CellState;
  value: CellValue;
}

const GRID_SIZE = 10;
const MINE_COUNT = 10;

export function MineseekerComponent() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [flags, setFlags] = useState(0);

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = (safeRow: number = -1, safeCol: number = -1) => {
    let newGrid: Cell[][];
    do {
      newGrid = Array(GRID_SIZE)
        .fill(null)
        .map(() =>
          Array(GRID_SIZE)
            .fill(null)
            .map(() => ({ state: "hidden", value: 0 }))
        );

      // Place mines
      let minesPlaced = 0;
      while (minesPlaced < MINE_COUNT) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        if (
          newGrid[row][col].value !== "mine" &&
          (row !== safeRow || col !== safeCol)
        ) {
          newGrid[row][col].value = "mine";
          minesPlaced++;
        }
      }

      // Calculate adjacent mine counts
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (newGrid[row][col].value !== "mine") {
            newGrid[row][col].value = countAdjacentMines(newGrid, row, col);
          }
        }
      }
    } while (
      safeRow !== -1 &&
      safeCol !== -1 &&
      newGrid[safeRow][safeCol].value !== 0
    );

    setGrid(newGrid);
    console.log(newGrid);
    setGameOver(false);
    setWin(false);
    setIsFirstClick(true);
    setFlags(0);
  };

  const countAdjacentMines = (
    grid: Cell[][],
    row: number,
    col: number
  ): number => {
    let count = 0;
    for (
      let r = Math.max(0, row - 1);
      r <= Math.min(GRID_SIZE - 1, row + 1);
      r++
    ) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(GRID_SIZE - 1, col + 1);
        c++
      ) {
        if (grid[r][c].value === "mine") count++;
      }
    }
    return count;
  };

  const revealCell = (row: number, col: number) => {
    if (gameOver || win || grid[row][col].state !== "hidden") return;

    let newGrid = [...grid];

    if (isFirstClick) {
      if (newGrid[row][col].value === "mine" || newGrid[row][col].value !== 0) {
        initializeGrid(row, col);
        newGrid = [...grid];
      }
      setIsFirstClick(false);
    }

    if (newGrid[row][col].value === "mine") {
      newGrid[row][col].state = "exploded";
      setGameOver(true);
    } else {
      revealAdjacentCells(newGrid, row, col);
    }

    setGrid(newGrid);
    checkWinCondition();
  };

  const revealAdjacentCells = (grid: Cell[][], row: number, col: number) => {
    if (
      row < 0 ||
      row >= GRID_SIZE ||
      col < 0 ||
      col >= GRID_SIZE ||
      grid[row][col].state !== "hidden"
    )
      return;

    grid[row][col].state = "revealed";

    if (grid[row][col].value === 0) {
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          revealAdjacentCells(grid, r, c);
        }
      }
    }
  };

  const toggleFlag = (row: number, col: number) => {
    if (gameOver || win || grid[row][col].state === "revealed") return;

    const newGrid = [...grid];
    newGrid[row][col].state =
      newGrid[row][col].state === "flagged" ? "hidden" : "flagged";
    setGrid(newGrid);
    setFlags(flags + 1);
  };

  const checkWinCondition = () => {
    const allNonMinesRevealed = grid.every((row) =>
      row.every((cell) => cell.value === "mine" || cell.state === "revealed")
    );
    if (allNonMinesRevealed) {
      setWin(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-100">
      <h1 className="text-4xl font-bold mb-4">Mineseeker</h1>
      <div className="mb-4">
        <Button onClick={() => initializeGrid()}>New Game</Button>
      </div>
      <div>{"Flags: " + flags + " Mines: " + MINE_COUNT}</div>
      <div className="grid p-4 bg-white rounded-lg shadow-lg">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`w-8 h-8 flex items-center justify-center border ${
                  cell.state === "revealed"
                    ? "bg-gray-200 text-black"
                    : cell.state === "exploded"
                    ? "bg-red-500 text-white"
                    : "bg-gray-300 hover:bg-gray-400"
                } ${cell.state === "flagged" ? "bg-yellow-300" : ""}`}
                onClick={() => revealCell(rowIndex, colIndex)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFlag(rowIndex, colIndex);
                }}
                disabled={gameOver || win}
              >
                {cell.state === "revealed" && cell.value !== 0 && cell.value}
                {(cell.state === "revealed" || cell.state === "exploded") &&
                  cell.value === "mine" &&
                  "💣"}
                {cell.state === "flagged" && "🚩"}
              </button>
            ))}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="mt-4 text-2xl font-bold text-red-500">Game Over!</div>
      )}
      {win && (
        <div className="mt-4 text-2xl font-bold text-green-500">You Win!</div>
      )}
    </div>
  );
}
