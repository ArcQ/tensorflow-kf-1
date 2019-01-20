// const test = require('./build-node/battle_rust.js');
// import('./wasm/battle_rust.js').then((test) => console.log(new test.LevelOne()));

import * as rp from 'request-promise';

async function initGame() {
  const res = await rp.get('http://localhost:7000/gamemap/generate?x=9&y=16');
  const wasmBindgen = await import('./wasm/battle_rust.js');
  const game = new wasmBindgen.LevelOne(["NO_CHANGE", "P1", "P2", "SET_CHAR_STATE", "SET_SPRITE_POS", "CHANGE_ORIENTATION", "MOVE", "IDLE", "SPOT_ATTACK", "FINISH_SPOT_ATTACK"], res);

  const updateFn = (dt) => game.get_update(dt);
  const onEvent = (a) => game.on_event(a);

  tick(0.1);

  function tick() {
    updateFn(0.1);
  }

  setInterval(tick, 0.1)

}

initGame();

function* runGame() {
}
