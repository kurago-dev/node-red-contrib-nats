import * as nodered from "node-red";
import { NatsNode, NatsSinkNodeDef } from "./nats-def";

module.exports = (RED: nodered.NodeAPI): void => {
  const NatsSinkNode = function (this: NatsNode, config: NatsSinkNodeDef): void {
    const _this = this;
    // _this.on("input", async (msg, send, done) => {
    //   const { payload } = msg;
    //   send =
    //     send ||
    //     function () {
    //       _this.send.apply(_this, arguments);
    //     };

    //   const message: nodered.NodeMessage = {
    //     ...msg,
    //     payload: config.isLower
    //       ? (payload as string).toLowerCase()
    //       : (payload as string).toUpperCase(),
    //   };
    //   _this.send(message);

    //   if (done) {
    //     done();
    //   }
    // });
  };
  RED.nodes.registerType("NATS out", NatsSinkNode);
};
