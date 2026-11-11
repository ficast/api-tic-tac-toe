const API_URL = process.env.API_URL || 'http://localhost:3000';

const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const movementsForTest = {
  firstPlayerWins: [
    { x: 0, y: 2 },
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 2 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ],
  secondPlayerWins: [
    { x: 0, y: 2 },
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: 2, y: 2 },
    { x: 1, y: 0 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ],
  draw: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 0, y: 1 },
    { x: 2, y: 1 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 1, y: 0 },
  ],
};

async function createGame() {
  const startNewGame = await fetch(`${API_URL}/game`, {
    method: 'POST',
  });
  const game = await startNewGame.json();
  const id = game.id;
  let nextPlayer = game.firstPlayer;
  // console.log('Primeiro Jogador:', game.firstPlayer);
  // console.log('Id da partida:', id);
  return { id, nextPlayer };
}

async function testingSuccessCases(arrayOfMovements) {
  let { id, nextPlayer } = await createGame();
  let movementResponse;

  for (const move of arrayOfMovements) {
    movementResponse = await makeMovement(id, nextPlayer, move);
    nextPlayer = movementResponse.nextPlayer;
  }
  return movementResponse;
}

async function testingFailFirstPlayerWrong(arrayOfMovements) {
  let { id, nextPlayer } = await createGame();
  // console.log(nextPlayer);
  nextPlayer = nextPlayer == 'X' ? 'O' : 'X';
  // console.log(nextPlayer);
  const movementResponse = await makeMovement(id, nextPlayer, arrayOfMovements[0]);
  return movementResponse;
}

async function testingPlayAfterWinner(arrayOfMovements) {
  let { id, nextPlayer } = await createGame();
  let movementResponse;

  for (const move of arrayOfMovements) {
    movementResponse = await makeMovement(id, nextPlayer, move);
    nextPlayer = movementResponse.nextPlayer;
  }

  movementResponse = await makeMovement(id, nextPlayer, arrayOfMovements[8]);

  return movementResponse;
}

