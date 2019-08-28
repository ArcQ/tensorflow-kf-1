from queue import Queue
from game.game_adapter import GameAdapter

def get_random_model(max_eps):
    return {
        "max_eps": max_eps,
        "global_moving_average_reward": 0,
        "res_queue": Queue(),
    }

def run(random_model):
    reward_avg = 0
    global_moving_average_reward = 0
    game_adapter = GameAdapter()
    for episode in range(random_model["max_episodes"]):
        done = False
        reward_sum = 0.0
        steps = 0
        while not done:
            # Sample randomly from the action space and step
            _, reward, done, _ = env.step(env.action_space.sample())
            steps += 1
            reward_sum += reward
            # Record statistics
        global_moving_average_reward = record(episode,
                                                   reward_sum,
                                                   0,
                                                   global_moving_average_reward,
                                                   res_queue, 0, steps)

        reward_avg += reward_sum
    final_avg = reward_avg / float(max_episodes)
    print("Average score across {} episodes: {}".format(max_episodes, final_avg))
    return final_avg
