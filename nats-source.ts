import * as nodered from "node-red";
import { NatsSourceNodeDef } from "./nats-def";

module.exports = (RED: nodered.NodeAPI): void => {
  const NatsSourceNode = function (this: nodered.Node, config: NatsSourceNodeDef): void {
    RED.nodes.createNode(this, config);

    const _this = this;
    _this.on("input", async (msg, send, done) => {
      const { payload } = msg;
      const message: nodered.NodeMessage = {
        ...msg,
        payload: config.isLower
          ? (payload as string).toLowerCase()
          : (payload as string).toUpperCase(),
      };
      _this.send(message);
    });
  };
  RED.nodes.registerType("NATS in", NatsSourceNode);
};
