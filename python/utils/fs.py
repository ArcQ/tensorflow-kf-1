import os
from matplotlib import pyplot as plt
from chase_trainer.config import get_config


def get_save_dir():
    config_obj = get_config()
    return '/data/' + config_obj['name']


def create_save_dir():
    save_dir = get_save_dir()
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)


def get_save_path(file_name):
    config_obj = get_config()
    return os.path.join(
        get_save_dir(),
        file_name.format('{}-' + config_obj['name']))


def load_model(global_model):
    model = global_model
    model_path = get_save_path('model.h5')
    model.load_weights(model_path)
    return model


def save_results(results, file_name):
    plt.plot(results)
    plt.ylabel('Moving average ep reward')
    plt.xlabel('Step')
    plt.savefig(get_save_path('{}.png'.format(file_name)))
    plt.show()
