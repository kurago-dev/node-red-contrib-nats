FROM nodered/node-red
LABEL author="Unai Perez <unai.perez@kurago.software>"

ADD --chown=node-red:node-red . /node-red-nats

RUN cd /node-red-nats && \
    npm ci && \
    npm run clean && \
    npm run build

RUN npm install /node-red-nats