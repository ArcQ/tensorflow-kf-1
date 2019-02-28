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

  return { encoderKeys, levelOneEncoder };
}
