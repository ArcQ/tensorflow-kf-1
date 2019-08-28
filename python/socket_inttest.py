import asyncio
from game.game_adapter import GameAdapter


async def run():
    adapter = await GameAdapter.create("train_move")
    result = await adapter.move([100, 100])
    print(result)

    for _ in range(5):
        result = await adapter.no_action()
        print(result)

    return 'done'


def main():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run())
    loop.close()


if __name__ == '__main__':
    main()
