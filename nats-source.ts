import * as nodered from "node-red";
import { connect, NatsConnection, StringCodec } from "nats";

import { NatsNode, NatsSourceNodeDef } from "./nats-def";

const createConnection = async (_this: NatsNode, server: string): Promise<NatsConnection> => {
  const connection = await connect({
    servers: [server],
  });
  _this.status({
    fill: "green",
    shape: "ring",
    text: "connected",
  });
  return connection;
};

module.exports = (RED: nodered.NodeAPI): void => {
  const NatsSourceNode = function (this: NatsNode, config: NatsSourceNodeDef): void {
    RED.nodes.createNode(this, config);

    (async () => {
      const _this = this;
      this.connection = await createConnection(this, config.server);
      this.connection.closed().then(async () => {
        _this.status({
          fill: "red",
          shape: "dot",
          text: "disconnected",
        });
        _this.connection = await createConnection(this, config.server);
      });

      _this.subscription = this.connection.subscribe(config.topic);
      _this.status({
        fill: "green",
        shape: "dot",
        text: "subscribed",
      });

      const sc = StringCodec();
      (async () => {
        for await (const msg of this.subscription) {
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

      this.on("close", async (done: () => void) => {
        await _this.connection.drain();
        _this.status({
          fill: "grey",
          shape: "dot",
          text: "gracefully drained",
        });
        done();
      });
    })();
  };
  RED.nodes.registerType("NATS in", NatsSourceNode);
};
