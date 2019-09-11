import tensorflow as tf
from multiprocessing import Pipe, cpu_count, Manager
from concurrent.futures import ProcessPoolExecutor

import numpy as np

from game.model_game_adapter import ModelGameAdapter
from chase_trainer.config import get_config
from chase_trainer.model import build_ac_model
from chase_trainer.ac.run_workers import train_worker

from chase_trainer.workers.run_workers import run_workers
from utils.fs import \
    create_save_dir, get_save_dir, get_save_path, save_results


class MasterAgent:
    def __init__(self):
        config_obj = get_config()
        create_save_dir()
        state_size = config_obj["state_size"]

        ac_model = build_ac_model()
        model_input = tf.convert_to_tensor(
            np.random.random((1, state_size)),
            dtype=tf.float32
        )
        ac_model(global_model, model_input)

        self.global_model = global_model
        self.global_episode = 0
        self.global_moving_average_reward = 0
        self.best_score = 0

    def train_agents(self, max_workers, global_var_kv):
        _max_workers = min(cpu_count(), max_workers) - 1
        manager = Manager()
        self.lock = manager.Lock()
        self.result_queue = manager.Queue()

        with ProcessPoolExecutor(max_workers=_max_workers) as executor:
            pipes = {}
            for i in range(0, max_workers):
                parent_conn, child_conn = Pipe()
                executor.submit(
                    train_worker,
                    self.lock,
                    self.result_queue,
                    i
                )
                pipes[i] = parent_conn

    async def watch(self, global_config):
        moving_average_rewards = []  # record episode reward to plot

        done = False
        while not done:
            reward = master_agent.result_queue.get().get()
            if reward is not None:
                print(reward)
                moving_average_rewards.append(reward)
            else:
                done = True
