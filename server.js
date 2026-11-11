'use strict';

const http = require('http');
const path = require('path');
const { randomUUID: generateId } = require('crypto');
const express = require('express');
const services = require('./server/services');
const { getFirstPlayer } = services;
const { makeMovement, playBotTurn, games } = require('./server/makeMovement');
const { DIFFICULTIES } = require('./server/bot');

// Inicializando o servidor e definindo a porta

const app = express();
const port = Number(process.env.PORT) || 3000;
app.set('port', port);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const router = express.Router();

const createNewGame = (player) => {
  return {
    currentPlayer: player,
    round: 1,
    positionsPlayed: {
      X: [],
      O: [],
    },
  };
};

// Body opcional: { mode: 'bot', difficulty: 'facil' | 'medio' | 'dificil' }
// No modo bot, o usuário joga sempre com X e o bot com O; quem começa continua sendo sorteado.
router.post('/game', (req, res) => {
  const { mode, difficulty = 'dificil' } = req.body || {};

  if (mode !== undefined && mode !== 'bot') {
    return res.status(400).send({ msg: `Modo inválido: ${mode}` });
  }
  if (mode === 'bot' && !DIFFICULTIES.includes(difficulty)) {
    return res.status(400).send({ msg: `Dificuldade inválida: ${difficulty}` });
  }

  const gameId = generateId();
  const currentPlayer = getFirstPlayer();
  games[gameId] = createNewGame(currentPlayer);

  if (mode !== 'bot') {
    return res.status(200).send({
      id: gameId,
      firstPlayer: currentPlayer,
    });
  }

  games[gameId].bot = { player: 'O', difficulty };
  const botResult = playBotTurn(gameId);

  return res.status(200).send({
    id: gameId,
    firstPlayer: currentPlayer,
    player: 'X',
    difficulty,
    ...(botResult && { botMove: botResult.botMove, nextPlayer: botResult.nextPlayer }),
  });
});

router.post('/game/:id/movement', makeMovement);

app.use('/', router);
server.listen(port);
console.log(`API Inicializada em http://localhost:${port}`);
