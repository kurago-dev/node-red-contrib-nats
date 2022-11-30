import * as nodered from "node-red";
import { NatsServerNode, NatsServerNodeDef } from "./nats-def";

module.exports = (RED: nodered.NodeAPI): void => {
  const NatsServerNode = function (this: NatsServerNode, config: NatsServerNodeDef) {
    RED.nodes.createNode(this, config);
    this.host = config.host;
    this.port = config.port;
  };
  RED.nodes.registerType("NATS server", NatsServerNode);
};
