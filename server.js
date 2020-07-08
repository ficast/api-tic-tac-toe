'use strict';

const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const { v4: generateId } = require('uuid');
const _ = require('lodash');

// Inicializando o servidor e definindo a porta

const app = express();
const port = 3000;
app.set('port', port);

app.use(bodyParser.json());

const server = http.createServer(app);
const router = express.Router();

// Funções chamadas nas rotas

const getFirstPlayer = () => (Math.random() >= 0.5 ? 'X' : 'O');

const changeCurrentPlayer = (currentPlayer) => (currentPlayer === 'X' ? 'O' : 'X');

const conditionsToWin = (moves) => {
  const conditionForDiagonalUp = moves.filter(({ x, y }) => x == y);
  const conditionForDiagonalDown = moves.filter(({ x, y }) => x == 2 - y);

  const conditionForColumn = moves.reduce(
    (acc, { x }) => {
      acc[x] = acc[x] + 1;
      return acc;
    },
    [0, 0, 0],
  );
  const conditionForLine = moves.reduce(
    (acc, { y }) => {
      acc[y] = acc[y] + 1;
      return acc;
    },
    [0, 0, 0],
  );

  if (conditionForDiagonalUp.length == 3 || conditionForDiagonalDown.length == 3) return true;
  if (conditionForLine.indexOf(3) > 0 || conditionForColumn.indexOf(3) > 0) return true;
  return false;
};

const getWinner = (movesByPlayerX, movesByPlayerO) => {
  const playerO = conditionsToWin(movesByPlayerO);
  const playerX = conditionsToWin(movesByPlayerX);

  if (playerO) return 'O';
  if (playerX) return 'X';
};

const isRepeatedPosition = (positionsPlayed, newPosition) => {
  const { x: newX, y: newY } = newPosition;
  const haveXplayed = positionsPlayed.X.some(({ x, y }) => x == newX && y == newY);
  const haveOplayed = positionsPlayed.O.some(({ x, y }) => x == newX && y == newY);

  if (haveOplayed) return true;
  if (haveXplayed) return true;
};

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

// Armazenamento das partidas

let games = {};

// Iniciando nova partida

router.post('/game', (req, res) => {
  const gameId = generateId();
  const currentPlayer = getFirstPlayer();
  games = { ...games, [gameId]: createNewGame(currentPlayer) };
  res.status(200).send({
    id: gameId,
    firstPlayer: currentPlayer,
  });
});

// Realizando movimentos

router.post('/game/:id/movement', (req, res) => {
  // const { id } = req.params;
  const { player, position, id } = req.body;

  if (!games[id]) {
    res.status(400).send({
      msg: `Partida ${id} não encontrada`,
    });
    return null;
  }

  let { currentPlayer, round, positionsPlayed, gameIsOver = false } = games[id];

  if (gameIsOver) {
    res.status(400).send({
      msg: 'Partida finalizada',
      winner: games[id].winner,
    });
    return null;
  }

  if (player != currentPlayer) {
    res.status(400).send({
      msg: 'Não é o turno do jogador',
    });
    return null;
  }

  const { x, y } = position;
  if (x > 2 || y > 2 || x < 0 || y < 0) {
    res.status(400).send({
      msg: 'Jogada inválida: posição inexistente',
    });
    return null;
  }

  const repeatedPosition = isRepeatedPosition(positionsPlayed, position);

  if (round != 1 && repeatedPosition) {
    res.status(400).send({
      msg: 'Jogada inválida: já realizada anteriormente',
    });
    return null;
  }

  positionsPlayed[player] = [...positionsPlayed[player], position];

  if (round >= 5) {
    const isThereAnyWinner = getWinner(positionsPlayed.X, positionsPlayed.O);

    if (isThereAnyWinner || round == 9) {
      games[id] = {
        ...games[id],
        gameIsOver: true,
        winner: isThereAnyWinner ? isThereAnyWinner : 'Draw',
      };
      res.status(200).send({
        msg: 'Partida finalizada',
        winner: games[id].winner,
      });
      return null;
    }
  }

  const nextPlayer = changeCurrentPlayer(currentPlayer);
  games[id] = { ...games[id], round: round + 1, currentPlayer: nextPlayer };

  res.status(200).send({
    msg: `Jogada realizada com sucesso`,
    nextPlayer,
  });
});

app.use('/', router);
server.listen(port);
console.log('API Inicializada');
