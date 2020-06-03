# Propeller 2 Boot Loader Library and CLI

This is the Monorepo for the [Propeller 2](https://propeller.parallax.com) Boot Loader Library and CLI

## Library

The library provides basic functionality to interact with the boot loader over a serial port. Documentation can be found in the [package folder](./packages/lib).  For a usage examples, see the [CLI source](./packages/cli).

## CLI

The `propeller2-loader-cli` package provides a command-line wrapper for the `propeller2-loader` libarary.  Documentation can be found in the [Package folder](./packages/cli/README.md).


## Build Instructions

```
lerna bootstrap
lerna run build

```