async function makeMovement(id, player, position) {
  // console.log('MakeMovement ->> entrou');
  const makeCurrentMovement = await fetch(`${API_URL}/game/${id}/movement`, {
    method: 'POST',
    body: JSON.stringify({
      id,
      player,
      position,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
  const movementResponse = await makeCurrentMovement.json();
  // console.log('resposta:', movementResponse);
  return movementResponse;
}

describe('Testando os casos de Sucesso', () => {
  test('Criar novo Jogo', async () => {
    const game = await createGame();
    expect(game.id).toBeDefined();
    expect(game.nextPlayer).toBeDefined();
    expect(game.id).toHaveLength(36);
    expect(game.nextPlayer).toHaveLength(1);
  });

  test('Primeiro jogador ganha', async () => {
    const gameResult = await testingSuccessCases(movementsForTest.firstPlayerWins);
    expect(gameResult.msg).toBe('Partida finalizada');
    expect(gameResult.winner).toBeDefined();
    expect(gameResult.winner == 'X' || gameResult.winner == 'O').toBeTruthy();
    expect(gameResult.winner).not.toBe('Draw');
  });

  test('Segundo jogador ganha', async () => {
    const gameResult = await testingSuccessCases(movementsForTest.secondPlayerWins);
    expect(gameResult.msg).toBe('Partida finalizada');
    expect(gameResult.winner).toBeDefined();
    expect(gameResult.winner == 'X' || gameResult.winner == 'O').toBeTruthy();
    expect(gameResult.winner).not.toBe('Draw');
  });

  test('Jogo termina empatado', async () => {
    const gameResult = await testingSuccessCases(movementsForTest.draw);
    expect(gameResult.msg).toBe('Partida finalizada');
    expect(gameResult.winner).toBeDefined();
    expect(gameResult.winner == 'X' || gameResult.winner == 'O').toBeFalsy();
    expect(gameResult.winner).toBe('Draw');
  });

  test('Jogar três partidas simultaneamente', async () => {
    const gameOneResult = await testingSuccessCases(movementsForTest.firstPlayerWins);
    const gameTwoResult = await testingSuccessCases(movementsForTest.secondPlayerWins);
    const gameThreeResult = await testingSuccessCases(movementsForTest.draw);

    expect(gameOneResult.msg).toBe('Partida finalizada');
    expect(gameTwoResult.msg).toBe('Partida finalizada');
    expect(gameThreeResult.msg).toBe('Partida finalizada');
    expect(gameOneResult.winner).toBeDefined();
    expect(gameTwoResult.winner).toBeDefined();
    expect(gameThreeResult.winner).toBeDefined();
  });

  test('Jogar 100 partidas simultaneamente com movimentos aleatórios', async () => {
    let games = [];
    let counterReq = 0;
    while (counterReq < 100) {
      const sequenceOfMovements = shuffle(movementsForTest.firstPlayerWins);
      games[counterReq] = await testingSuccessCases(sequenceOfMovements);
      counterReq++;
    }

    let counterTest = 0;
    while (counterTest < 100) {
      expect(games[counterTest].msg).toBe('Partida finalizada');
      expect(games[counterTest].winner).toBeDefined();
      expect(
        games[counterTest].winner == 'X' ||
          games[counterTest].winner == 'O' ||
          games[counterTest].winner == 'Draw',
      ).toBeTruthy();
      expect(
        games[counterTest].winner == 'x' ||
          games[counterTest].winner == 'o' ||
          games[counterTest].winner == 'draw',
      ).toBeFalsy();
      counterTest++;
    }
  }, 30000);
});

describe('Testando os casos de Falha', () => {
  test('Testar com primeiro jogador errado', async () => {
    const gameErro = await testingFailFirstPlayerWrong(movementsForTest.firstPlayerWins);
    expect(gameErro.msg).toBe('Não é o turno do jogador');
  });

  test('Testar movimento em jogo já finalizado', async () => {
    const gameErro = await testingPlayAfterWinner(movementsForTest.firstPlayerWins);
    expect(gameErro.msg).toBe('Partida finalizada');
  });

  test('Testar partida com id inexistente', async () => {
    const gameErro = await makeMovement('666999', 'X', { x: 0, y: 0 });
    expect(gameErro.msg).toBe('Partida 666999 não encontrada');
  });

  test('Testar partida com posição inexistente > 2', async () => {
    const { id, nextPlayer } = await createGame();
    const gameErro = await makeMovement(id, nextPlayer, { x: 3, y: 3 });
    expect(gameErro.msg).toBe('Jogada inválida: posição inexistente');
  });

  test('Testar partida com posição inexistente < 0', async () => {
    const { id, nextPlayer } = await createGame();
    const gameErro = await makeMovement(id, nextPlayer, { x: -3, y: -3 });
    expect(gameErro.msg).toBe('Jogada inválida: posição inexistente');
  });

  test('Testar movimentos repetidos', async () => {
    const { id, nextPlayer } = await createGame();
    const response = await makeMovement(id, nextPlayer, { x: 0, y: 0 });
    const gameErro = await makeMovement(id, response.nextPlayer, { x: 0, y: 0 });
    expect(gameErro.msg).toBe('Jogada inválida: já realizada anteriormente');
  });
});

describe('Testando o modo contra o bot', () => {
  async function createBotGame(body) {
    const response = await fetch(`${API_URL}/game`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    return { status: response.status, data: await response.json() };
  }

  const ALL_POSITIONS = [0, 1, 2].flatMap((y) => [0, 1, 2].map((x) => ({ x, y })));
  const samePosition = (a) => (b) => a.x === b.x && a.y === b.y;

  test('Partida contra o bot vai até o fim', async () => {
    const { data: game } = await createBotGame({ mode: 'bot', difficulty: 'dificil' });
    expect(game.player).toBe('X');

    const taken = [];
    if (game.botMove) {
      expect(game.firstPlayer).toBe('O');
      expect(game.nextPlayer).toBe('X');
      taken.push(game.botMove);
    }

    let response;
    do {
      const move = ALL_POSITIONS.find((p) => !taken.some(samePosition(p)));
      response = await makeMovement(game.id, 'X', move);
      taken.push(move);
      if (response.botMove) {
        expect(taken.some(samePosition(response.botMove))).toBeFalsy();
        taken.push(response.botMove);
      }
    } while (!response.winner);

    expect(response.msg).toBe('Partida finalizada');
    expect(['O', 'Draw']).toContain(response.winner);
  });

  test('Usuário não pode jogar no lugar do bot', async () => {
    const { data: game } = await createBotGame({ mode: 'bot' });
    const gameErro = await makeMovement(game.id, 'O', { x: 0, y: 0 });
    expect(gameErro.msg).toBe('Não é o turno do jogador');
  });

  test('Dificuldade inválida', async () => {
    const { status, data } = await createBotGame({ mode: 'bot', difficulty: 'impossivel' });
    expect(status).toBe(400);
    expect(data.msg).toBe('Dificuldade inválida: impossivel');
  });
});
