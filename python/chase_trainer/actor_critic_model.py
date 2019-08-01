from tensorflow.keras import layers


def get_ac_model(state_size, action_size):
    return {
        "state_size": state_size,
        "action_size": action_size,
        "dense_1": layers.Dense(128, activation='relu'),
        "policy_logits": layers.Dense(action_size),
        "dense_2": layers.Dense(128, activation='relu'),
        "values": layers.Dense(1),
    }


def run(ac_model, inputs):
    o_1 = ac_model["dense_1"](inputs)
    logits = ac_model["policy_logits"](o_1)

    o_2 = ac_model["dense_2"](inputs)
    values = ac_model["values"](o_2)

    return logits, values
