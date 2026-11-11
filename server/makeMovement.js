const services = require('./services');
const {
  changeCurrentPlayer,
  getWinner,
  isRepeatedPosition,
} = services;
const { chooseMove } = require('./bot');

const games = {};

const fail = (msg, extra = {}) => ({ status: 400, body: { msg, ...extra } });

// Aplica uma jogada na partida e devolve { status, body } sem depender de req/res,
// para ser usada tanto pelo jogador humano quanto pelo bot.
function applyMove(id, player, position) {
  if (!games[id]) return fail(`Partida ${id} não encontrada`);

  const { currentPlayer, round, positionsPlayed, gameIsOver = false } = games[id];

  if (gameIsOver) return fail('Partida finalizada', { winner: games[id].winner });

  if (player != currentPlayer) return fail('Não é o turno do jogador');

  const { x, y } = position || {};
  if (!Number.isInteger(x) || !Number.isInteger(y) || x > 2 || y > 2 || x < 0 || y < 0) {
    return fail('Jogada inválida: posição inexistente');
  }

  if (round != 1 && isRepeatedPosition(positionsPlayed, position)) {
    return fail('Jogada inválida: já realizada anteriormente');
  }

  positionsPlayed[player] = [...positionsPlayed[player], { x, y }];

  if (round >= 5) {
    const isThereAnyWinner = getWinner(positionsPlayed.X, positionsPlayed.O);

    if (isThereAnyWinner || round == 9) {
      games[id] = {
        ...games[id],
        gameIsOver: true,
        winner: isThereAnyWinner ? isThereAnyWinner : 'Draw',
      };
      return { status: 200, body: { msg: 'Partida finalizada', winner: games[id].winner } };
    }
  }

  const nextPlayer = changeCurrentPlayer(currentPlayer);
  games[id] = { ...games[id], round: round + 1, currentPlayer: nextPlayer };

  return { status: 200, body: { msg: 'Jogada realizada com sucesso', nextPlayer } };
}

// Se for a vez do bot, ele joga e a resposta inclui a posição escolhida (botMove).
function playBotTurn(id) {
  const game = games[id];
  if (!game?.bot || game.gameIsOver || game.currentPlayer !== game.bot.player) return null;

  const botMove = chooseMove(game.positionsPlayed, game.bot.player, game.bot.difficulty);
  const result = applyMove(id, game.bot.player, botMove);
  return { ...result.body, botMove };
}

function makeMovement(req, res) {
  // const { id } = req.params // Esse poderia ser outro caminho, havia uma ambiguidade em relação à utilização do id na proposta do projeto.
  const { player, position, id } = req.body || {};

  const result = applyMove(id, player, position);
  if (result.status !== 200) return res.status(result.status).send(result.body);

  const botResult = playBotTurn(id);
  res.status(200).send(botResult || result.body);
}

module.exports = {
  makeMovement,
  playBotTurn,
  games,
};
