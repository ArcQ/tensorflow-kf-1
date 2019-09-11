import os
import json
from matplotlib import pyplot as plt
from chase_trainer.config import get_config


def import_global_config():
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../config', 'config.json')
    with open(config_path) as f:
        return json.load(f)


def get_save_dir():
    config_obj = get_config()
    return 'chase_trainer/data/' + config_obj['name']


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
