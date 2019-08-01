def compute_loss(self,
                   done,
                   new_state,
                   memory,
                   gamma=0.99):
    if done:
      reward_sum = 0.  # terminal
    else:
      reward_sum = self.local_model(
          tf.convert_to_tensor(new_state[None, :],
                               dtype=tf.float32))[-1].numpy()[0]

    # Get discounted rewards
    discounted_rewards = []
    for reward in memory.rewards[::-1]:  # reverse buffer r
      reward_sum = reward + gamma * reward_sum
      discounted_rewards.append(reward_sum)
    discounted_rewards.reverse()

    logits, values = self.local_model(
        tf.convert_to_tensor(np.vstack(memory.states),
                             dtype=tf.float32))
    # Get our advantages
    advantage = tf.convert_to_tensor(np.array(discounted_rewards)[:, None],
                            dtype=tf.float32) - values
    # Value loss
    value_loss = advantage ** 2

    # Calculate our policy loss
    actions_one_hot = tf.one_hot(memory.actions, self.action_size, dtype=tf.float32)

    policy = tf.nn.softmax(logits)
    entropy = tf.reduce_sum(policy * tf.log(policy + 1e-20), axis=1)

    policy_loss = tf.nn.softmax_cross_entropy_with_logits_v2(labels=actions_one_hot,
                                                             logits=logits)
    policy_loss *= tf.stop_gradient(advantage)
    policy_loss -= 0.01 * entropy
    total_loss = tf.reduce_mean((0.5 * value_loss + policy_loss))
    return total_loss
