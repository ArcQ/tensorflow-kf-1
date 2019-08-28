from collections import namedtuple
from concurrent.futures import ProcessPoolExecutor

from multiprocessing import cpu_count, Lock
from queue import Queue
import numpy as np
import tensorflow as tf

from game.model_game_adapter import ModelGameAdapter

from chase_trainer.models.actor_critic_model import get_ac_model, run_ac_model
from chase_trainer.models.random_model import get_random_model, run
from chase_trainer.worker import train_worker
from chase_trainer.config import get_config
from utils.fs import \
    create_save_dir, get_save_dir, get_save_path, save_results

from threading import Thread

class GlobalVar:
    def __init__(self, val):
        self.lock = Lock()
        self.val = val

    def set(self, val):
        self.lock.acquire()
        self.val = val
        self.lock.release()

    def update(self, f):
        self.lock.acquire()
        f(self.val)
        self.lock.release()

    def get(self, val):
        self.lock.acquire()
        cur_val = val
        self.lock.release()
        return cur_val


def run_workers(master_agent, global_var_kv):
    max_workers = max(cpu_count() - 2, 1)
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        executor.map(
            lambda worker_idx: train_worker(
                master_agent,
                worker_idx),
            range(cpu_count))


def create_master_agent():
    config_obj = get_config()
    create_save_dir()
    state_size = config_obj["state_size"]

    global_model = get_ac_model()
    model_input = tf.convert_to_tensor(
        np.random.random((1, state_size)),
        dtype=tf.float32
    )
    run_ac_model(global_model, model_input)
    result_queue = Queue()
    MasterAgent = namedtuple('master_agent',
                             ['global_model',
                              'result_queue',
                              'global_episode',
                              'global_moving_average_reward',
                              'best_score'])

    master_agent = MasterAgent(
        GlobalVar(global_model),
        GlobalVar(result_queue),
        GlobalVar(0),
        GlobalVar(0),
        GlobalVar(0))

    return master_agent


async def train_random():
    config_obj = get_config()
    random_agent = get_random_model(config_obj['max_eps'])
    run(random_agent)


async def train():
    master_agent = create_master_agent()
    run_workers(master_agent, {
        "global_model": master_agent.global_model,
        'global_episode': 0,
        'global_moving_average_reward': 0,
        'best_score': 0})
    moving_average_rewards = []  # record episode reward to plot

    done = False
    while not done:
        reward = master_agent.result_queue.get()
        if reward is not None:
            moving_average_rewards.append(reward)
        else:
            done = True

    save_results(moving_average_rewards, 'moving-average')
