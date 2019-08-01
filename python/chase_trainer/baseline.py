def get_random_model(max_eps):
    return {
        "global_moving_average_reward": 0,
        "res_queue": Queue(),
    }

def run(max_eps):
    reward_avg = 0
    global_moving_average_reward = 0
    game_adapter = GameAdapter()
    for episode in range(random_model["max_episodes"]):
        done = False
        game_adapter
        reward_sum = 0.0
        steps = 0
        while not done:
            # Sample randomly from the action space and step
            _, reward, done, _ = self.env.step(self.env.action_space.sample())
            steps += 1
            reward_sum += reward
            # Record statistics
        self.global_moving_average_reward = record(episode,
                                                   reward_sum,
                                                   0,
                                                   self.global_moving_average_reward,
                                                   self.res_queue, 0, steps)

        reward_avg += reward_sum
    final_avg = reward_avg / float(self.max_episodes)
    print("Average score across {} episodes: {}".format(self.max_episodes, final_avg))
    return final_avg
