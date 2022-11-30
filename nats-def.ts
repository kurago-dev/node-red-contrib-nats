import * as nodered from "node-red";

interface NatsNodeDef extends nodered.NodeDef {
  isLower: boolean;
}

export interface NatsSourceNodeDef extends NatsNodeDef {}

export interface NatsSinkNodeDef extends NatsNodeDef {}
