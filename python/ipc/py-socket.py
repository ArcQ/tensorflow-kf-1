#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

import socket
import time
import json

for i in range(0, 100):
    server_address = '/tmp/ipc-example.sock'

    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.connect(server_address)
    # time.sleep(.01)
    msg = json.dumps({"ping": "hello" + str(i)}).encode('UTF-8')
    sock.send(msg)
    sock.send(b"\r\n")
    data = sock.recv(256)
    print(data.decode('UTF-8'))
    sock.close()
