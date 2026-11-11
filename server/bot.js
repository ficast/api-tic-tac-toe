const { changeCurrentPlayer } = require('./services');

const DIFFICULTIES = ['facil', 'medio', 'dificil'];

// Chance de o bot escolher a melhor jogada em cada nível
const SKILL = { facil: 0, medio: 0.6, dificil: 1 };

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const toIndex = ({ x, y }) => y * 3 + x;
const toPosition = (index) => ({ x: index % 3, y: Math.floor(index / 3) });

const buildBoard = (positionsPlayed) => {
  const board = Array(9).fill(null);
  for (const player of ['X', 'O']) {
    for (const position of positionsPlayed[player]) board[toIndex(position)] = player;
  }
  return board;
};

const winnerOf = (board) => {
  const line = LINES.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  return line ? board[line[0]] : null;
};

const emptyCells = (board) => board.flatMap((cell, i) => (cell ? [] : [i]));

// Cache de estados já avaliados. O jogo tem poucos milhares de estados, então ele fica pequeno.
// A profundidade não entra na chave porque é determinada pelo próprio tabuleiro.
const memo = new Map();

// Minimax: +10 vitória do bot, -10 derrota; a profundidade faz preferir vitórias rápidas e derrotas lentas.
const minimax = (board, turn, bot, depth) => {
  const key = `${board.map((c) => c || '-').join('')}${turn}${bot}`;
  if (memo.has(key)) return memo.get(key);

  let result;
  const winner = winnerOf(board);
  const free = emptyCells(board);
  if (winner) {
    result = winner === bot ? 10 - depth : depth - 10;
  } else if (free.length === 0) {
    result = 0;
  } else {
    const scores = free.map((i) => {
      board[i] = turn;
      const score = minimax(board, changeCurrentPlayer(turn), bot, depth + 1);
      board[i] = null;
      return score;
    });
    result = turn === bot ? Math.max(...scores) : Math.min(...scores);
  }

  memo.set(key, result);
  return result;
};

const bestMoves = (board, bot) => {
  const free = emptyCells(board);
  const scored = free.map((i) => {
    board[i] = bot;
    const score = minimax(board, changeCurrentPlayer(bot), bot, 1);
    board[i] = null;
    return { i, score };
  });
  const top = Math.max(...scored.map((s) => s.score));
  return scored.filter((s) => s.score === top).map((s) => s.i);
};

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

const chooseMove = (positionsPlayed, bot, difficulty = 'dificil') => {
  const board = buildBoard(positionsPlayed);
  const free = emptyCells(board);
  const useBest = Math.random() < SKILL[difficulty];
  const index = pickRandom(useBest ? bestMoves(board, bot) : free);
  return toPosition(index);
};

module.exports = {
  DIFFICULTIES,
  chooseMove,
};
