---
id: configuration
title: Configuration of the Server
---

## Overview

`easer` can be configured via:
- configuration file,
- environment variables,
- command line arguments,
- the combination of these above.

The preferred way of configuring the server is via environment, especially in the production environment, however it makes sense to use the other two methods, or even you need to combine them, for example during development.
since there are many configuration parameters, it is not trivial to find out what is the current, effective parameter setup.

You can use the following CLI parameter to make the `easer` dump out its actual configuration:

```bash
$ easer -d
```

This is an example for the output:
```json
{
  "webServer": {
    "logBlackList": [],
    "port": 3007,
    "useCompression": false,
    "useResponseTime": false,
    "usePdms": false,
    "pdmsTopic": "easer",
    "middlewares": {
      "preRouting": [],
      "postRouting": []
    },
    "restApiPath": "/home/tombenke/topics/easer/docs",
    "staticContentBasePath": "/home/tombenke/topics/easer/docs",
    "ignoreApiOperationIds": true,
    "enableMocking": false,
    "basePath": "/",
    "oasConfig": {
      "parse": {
        "yaml": {
          "allowEmpty": false
        },
        "resolve": {
          "file": true
        }
      }
    },
    "bodyParser": {
      "raw": true,
      "json": false,
      "xml": false,
      "urlencoded": false
    }
  },
  "pdms": {
    "natsUri": "nats://demo.nats.io:4222",
    "timeout": 2000
  },
  "wsServer": {
    "forwarderEvent": "message",
    "forwardTopics": false
  },
  "wsPdmsGw": {
    "topics": {
      "inbound": [],
      "outbound": []
    }
  },
  "app": {
    "name": "easer",
    "version": "4.0.0"
  },
  "configFileName": "config.yml",
  "useWebsocket": false,
  "logger": {
    "level": "info",
    "transports": {
      "console": {
        "format": "plainText"
      }
    }
  },
  "installDir": "/home/tombenke/topics/easer/docs",
  "dumpConfig": true
}
```

## Overview of the config parameters

### General server parameters

Dump the effective configuration object, before start:
- CLI parameter: `-d [true]`, or `--dumpConfig [true]`.

Set the port where the server will listen:
- CLI parameter: `-p 8081` or `--port 8081`.
- Environment: `WEBSERVER_PORT`.
- Config object property: `webServer.port`
- Default value: `3007`.

Define the REST API, using swagger or OpenApi descriptor(s):
- CLI parameter: `-r /app/rest-api/api.yml`, or `--restApiPath /app/rest-api/api.yml`.
- Environment: `WEBSERVER_RESTAPIPATH`.
- Config object property: `webServer.restApiPath`
- Default value: the current working directory.

Define the base-path (prefix) for the REST API endpoints:
- CLI parameter: `-b /base/path`, or `--basePath /base/path`.
- Environment: `WEBSERVER_BASEPATH`.
- Config object property: `webServer.basePath`
- Default value: `/`.

Enable Mocking. The server will response the first example found in the `examples` array of endpoint descriptor if there is any. For proper working, it requires the `ignoreApiOperationIds` config parameter to be `true` in case the `operationId`s of the endpoints are defined. The easer set this parameter to `true` by default:
- CLI parameter: `--enableMocking`, or `-m`.
- Environment: `WEBSERVER_ENABLE_MOCKING`.
- Config object property: `webServer.enableMocking`.
- Default value: `true`.

Ignore the `operationId` property of the API endpoint descriptor:
- CLI parameter: N.A.
- Environment: `WEBSERVER_IGNORE_API_OPERATION_IDS`.
- Config object property: `webServer.ignoreApiOperationIds`.
- Default value: `true`.

Set the base path of the endpoints that provide static content:
- CLI parameter: N.A.
- Environment: `WEBSERVER_STATIC_CONTENT_BASEPATH`.
- Config object property: `webServer.staticContentBasePath`.
- Default value: the current working directory.

Compress response bodies for all request:
- CLI parameter: `--useCompression [true]`, or `-s [true]`.
- Environment: `WEBSERVER_USE_COMPRESSION`.
- Config object property: `webServer.useCompression`.
- Default value: `false`.

API calls return with response time header:
- CLI parameter: N.A.
- Environment: `WEBSERVER_USE_RESPONSE_TIME`.
- Config object property: `webServer.useResponseTime`.
- Default value: `false`.

