import tensorflow as tf
from chase_trainer.config import get_config


def build_ac_model():
    from tensorflow.keras.models import Model
    from tensorflow.keras.layers import Dense, Input

    action_size = get_config()['action_size']
    state_size = get_config()['state_size']

    input_layer = Input(shape=(state_size))

    actor_dense1 = Dense(128, activation='relu')(input_layer)
    actor_dense2 = Dense(128, activation='relu')(actor_dense1)
    actor_logits = Dense(action_size, name='actor_logits')(actor_dense2)

    critic_dense1 = Dense(128, activation='relu')(input_layer)
    critic_dense2 = Dense(128, activation='relu')(critic_dense1)
    critic_values = Dense(1, name='critic_values')(critic_dense2)

    return Model(inputs=[input_layer], outputs=[actor_logits, critic_values])
