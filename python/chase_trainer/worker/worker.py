import asyncio
import tensorflow as tf
import numpy as np

from chase_trainer.memory import Memory
from chase_trainer.master_agent import get_save_dir
from chase_trainer.config import get_config
from chase_trainer.calc_gradients import calc_gradients
from worker.helpers import get_distance, ZERO, D1, D2, FAR, convert_action_to_pos, \

from chase_trainer.models.actor_critic_model import run_ac_model, get_ac_model
from game.game_adapter import GameAdapter


WORKER_CHECK_STEPS_INTERVAL = 500


def run_action(local_model, current_state):
    logits, _ = local_model(
        tf.convert_to_tensor(current_state[None, :],
                             dtype=tf.float32))
    probs = tf.nn.softmax(logits)

    action = np.random.choice(
        get_config()['action_size'], p=probs.numpy()[0])
    return convert_action_to_pos(action)


def train_ep(local_model,
             game_adapter,
             current_state,
             ep_reward,
             ep_loss):

    done = False
    while not done:
        action = run_action(local_model, current_state)

        new_states = game_adapter.move(action)
        reward, done = calc_reward(new_states)
        if done:
            calc_gradients(reward)


def worker_done(master_agent):
    return master_agent.global_episode.get() > get_config()['max_eps']


def train_worker(master_agent, worker_idx):
    total_step = 1
    mem = Memory()
    name = "worker-{}-{}".format(get_config()['name'], worker_idx)
    local_model = get_ac_model()
    game_adapter = GameAdapter.create(name)

    done = False
    while not done:
        current_state = game_adapter.reset()
        mem.clear()
        ep_reward = 0.
        ep_loss = 0.0
        ep_steps = 0

        (ep_steps) = train_ep(
            local_model,
            game_adapter,
            current_state,
            ep_reward,
            ep_loss)
        total_step += ep_steps
        master_agent.result_queue.put(None)
        if total_step > WORKER_CHECK_STEPS_INTERVAL:
            done = worker_done(master_agent)
