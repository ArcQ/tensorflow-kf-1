import asyncio
from game.game_adapter import GameAdapter


async def run():
    adapter = await GameAdapter.create("train_move")
    await adapter.send_move([100, 100])
    return 'done'


def main():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run())
    loop.close()


if __name__ == '__main__':
    main()
