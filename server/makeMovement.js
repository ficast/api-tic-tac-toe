const services = require('./services');
const {
  changeCurrentPlayer,
  getWinner,
  isRepeatedPosition,
} = services;

const games = {};

function makeMovement(req, res) {
  // const { id } = req.params // Esse poderia ser outro caminho, havia uma ambiguidade em relação à utilização do id na proposta do projeto.
  const { player, position, id } = req.body;

  if (!games[id]) {
    return res.status(400).send({
      msg: `Partida ${id} não encontrada`,
    });
  }

  let { currentPlayer, round, positionsPlayed, gameIsOver = false } = games[id];

  if (gameIsOver) {
    return res.status(400).send({
      msg: 'Partida finalizada',
      winner: games[id].winner,
    });
  }

  if (player != currentPlayer) {
    return res.status(400).send({
      msg: 'Não é o turno do jogador',
    });
  }

  const { x, y } = position;
  if (x > 2 || y > 2 || x < 0 || y < 0) {
    return res.status(400).send({
      msg: 'Jogada inválida: posição inexistente',
    });
  }

  const repeatedPosition = isRepeatedPosition(positionsPlayed, position);

  if (round != 1 && repeatedPosition) {
    return res.status(400).send({
      msg: 'Jogada inválida: já realizada anteriormente',
    });
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
      return res.status(200).send({
        msg: 'Partida finalizada',
        winner: games[id].winner,
      });
    }
  }

  const nextPlayer = changeCurrentPlayer(currentPlayer);
  games[id] = { ...games[id], round: round + 1, currentPlayer: nextPlayer };

  res.status(200).send({
    msg: `Jogada realizada com sucesso`,
    nextPlayer,
  });
}

module.exports = {
  makeMovement,
  games
}