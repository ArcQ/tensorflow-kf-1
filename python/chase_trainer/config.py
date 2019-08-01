import numpy as np
import tensorflow as tf
import tensorflow.keras.layers as kl

from helpers import get_divisions

LEARNING_RATE = 0.0001
TRAINED_SCREEN_SIZES = [[750, 1334]]
QUADRANT_DIVISIONS = 3

def allowed_directions():
    return get_divisions(QUADRANT_DIVISIONS) + 1

# add one for don't move (stay where you are)

def get_action_size():
    possible_move_actions = allowed_directions()
    return possible_move_actions

def get_pos_state_size():
    pos_size = 2
    chars = 2
    return pos_size * chars

def get_config():
    return {
        "type": 'PG',
        "learning_rate": LEARNING_RATE,
        "screen_sizes": TRAINED_SCREEN_SIZES,
        "action_distance": 10,
        "num_training_nets": 3,
        "state_size": get_pos_state_size(),
        "action_size": get_action_size(),
        "allowed_directions": allowed_directions(),
        # num_epochs: 1000,
        "num_epochs": 1,
        "max_episode_l": 20,
        "fps": 30,
        # Each 1 is a timestep (NOT AN EPISODE) # YOU CAN CHANGE TO 5000 if you have GPU
        "batch_size": 40,
        "gamma": 0.99,
        "training": False,
    };
