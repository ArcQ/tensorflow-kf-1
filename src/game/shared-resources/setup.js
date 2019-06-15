import { merge } from 'ramda';

const createCharConfig = (game, render) => ({ game, render });

const getCombinedProps = _charProps => Object.entries(_charProps)
  .reduce((prev, [k, props]) => ({
    ...prev,
    [k]: merge(props.game, props.render),
  }), {});

export default function(encoder) {
  const encoderKeys = [
    'NO_CHANGE',
    'P1',
    'P2',
    'SET_CHAR_STATE',
    'SET_SPRITE_POS',
    'CHANGE_ORIENTATION',
    'MOVE',
    'IDLE',
    'SPOT_ATTACK',
    'FINISH_SPOT_ATTACK',
  ];

  const levelOneEncoder = encoder(encoderKeys);

  const charProps = {
    P1: createCharConfig({
      charK: 'assasin',
    }, {
      pos: [100, 100],
    }),
    P2: createCharConfig({
      charK: 'knight',
    }, {
      pos: [200, 200],
    }),
  };

  const initialGameState = {
    charEntities: getCombinedProps(charProps),
    moveTargetCircle: {
      isShow: false,
      pos: [100, 100],
    },
  };

  return { encoderKeys, levelOneEncoder, initialGameState };
}
