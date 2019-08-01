import numpy as np
import tensorflow as tf
from chase_trainer.actor_critic_model import get_ac_model, run
from chase_trainer.config import get_config

def init():
    config = get_config()
    opt = tf.train.AdamOptimizer(config["learning_rate"], use_locking=True)
    global_model = get_ac_model(config["state_size"], config["action_size"])

    run(global_model, tf.convert_to_tensor(np.random.random((1, config.state_size)), dtype=tf.float32))

if __name__ == "__main__":
    init()
