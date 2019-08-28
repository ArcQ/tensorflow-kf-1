from tensorflow.keras.layers import Dense, Input
from tensorflow.keras.models import Model
from chase_trainer.config import get_config


def get_ac_model():
    action_size = get_config()['action_size']
    state_size = get_config()['state_size']

    input_layer = Input(shape=(state_size))

    actor_dense = Dense(128, activation='relu')(input_layer)
    actor_logits = Dense(action_size, name='actor_logits')(actor_dense)

    critic_dense = Dense(128, activation='relu')(input_layer)
    critic_values = Dense(1, name='critic_values')(critic_dense)

    return Model(inputs=[input_layer], outputs=[actor_logits, critic_values])


def run_ac_model(ac_model, inputs):
    return ac_model(inputs)
