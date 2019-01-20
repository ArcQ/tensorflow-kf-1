
const path = require('path').join(__dirname, 'battle_rust_bg.wasm');
const bytes = require('fs').readFileSync(path);
let imports = {};
imports['./battle_rust'] = require('./battle_rust');

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
module.exports = wasmInstance.exports;
