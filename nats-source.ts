import * as nodered from "node-red";
import { connect, NatsConnection, NatsError, StringCodec, Subscription } from "nats";

import { NatsNode, NatsServerNode, NatsSourceNodeDef } from "./nats-def";

type ConnectionAndSubscription = {
  connection: NatsConnection;
  subscription: Subscription;
};

const connectAndSubscribe = async (
  RED: nodered.NodeAPI,
  _this: NatsNode,
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
  if (_this.reconnectionInterval !== null) {
    clearInterval(_this.reconnectionInterval);
    _this.reconnectionInterval = null;
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
    await connection.close();
    _this.status({
      fill: "grey",
      shape: "dot",
      text: "gracefully drained",
    });
    done();
  });

  return { connection, subscription };
};

const setupConnection = async (
  RED: nodered.NodeAPI,
  _this: NatsNode,
  config: NatsSourceNodeDef
): Promise<void> => {
  try {
    const { connection, subscription } = await connectAndSubscribe(RED, _this, config);
    _this.connection = connection;
    _this.subscription = subscription;
  } catch (e) {
    if (e instanceof NatsError) {
      _this.status({
        fill: "red",
        shape: "dot",
        text: "disconnected",
      });
      _this.reconnectionInterval = setInterval(() => setupConnection(RED, _this, config), 5000);
    } else {
      _this.error(e);
    }
  }
};

module.exports = (RED: nodered.NodeAPI): void => {
  const NatsSourceNode = function (this: NatsNode, config: NatsSourceNodeDef): void {
    RED.nodes.createNode(this, config);

    (async () => {
      this.status({
        fill: "red",
        shape: "dot",
        text: "disconnected",
      });
      this.reconnectionInterval = null;
      this.isClosing = false;

      await setupConnection(RED, this, config);
    })();
  };
  RED.nodes.registerType("NATS in", NatsSourceNode);
};
