import tensorflow as tf
from multiprocessing import Pipe, cpu_count, Manager
from concurrent.futures import ProcessPoolExecutor

import numpy as np

from game.model_game_adapter import GameAdapter
from chase_trainer.config import get_config
from chase_trainer.model import build_ac_model
from chase_trainer.train.memory import Memory
from chase_trainer.ac.run_workers import train_worker

from chase_trainer.workers.run_workers import run_workers
from utils.fs import \
    create_save_dir, get_save_dir, get_save_path, save_results


class Coordinator:
    def __init__(self):
        config_obj = get_config()
        create_save_dir()
        state_size = config_obj["state_size"]

        self.model = build_ac_model()
        model_input = tf.convert_to_tensor(
            np.random.random((1, state_size)),
            dtype=tf.float32
        )
        self.model(model_input)
        self.total_steps = 0
        self.game_adapter = GameAdapter.create(get_config()['name'])

        # self.global_model = global_model
        # self.global_episode = 0
        # self.global_moving_average_reward = 0
        # self.best_score = 0

    def is_done(self):
        return self.total_steps > get_config()["max_eps"]

    def play_batch(self,
                 game_adapter,
                 current_state):

        done = False
        ep_reward = 0.0
        ep_loss = 0.0
        ep_steps = 0

        while not done:
            action = get_action(config, self.model, current_state)
            new_states = game_adapter.move(action)
            reward, done = calc_reward(new_states)
            if done:
                calc_gradients(reward)

    def train_on_batch(
            ep_reward,
            current_state,
            action,
            mem):

        reward = -1
        ep_reward += reward
        mem.store(current_state, action, reward)

        # Calculate gradient wrt to local model. We do so by tracking the
        # variables involved in computing the loss by using tf.GradientTape
        with tf.GradientTape() as tape:
            total_loss = compute_loss(done,
                                      new_state,
                                      mem,
                                      args.gamma)
            ep_loss += total_loss
            # Calculate local gradients
            grads = tape.gradient(total_loss, local_model.trainable_weights)
            # Push local gradients to global model
            opt.apply_gradients(zip(grads,
                                         global_model.trainable_weights))
            # Update local model with new weights
            local_model.set_weights(global_model.get_weights())

            mem.clear()

            if done:  # done and print information
                Worker.global_moving_average_reward = \
                    record(Worker.global_episode, ep_reward, worker_idx,
                           Worker.global_moving_average_reward, result_queue,
                           ep_loss, ep_steps)
                # We must use a lock to save our model and to print to prevent data races.
                if ep_reward > Worker.best_score:
                    with Worker.save_lock:
                        print("Saving best model to {}, "
                              "episode score: {}".format(get_save_dir(), ep_reward))
                        global_model.save_weights(
                            os.path.join(get_save_dir,
                                         'model_{}.h5'.format(name))
                        )
                        Worker.best_score = ep_reward
                    Worker.global_episode += 1
                    ep_steps += 1

                    current_state = new_state
                    total_step += 1

    def run(self):
        total_step = 1
        mem = Memory()

        while not self.is_done():
            current_state = self.game_adapter.reset()
            mem.clear()

            (ep_steps) = self.train_ep(
                self.game_adapter,
                current_state)
            total_step += ep_steps
