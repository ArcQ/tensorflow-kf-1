import ApiInterface from 'game-manager/api-interface';

export default ApiInterface({
  move: (game, { P1 }, cmd) => {
    P1.setPos(cmd.payload.pos);
  },
});
