import { connect, StringCodec } from "nats";
import * as nodered from "node-red";
import { NatsSinkNode, NatsServerNode, NatsSinkNodeDef } from "./nats-def";

module.exports = (RED: nodered.NodeAPI): void => {
  const NatsSinkNode = function (this: NatsSinkNode, config: NatsSinkNodeDef): void {
    RED.nodes.createNode(this, config);

    const _this = this;
    const sc = StringCodec();
    _this.on("input", async (msg, send, done) => {
      const server = RED.nodes.getNode(config.server) as NatsServerNode;
      const connection = await connect({
        servers: [`${server.host}:${server.port}`],
        reconnect: false,
      });
      const { payload } = msg;
      connection.publish(config.topic, sc.encode(payload as string));
      await connection.drain();

      if (done) {
        done();
      }
    });
  };
  RED.nodes.registerType("NATS out", NatsSinkNode);
};
