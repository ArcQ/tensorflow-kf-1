import os
import json
import asyncio

class GameSocketClient:
    """
    Connects to Node Game Server
    Usage: asyncio.run(GameSocketClient.create_game_socket_client())
    """
    def __init__(self, name, reader, writer):
        self.reader = reader
        self.writer = writer
        self.name = name

    @staticmethod
    async def create_game_socket_client(name):
        socket_name = GameSocketClient.get_socket_name(name)
        reader, writer = await asyncio.open_unix_connection(socket_name)
        return GameSocketClient(name, reader, writer)

    @staticmethod
    def get_socket_name(name):
        return '/tmp/ipc-' + name + '.sock'

    async def __send_msg(self, msg):
        self.writer.write(msg)
        self.writer.write(b"\r\n")
        result = await self.reader.readline()
        return result

    async def send_move(self, pos):
        msg = json.dumps({
            "type": "move",
            "payload": {
                "pos": pos
            }
        })
        self.__send_msg(msg)

    async def reset(self):
        msg = json.dumps({"type": "reset"})
        self.writer.write(msg)

    async def close(self):
        self.writer.close()
        await self.writer.wait_closed()
        os.remove(GameSocketClient.get_socket_name(self.name))
