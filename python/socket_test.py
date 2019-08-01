import asyncio
from game.game_adapter import GameAdapter


async def run():
    adapter = await GameAdapter.create("train_move")
    await adapter.send_move([100, 100])

asyncio.run(run())
