export default router.post('/game/:id/movement', (req, res) => {
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