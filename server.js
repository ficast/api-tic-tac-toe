'use strict';

const http = require('http');
const { randomUUID: generateId } = require('crypto');
const express = require('express');
const services = require('./server/services');
const { getFirstPlayer } = services;
const { makeMovement, games } = require('./server/makeMovement');

// Inicializando o servidor e definindo a porta

const app = express();
const port = 3000;
app.set('port', port);

app.use(express.json());

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

router.post('/game', (req, res) => {
  const gameId = generateId();
  const currentPlayer = getFirstPlayer();
  games[gameId] = createNewGame(currentPlayer);
  return res.status(200).send({
    id: gameId,
    firstPlayer: currentPlayer,
  });
});

router.post('/game/:id/movement', makeMovement);

app.use('/', router);
server.listen(port);
console.log('API Inicializada');
