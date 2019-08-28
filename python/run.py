import sys
from chase_trainer.master_agent import train, train_random


def run_train():
    if sys.argv[2] == 'random':
        train_random()
    else:
        train()


if __name__ == '__main__':
    run_train()
