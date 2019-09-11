import sys
import asyncio

from utils.fs import import_global_config
from chase_trainer.config import get_config
from chase_trainer.ac.coordinator import train_ac
from chase_trainer.baseline.random_model import (
    build_random_model, run_random_model
)


def train_random():
    config_obj = get_config()
    random_agent = build_random_model(config_obj['max_eps'])
    run_random_model(random_agent)


async def run_train():
    global_config = import_global_config()
    if len(sys.argv) > 1 and sys.argv[2] == 'random':
        train_random()
    else:
        await train_ac(2, global_config)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(run_train())
