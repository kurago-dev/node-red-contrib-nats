import * as nodered from "node-red";
import { connect, NatsConnection, NatsError, StringCodec, Subscription } from "nats";

import { NatsSourceNode, NatsServerNode, NatsSourceNodeDef } from "./nats-def";

type ConnectionAndSubscription = {
  connection: NatsConnection;
  subscription: Subscription;
};

const updateDisconnectState = (_this: NatsSourceNode, config: NatsSourceNodeDef) => {
  if (_this.isFirstConnection) {
    _this.status({
      fill: "red",
      shape: "dot",
      text: _this.retries === 0 ? "connecting..." : `connecting... (${_this.retries} retries)`,
    });
  } else {
    _this.status({
      fill: "yellow",
      shape: "dot",
      text: _this.retries === 0 ? "reconnecting..." : `reconnecting... (${_this.retries} retries)`,
    });
  }
  _this.retries++;
  if (_this.retries > config.maxRetries) {
    _this.status({
      fill: "red",
      shape: "dot",
      text: `disconnected (timed out after ${config.maxRetries} retries)`,
    });
  }
};

const connectAndSubscribe = async (
  RED: nodered.NodeAPI,
  _this: NatsSourceNode,
  config: NatsSourceNodeDef
): Promise<ConnectionAndSubscription> => {
  const server = RED.nodes.getNode(config.server) as NatsServerNode;
  const connection = await connect({
    servers: [`${server.host}:${server.port}`],
    reconnect: false,
  });
  _this.status({
    fill: "green",
    shape: "ring",
    text: "connected",
  });
  _this.retries = 0;
  _this.isFirstConnection = false;

  connection.closed().then((e) => {
    _this.status({
      fill: "red",
      shape: "dot",
      text: "disconnected",
    });
    if (!_this.isClosing) {
      _this.error(e ?? "Connection closed unexpectedly");
      setupConnection(RED, _this, config);
    }
  });
  if (_this.reconnectionTimeout !== null) {
    clearTimeout(_this.reconnectionTimeout);
    _this.reconnectionTimeout = null;
  }

  const subscription = connection.subscribe(config.topic);
  _this.status({
    fill: "green",
    shape: "dot",
    text: "subscribed",
  });

  const sc = StringCodec();
  (async () => {
    for await (const msg of subscription) {
      _this.send({
        payload: sc.decode(msg.data),
      });
    }
    _this.status({
      fill: "grey",
      shape: "ring",
      text: "unsubscribed",
    });
  })();

  _this.on("close", async (done: () => void) => {
    _this.isClosing = true;
    clearTimeout(_this.reconnectionTimeout);
    if (!connection.isClosed()) {
      await connection.drain();
      _this.status({
        fill: "grey",
        shape: "dot",
        text: "gracefully drained",
      });
    }
    done();
  });

  return { connection, subscription };
};

const setupConnection = async (
  RED: nodered.NodeAPI,
  _this: NatsSourceNode,
  config: NatsSourceNodeDef
): Promise<void> => {
  try {
    const { connection, subscription } = await connectAndSubscribe(RED, _this, config);
    _this.connection = connection;
    _this.subscription = subscription;
  } catch (e) {
    if (e instanceof NatsError) {
      updateDisconnectState(_this, config);
      if (_this.retries > config.maxRetries) {
        _this.error("Max retries reached");
      } else {
        const nextRetry = (_this.retries <= 6 ? 5 * _this.retries : 60) * 1000;
        _this.reconnectionTimeout = setTimeout(
          () => setupConnection(RED, _this, config),
          nextRetry
        );
      }
    } else {
      _this.error(e);
    }
  }
};

module.exports = (RED: nodered.NodeAPI): void => {
  const NatsSourceNode = function (this: NatsSourceNode, config: NatsSourceNodeDef): void {
    RED.nodes.createNode(this, config);

    (async () => {
      this.status({
        fill: "red",
        shape: "dot",
        text: "disconnected",
      });
      this.retries = 0;
      this.reconnectionTimeout = null;
      this.isClosing = false;
      this.isFirstConnection = true;

      await setupConnection(RED, this, config);
    })();
  };
  RED.nodes.registerType("NATS in", NatsSourceNode);
};
