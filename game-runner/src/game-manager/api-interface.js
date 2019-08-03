import config from 'config';

export default (extend) => {
  const api = {
    handleCmd(game, props) {
      return async function(cmd) {
        const ticksToWait = config.fps * (config.reactionTime / 1000);
        try {
          api[cmd.type](game, props, cmd);
          const nextStates = await game.nextTicks(ticksToWait);
          return nextStates;
        } catch (e) {
          console.warn('unable to handle cmd');
          console.warn(e);
        }
        return undefined;
      };
    },
    ...extend,
  };
  return api;
};
