import * as nodered from "node-red";
import { NatsSinkNodeDef } from "./nats-def";

module.exports = (RED: nodered.NodeAPI): void => {
  const NatsSinkNode = function (this: nodered.Node, config: NatsSinkNodeDef): void {};
  RED.nodes.registerType("NATS out", NatsSinkNode);
};
