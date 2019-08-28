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
    async def create(name):
        socket_name = GameSocketClient.get_socket_name(name)
        reader, writer = await asyncio.open_unix_connection(socket_name)
        return GameSocketClient(name, reader, writer)

    @staticmethod
    def get_socket_name(name):
        return '../game-runner/ipc-' + name + '.sock'

    def build_msg(self, msg):
        msg["payload"] = {**msg["payload"], **{"name": self.name}}
        encoded_msg = json.dumps(msg).encode('UTF-8')
        return encoded_msg

    async def send_msg(self, msg):
        encoded_msg = self.build_msg(msg)
        self.writer.write(encoded_msg)
        self.writer.write(b"\n")
        result = await self.reader.readline()
        print([s['chars']['P1']['pos'] for s in json.loads(result)['payload']])
        return result

    async def close(self):
        self.writer.close()
        await self.writer.wait_closed()
        os.remove(GameSocketClient.get_socket_name(self.name))
