import numpy as np
import math
import sys

sys.path.append('path')

from chase_trainer.config import get_config
from chase_trainer.workers.train_ep import ZERO, D1, D2, FAR, get_distance, \
    convert_action_to_pos, calc_reward, get_action

mock_config = {
    "algorithm": 'a3c',
    "learning_rate": 0.0001,
    "screen_sizes": [[750, 1334]],
    "action_distance": 5,
    "num_training_nets": 3,
    "state_size": 4,
    "action_size": 7777777,
    "allowed_directions": 17,
    "name": "train_move",
    "num_epochs": 1,
    "max_eps": 20,
    "fps": 30,
    "batch_size": 40,
    "gamma": 0.99,
    "training": False,
}


def test_get_distance():
    assert get_distance(np.array([100, 100]), np.array([110, 100])) == ZERO
    assert get_distance(np.array([150, 150]), np.array([200, 200])) == D1
    assert get_distance(np.array([100, 100]), np.array([200, 200])) == D2
    assert get_distance(np.array([150, 150]), np.array([1000, 1000])) == FAR


def test_convert_action_to_pos():
    assert convert_action_to_pos(np.array([150, 150]), 13, mock_config) == [151.91341716182546, 145.38060233744358]
    assert convert_action_to_pos(np.array([150, 150]), 2, mock_config) == [153.53553390593274, 153.53553390593274]
    assert convert_action_to_pos(np.array([200, 200]), 7, mock_config) == [195.38060233744358, 201.91341716182544 ]


def test_calc_reward():
    new_states = [{ "chars": state } for state in [
        {
            "P1": {"pos": [100, 100]},
            "P2": {"pos": [200, 200]},
        },
        {
            "P1": {"pos": [150, 150]},
            "P2": {"pos": [200, 200]},
        },
        {
            "P1": {"pos": [200, 190]},
            "P2": {"pos": [200, 200]},
        }]]

    reward, done = calc_reward(new_states)

    assert round(reward, 2) == 140.67
