# CLI for Propeller 2 Boat Loader Library

A CLI for interacting with the [Propeller 2](https://propeller.parallax.com) Boot Loader using the `propeller2-loader` library.

## Installation
```
  npm -g install propeller2-loader-cli
```
## **Usage**

```
  p2load -h
```

### Commands
```
  load [options] <filename>  Load a binary file
  version                    Print the chip version
  help [command]             Display help for command
```

### Options
#### Global options
```
  -p, --port <portName>      Serial port to use. If not specified, attempt to auto-discover the port.
  -b, --baud <baudRate>      Baud Rate. If not specifided, the default baud rate is 115200.
                             Values may use the 'K', 'k', 'M', or 'm' suffix (e.g. 1K = 1000, 2M = 2000000)
  -v, --version              Output the CLI version
  -h, --help                 Display help for command 
```
#### Load options
```
  --mode <mode>              Load as "hex" or "base64". If not specified, the default is "base64".
```
