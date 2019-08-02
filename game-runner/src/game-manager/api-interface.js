import config from 'config';

export default (extend) => {
  const api = {
    handleCmd(game, ...props) {
      return async function(cmd) {
        const ticksToWait = config.fps * (config.reactionTime / 1000);
        api[cmd.type](game, ...props);
        const nextStates = await game.nextTicks(ticksToWait);
        return nextStates;
      };
    },
    ...extend,
  };
  return api;
};
