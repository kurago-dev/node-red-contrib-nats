import { NatsConnection, Subscription } from "nats";
import * as nodered from "node-red";

interface NatsNodeDef extends nodered.NodeDef {
  server: string;
  topic: string;
}

export interface NatsSourceNodeDef extends NatsNodeDef {}

export interface NatsSinkNodeDef extends NatsNodeDef {}

export interface NatsNode extends nodered.Node {
  connection: NatsConnection;
  subscription: Subscription | null;
  reconnectionInterval: NodeJS.Timer | null;
  isClosing: boolean;
}

export interface NatsServerNode extends nodered.Node {
  host: string;
  port: number;
}

export interface NatsServerNodeDef extends nodered.NodeDef {
  host: string;
  port: number;
}
