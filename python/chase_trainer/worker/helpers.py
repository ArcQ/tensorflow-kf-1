import math
import numpy as np

[ZERO, D1, D2, FAR] = range(4)

REWARD_DICT = {
    ZERO: 400,
    D1: 20,
    D2: 2,
    FAR: 0
}


def get_distance(pt1, pt2):
    dist = np.linalg.norm(pt1 - pt2)
    if dist < 20:
        return ZERO
    if dist < 100:
        return D1
    if dist < 200:
        return D2
    return FAR


def convert_action_to_pos(cur_pos, div_k, config):
    allowed_directions = config['allowed_directions']
    action_distance = config['action_distance']
    screen_sizes = config['screen_sizes'][0]
    rad = math.pi * 2 / (allowed_directions - 1) * div_k
    diff = [
        action_distance * math.cos(rad),
        action_distance * math.cos(rad)
    ]

    def handle_limits(dim_v, limit):
        if dim_v > limit:
            return limit
        if dim_v < 0:
            return 0
        return dim_v

    new_pos = [c + d for c, d in zip(cur_pos, diff)]

    return [handle_limits(p, s) for p, s in zip(new_pos, screen_sizes)]


def calc_reward(new_states):
    rewards = []
    done = False
    for new_state in new_states:
        [pt1, pt2] = [np.array(char_state.pos)
                      for char_k, char_state in new_state["chars"].values()]
        dist_type = get_distance(pt1, pt2)
        rewards.append(REWARD_DICT[dist_type])
        if dist_type == ZERO:
            done = True

    return rewards, done
