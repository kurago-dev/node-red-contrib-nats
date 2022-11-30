import { NatsConnection, Subscription } from "nats";
import * as nodered from "node-red";

interface NatsNodeDef extends nodered.NodeDef {
  server: string;
  topic: string;
}

export interface NatsSourceNodeDef extends NatsNodeDef {
  maxRetries: number;
}

export interface NatsSinkNodeDef extends NatsNodeDef {}

interface NatsNode extends nodered.Node {
  connection: NatsConnection;
  subscription: Subscription | null;
}

export interface NatsSourceNode extends NatsNode {
  reconnectionTimeout: NodeJS.Timer | null;
  isClosing: boolean;
  retries: number;
}

export interface NatsSinkNode extends NatsNode {}

export interface NatsServerNode extends nodered.Node {
  host: string;
  port: number;
}

export interface NatsServerNodeDef extends nodered.NodeDef {
  host: string;
  port: number;
}
