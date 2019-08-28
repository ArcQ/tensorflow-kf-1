import numpy as np
import tensorflow as tf
import tensorflow.keras.layers as kl

LEARNING_RATE = 0.0001
TRAINED_SCREEN_SIZES = [[750, 1334]]
QUADRANT_DIVISIONS = 3


def get_divisions(divisions):
    """how many divisions per quadrant"""
    return (divisions + 1) * 4


def allowed_directions():
    # add one for don't move (stay where you are)
    return get_divisions(QUADRANT_DIVISIONS) + 1


def get_action_size():
    possible_move_actions = allowed_directions()
    return possible_move_actions


def get_pos_state_size():
    pos_size = 2
    chars = 2
    return pos_size * chars


def get_config():
    return {
        "algorithm": 'a3c',
        "learning_rate": LEARNING_RATE,
        "screen_sizes": TRAINED_SCREEN_SIZES,
        "action_distance": 10,
        "num_training_nets": 3,
        "state_size": get_pos_state_size(),
        "action_size": get_action_size(),
        "allowed_directions": allowed_directions(),
        "name": "train_move",
        # num_epochs: 1000,
        "num_epochs": 1,
        "max_eps": 20,
        "fps": 30,
        "batch_size": 40,
        "gamma": 0.99,
        "training": False,
    }
