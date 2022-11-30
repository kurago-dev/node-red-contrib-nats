import * as nodered from "node-red";
import { NatsNodeDef } from "./nats-def";

module.exports = (RED: nodered.NodeAPI): void => {
  const NatsNode = function (this: nodered.Node, config: NatsNodeDef): void {
    RED.nodes.createNode(this, config);

    const _this = this;
    _this.on("input", async (msg, send, done) => {
      const message: nodered.NodeMessage = {
        ...msg,
        payload: (msg.payload as string).toLowerCase(),
      };
      _this.send(message);
    });
  };
  RED.nodes.registerType("nats-node", NatsNode);
};
