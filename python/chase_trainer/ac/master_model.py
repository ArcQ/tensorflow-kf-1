from multiprocessing import Manager, cpu_count
from concurrent.futures import ProcessPoolExecutor

from chase_trainer.ac.master_agent import MasterAgent


def run_master_agent():
    master_agent = MasterAgent()
    master_agent.watch()


def train_ac(max_workers, global_var_kv):
    _max_workers = min(cpu_count(), max_workers) - 1

    manager = Manager()
    lock = manager.RLock()
    result_queue = manager.Queue()

    with ProcessPoolExecutor(
        max_workers=_max_workers,
    ) as executor:
        # executor.map(
        #     train_worker,
        #     #cpu_count
        #     [(lock, master_agent, worker_idx) for worker_idx in range(_max_workers)])
        future = executor.submit(train_worker, lock, result_queue, master_agent, 0)
        print(future.result())
