FROM python3.6-nodejs12

VOLUME . /usr/src/app
RUN pip install pipenv
RUN pipenv install

WORKDIR /usr/src/app/game-runner
RUN npm install 

WORKDIR /usr/src/app/python
RUN pipenv install --dev

WORKDIR /usr/src/app/python/tensorflow-kf-1
CMD [ "pipenv", "run", "python", "./run.py" ]
