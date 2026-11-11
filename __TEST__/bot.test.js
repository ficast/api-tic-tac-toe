const { chooseMove } = require('../server/bot');
const { getWinner, isRepeatedPosition } = require('../server/services');

const emptyGame = () => ({ X: [], O: [] });

const freePositions = (positionsPlayed) => {
  const free = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      if (!isRepeatedPosition(positionsPlayed, { x, y })) free.push({ x, y });
    }
  }
  return free;
};

// Joga uma partida completa entre o bot (O) e um oponente que escolhe casas livres ao acaso.
const playAgainstRandom = (difficulty, botStarts) => {
  const positionsPlayed = emptyGame();
  let turn = botStarts ? 'O' : 'X';

  for (let round = 1; round <= 9; round++) {
    const free = freePositions(positionsPlayed);
    const move = turn === 'O'
      ? chooseMove(positionsPlayed, 'O', difficulty)
      : free[Math.floor(Math.random() * free.length)];

    expect(free).toContainEqual(move);
    positionsPlayed[turn].push(move);

    const winner = getWinner(positionsPlayed.X, positionsPlayed.O);
    if (winner) return winner;
    turn = turn === 'X' ? 'O' : 'X';
  }
  return 'Draw';
};

describe('Bot', () => {
  test('completa a vitória quando tem duas em linha', () => {
    const positionsPlayed = {
      O: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      X: [{ x: 0, y: 1 }, { x: 1, y: 1 }],
    };
    expect(chooseMove(positionsPlayed, 'O', 'dificil')).toEqual({ x: 2, y: 0 });
  });

  test('bloqueia o adversário quando ele está prestes a ganhar', () => {
    const positionsPlayed = {
      X: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      O: [{ x: 1, y: 0 }],
    };
    expect(chooseMove(positionsPlayed, 'O', 'dificil')).toEqual({ x: 2, y: 2 });
  });

  test('no difícil nunca perde para jogadas aleatórias', () => {
    for (let i = 0; i < 200; i++) {
      expect(playAgainstRandom('dificil', i % 2 === 0)).not.toBe('X');
    }
  });

  test('em todos os níveis só escolhe casas livres', () => {
    for (const difficulty of ['facil', 'medio', 'dificil']) {
      for (let i = 0; i < 30; i++) playAgainstRandom(difficulty, i % 2 === 0);
    }
  });
});
