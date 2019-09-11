import math
import statistics
import numpy as np
import tensorflow as tf

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


def compute_loss(done,
                 new_state,
                 memory,
                 gamma=0.99):
    if done:
        reward_sum = 0.  # terminal
    else:
        reward_sum = local_model(
            tf.convert_to_tensor(new_state[None, :],
                                 dtype=tf.float32))[-1].numpy()[0]

    # Get discounted rewards
    discounted_rewards = []
    for reward in memory.rewards[::-1]:  # reverse buffer r
        reward_sum = reward + gamma * reward_sum
        discounted_rewards.append(reward_sum)
    discounted_rewards.reverse()

    logits, values = local_model(
        tf.convert_to_tensor(np.vstack(memory.states),
                             dtype=tf.float32))
    # Get our advantages
    advantage = tf.convert_to_tensor(np.array(discounted_rewards)[:, None],
                                     dtype=tf.float32) - values
    # Value loss
    value_loss = advantage ** 2

    # Calculate our policy loss
    actions_one_hot = tf.one_hot(
        memory.actions,
        action_size,
        dtype=tf.float32)

    policy = tf.nn.softmax(logits)
    entropy = tf.reduce_sum(policy * tf.log(policy + 1e-20), axis=1)

    policy_loss = tf.nn.softmax_cross_entropy_with_logits_v2(
        labels=actions_one_hot,
        logits=logits)
    policy_loss *= tf.stop_gradient(advantage)
    policy_loss -= 0.01 * entropy
    total_loss = tf.reduce_mean((0.5 * value_loss + policy_loss))
    return total_loss


def get_action(config, local_model, current_state):
    logits, _ = local_model(
        tf.convert_to_tensor(current_state[None, :],
                             dtype=tf.float32))
    probs = tf.nn.softmax(logits)

    action = np.random.choice(
        config()['action_size'], p=probs.numpy()[0])
    return convert_action_to_pos(action)


def calc_reward(new_states):
    rewards = []
    done = False
    for new_state in new_states:
        [pt1, pt2] = [np.array(char_state['pos'])
                      for char_state in new_state["chars"].values()]
        dist_type = get_distance(pt1, pt2)
        rewards.append(REWARD_DICT[dist_type])
        if dist_type == ZERO:
            done = True

    mean_reward = statistics.mean(rewards)

    return mean_reward, done


def calc_gradients(
        ep_reward,
        current_state,
        action,
        mem):

    reward = -1
    ep_reward += reward
    mem.store(current_state, action, reward)

    # Calculate gradient wrt to local model. We do so by tracking the
    # variables involved in computing the loss by using tf.GradientTape
    with tf.GradientTape() as tape:
        total_loss = compute_loss(done,
                                  new_state,
                                  mem,
                                  args.gamma)
        ep_loss += total_loss
        # Calculate local gradients
        grads = tape.gradient(total_loss, local_model.trainable_weights)
        # Push local gradients to global model
        opt.apply_gradients(zip(grads,
                                     global_model.trainable_weights))
        # Update local model with new weights
        local_model.set_weights(global_model.get_weights())

        mem.clear()

        if done:  # done and print information
            Worker.global_moving_average_reward = \
                record(Worker.global_episode, ep_reward, worker_idx,
                       Worker.global_moving_average_reward, result_queue,
                       ep_loss, ep_steps)
            # We must use a lock to save our model and to print to prevent data races.
            if ep_reward > Worker.best_score:
                with Worker.save_lock:
                    print("Saving best model to {}, "
                          "episode score: {}".format(get_save_dir(), ep_reward))
                    global_model.save_weights(
                        os.path.join(get_save_dir,
                                     'model_{}.h5'.format(name))
                    )
                    Worker.best_score = ep_reward
                Worker.global_episode += 1
                ep_steps += 1

                current_state = new_state
                total_step += 1


def convert_action_to_pos(cur_pos, div_k, config):
    allowed_directions = config['allowed_directions']
    action_distance = config['action_distance']
    screen_sizes = config['screen_sizes'][0]
    rad = (math.pi * 2 / (allowed_directions - 1)) * div_k
    diff = [
        action_distance * math.cos(rad),
        action_distance * math.sin(rad)
    ]

    def handle_limits(dim_v, limit):
        if dim_v > limit:
            return limit
        if dim_v < 0:
            return 0
        return dim_v

    new_pos = [c + d for c, d in zip(cur_pos, diff)]

    return [handle_limits(p, s) for p, s in zip(new_pos, screen_sizes)]
