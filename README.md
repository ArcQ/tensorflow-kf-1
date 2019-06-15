#tf-kf-1
deep q learning for kf1game

###Development
install or link in kf-game-engine and kf-utils
make sure in kf1, there is a build-node process, modify the path to 
build the webassembly binary and copy into src/game/wasm (so the rust code)

kf-game-engine and kf-utils will have node specific code to coordinate
the webassembly game logic written in rust 

you will also need the setup code of the game you are developing to set up the scene
refer to pre-start script
