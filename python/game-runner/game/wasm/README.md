# wasm-pack-template
a template for starting a rust-wasm project to be used with wasm-pack

### ArrayBufferMappings
since input defs will be commonly passed, but there aren't acutally that many different types, it will be using a custom encoder/decoder vs using generic wasm-bindgen

```
Types: 
  click - 0
  drag - 1

js:  { type: 'click', position: [ 100, 200 ] }
arrayBuffer: [0, 100, 200]

js: { type: 'drag' initalPosition: [ 100, 200 ] finalPostion: [ 200, 200 ] }
arrayBuffer: [1, 100, 200, 200, 200]
```
