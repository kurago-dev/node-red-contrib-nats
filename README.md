# NATS node for Node-RED

NTS is an open-source messaging system that implements the subscriber-publisher paradigm and is built with performance, scalability and simplicity in mind. This messaging paradigm fits particulary well with Node-RED flows. So here go two brand new nodes.

These nodes have been built with the goal to keep them robust and simple. Configuration is really basic as the main goal is to just get it working ASAP.

## NATS server

Configuration node that represents a NATS server. The available configuration is:

- **Host**: Hostname or IP of the server. (Default: _localhost_)
- **Port**: Port in which the server is listening. (Default: _4222_)

## NATS in

This node can be used as a source connector that subscribes to the specified topic on the specified NATS server. The available configuration is:

- **Name**: The name that the node will showcase in the flow display.
- **Server**: NATS server instance to connect to.
- **Topic**: Topic to which to subscribe to.
- **Max. retries** (optional): Maximum amount of reconnections attempted when the node gets disconnected. For each retry, 5 seconds are added to the waiting period until it reaches 30 seconds, when reconnections will be attempted every 30 seconds.

## NATS out

This node can be used as a sink connector that publishes the received messages as is to the specified topic in the selected NATS server. Available configuration:

- **Name**: The name that the node will showcase in the flow display.
- **Server**: NATS server instance to connect to.
- **Topic**: Topic to which to publish to.

## License

The code in this repository is licensed under the MIT License.
