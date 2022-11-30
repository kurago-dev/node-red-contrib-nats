import * as nodered from "node-red";

export interface NatsNodeDef extends nodered.NodeDef {
  name: string;
}
