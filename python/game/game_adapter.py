import json
from ipc.game_socket_client import GameSocketClient


class GameAdapter:
    def __init__(self, name, socket):
        self.name = name
        self.socket = socket

    @staticmethod
    async def create(name):
        socket = await GameSocketClient.create(name)
        return GameAdapter(name, socket)

    async def send_move(self, pos):
        msg = json.dumps({
            "type": "move",
            "payload": {
                "pos": pos
            }
        })
        await self.socket.send_msg(msg)

    async def reset(self):
        msg = json.dumps({"type": "reset"})
        self.socket.send_msg(msg)
