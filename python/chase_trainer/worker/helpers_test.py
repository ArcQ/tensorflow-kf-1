import numpy as np
import math
import sys

sys.path.append('path')

from chase_trainer.config import get_config
from chase_trainer.worker.helpers import ZERO, D1, D2, FAR, get_distance, \
  convert_action_to_pos, calc_reward


def test_get_distance():
    assert get_distance(np.array([100, 100]), np.array([110, 100])) == ZERO
    assert get_distance(np.array([150, 150]), np.array([200, 200])) == D1
    assert get_distance(np.array([100, 100]), np.array([200, 200])) == D2
    assert get_distance(np.array([150, 150]), np.array([1000, 1000])) == FAR


def test_convert_action_to_pos():
    assert convert_action_to_pos(np.array([150, 150])) == FAR


def test_calc_reward():
    new_states = [
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
        }]

    reward = calc_reward(new_states)

    assert reward.toFixed(2) == '648.33'
