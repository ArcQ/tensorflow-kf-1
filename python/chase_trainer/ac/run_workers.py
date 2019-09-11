from concurrent.futures import ProcessPoolExecutor
from multiprocessing import cpu_count, Manager

from chase_trainer.memory import Memory
from chase_trainer.config import get_config
from chase_trainer.ac.train_ep import train_ep

from chase_trainer.models.actor_critic_model import run_ac_model, get_ac_model
from game.game_adapter import GameAdapter


WORKER_CHECK_STEPS_INTERVAL = 500


def worker_done(master_agent):
    return master_agent.global_episode > get_config()['max_eps']


def train_worker(lock, result_queue, worker_idx):
    total_step = 1
    mem = Memory()
    name = "worker-{}-{}".format(get_config()['name'], worker_idx)
    local_model = get_ac_model()
    game_adapter = GameAdapter.create(name)

    done = False
    while not done:
        print('hi')

        current_state = game_adapter.reset()
        mem.clear()

        (ep_steps) = train_ep(
            local_model,
            game_adapter,
            current_state)
        total_step += ep_steps

        lock.acquire()
        result_queue.put(None)
        lock.release()
        if total_step > WORKER_CHECK_STEPS_INTERVAL:
            lock.acquire()
            done = worker_done(master_agent)
            lock.release()