Enable the raw body parser for the web server:
- CLI parameter: `--parseRaw <boolean>`.
- Environment: `WEBSERVER_PARSE_RAW_BODY`.
- Config object property: `webServer.bodyParser.raw`.
- Default value: `true`.

Enable the JSON body parser for the web server:
- CLI parameter: `--parseJson <boolean>`.
- Environment: `WEBSERVER_PARSE_JSON_BODY`.
- Config object property: `webServer.bodyParser.json`.
- Default value: `false`.

Enable the XML body parser for the web server:
- CLI parameter: `--parseXml <boolean>`.
- Environment: `WEBSERVER_PARSE_XML_BODY`.
- Config object property: `webServer.bodyParser.xml`.
- Default value: `false`.

Enable the URL Encoded body parser for the web server:
- CLI parameter: `--parseUrlencoded <boolean>`.
- Environment: `WEBSERVER_PARSE_URL_ENCODED_BODY`.
- Config object property: `webServer.bodyParser.urlencoded`.
- Default value: `false`.

### Logging

Set the log level of the server and its internal components:
- CLI parameter: `-l <level>`, or `logLevel <level>`
- Environment: `EASER_LOG_LEVEL`.
- Config object property: `logger.level`.
- Possible values: `info`, `debug`, `warn`, `error`.
- Default value: `info`.

Set the log format of the server and its internal components:
- CLI parameter: `-t <format>`, or `--logFormat <format>`.
- Environment: `EASER_LOG_FORMAT`.
- Config object property: `logger.transports.console.format`.
- Possible values: `plainText`, `json`.
- Default value: `plainText`.

### PDMS (NATS) Gateway

Use Pattern Driven Micro-Service adapter and enable the NATS forwarding of incoming API calls:
- CLI parameter: `-u [true]`, or `--usePdms [true]`.
- Environment: `WEBSERVER_USE_PDMS`
- Config object property: `webServer.usePdms`.
- Default value: `false`.

Define the name of the NATS topic where the REST API calls will be forwarded:
- CLI parameter: `--pdmsTopic <topic-name>`.
- Config object property: `webServer.pdmsTopic`.
- Default value: "easer".

Define the URI of the NATS server used by the pdms adapter:
- CLI parameter: `-n <nats-uri>`, or `--natsUri <nats-uri>`.
- Environment: `PDMS_NATS_URI`.
- Config object parameter: `pdms.natsUri`.
- Default value: `"nats://demo.nats.io:4222"`.

Define the NATS timeout value:
- CLI parameter: TODO.
- Environment: `PDMS_TIMEOUT`.
- Config object property: `pdms.timeout`.
- Default value: `2000`.

See [npac-pdms-hemera-adapter](https://www.npmjs.com/package/npac-pdms-hemera-adapter) for further details.

### WebSocket Gateway

Use WebSocket server and message forwarding gateway:
- CLI parameter: `--useWebsocket [true]`, or `-w [true]`.
- Environment: `EASER_USE_WEBSOCKET`.
- Config object property: `useWebsocket`.
- Default value: `false`.

Set the name of the event, the WebSocket server listens for and will forward towards NATS topics:
- CLI parameter: `--forwarderEvent <event-name>`, `-e <event-name>`.
- Environment: `WSSERVER_FORWARDER_EVENT`.
- Config object property: `wsServer.forwarderEvent`.
- Default value: `message`.

Note: The messages should have a `topic` property, that holds the name of the WebSocket event in case of inbound messages, or the name of the NATS topic in case of the outbound messages.

Enable the WebSocket server to forward the messages among inbound and outbound topics:
- CLI parameter: `--forward [true]`, or `-f [true]`
- Environment: `WSSERVER_FORWARD_TOPICS`.
- Config object property: `wsServer.forwardTopics`.
- Default value: `false`.

Define the inbound NATS topics as a comma-separated list that will be forwarded towards websocket:
- CLI parameter: `--inbound <list-of-topics>`, `-i <list-of-topics>`.
- Environment: `WSPDMSGW_INBOUND_TOPICS`.
- Config object property: `wsPdmsGw.topics.bound`.
- Default value: `""`.

Define the outbound NATS topics as a comma separated list that will be forwarded from websocket towards NATS topics:
- CLI parameter: `--outbound <list-of-topics>`, `-o <list-of-topics>`.
- Environment: `WSPDMSGW_OUTBOUND_TOPICS`.
- Config object property: `wsPdmsGw.topics.outbound`.
- Default value: `""`.


