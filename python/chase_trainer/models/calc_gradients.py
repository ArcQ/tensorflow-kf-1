import numpy as np
import tensorflow as tf

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
