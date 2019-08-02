import ApiInterface from 'game-manager/api-interface';

export default ApiInterface({
  move: (game, p1) => {
    p1.setPos([30, 30]);
  },
});
