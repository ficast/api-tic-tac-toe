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
  if (conditionForLine.indexOf(3) >= 0 || conditionForColumn.indexOf(3) >= 0) return true;
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

module.exports = {
  getFirstPlayer,
  changeCurrentPlayer,
  getWinner,
  isRepeatedPosition
}