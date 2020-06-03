# Propeller 2 Boat Loader Library

A library for interacting with the [Propeller 2](https://propeller.parallax.com) Boot Loader Library.


## Installation
```
  npm install propeller2-loader serialport
```

## Functions
### propReset
```typescript
  async function propReset(port: SerialPort, sendPreamble: boolean = true): Promise<void>
```
This function will toggle the DTR signal (enable, wait 10ms, disable) to perform a reset.  By default, the auto-baud preamble will be sent after a 20ms delay (to allow the chip time to come out of reset).  Disable that behavior by passing a `false` value for `sendPreamble`.

### propCheck
```typescript
  async function propCheck(port: SerialPort, options: Partial<CommandOptions> = {}): Promise<string>
```

This function sends the `Prop_Chk` command.  If the chip responds with a `Prop_Ver` response, the returned promise will resolve.  If chip does not response after the timeout duration (default is 100ms), the returned promise will be rejected with `TimeoutError`.

### propClk
```typescript
  async function propClk(port: SerialPort, value: number, options: Partial<CommandOptions> = {}): Promise<void>
```

This function sends the `Prop_Clk` command.  If the chip responds with a `.` response, the returned promise will resolve to the letter designation (e.g. "G").  If chip does not response after the timeout duration (default is 100ms), the returned promise will be rejected with `TimeoutError`.

### propLoad
```typescript
  async function propLoad( port: SerialPort, data: ArrayBuffer|Buffer, options: Partial<WriteCommandOptions>): Promise<void>
```

This function sends the `Prop_Hex` or `Prop_Txt` command, depending on the `hex` value of the `options` argument.  If not provided, the behavior defaults to `Prop_Txt`.  If the checksum verification is requested (or not provided) in the `checksum` value of the `options` argument, the checksum will be calculated and sent at the end of the data.  In this case, if the chip responds with a `.` response, the returned promise will resolve.  Otherwise, if chip does not response after the timeout duration (default is 100ms), the returned promise will be rejected with `TimeoutError`.  If checksum verification is disabled, promise is resolved as soon as the data is written.

## Options
```typescript
  interface CommandOptions {
    INAmask: number,
    INAdata: number,
    INBmask: number,
    INBdata: number,
    timeout: number
  }
```

The `INAmask`, `INAdata`, `INBmask`, and `INBdata` fields default to zero (0).  The default value for timeout depends on the function being called.

```typescript
  interface WriteCommandOptions extends CommandOptions {
    checksum: boolean,
    hex: boolean
  }
```

The `checksum` field defaults to `true` and the `hex` field defaults to `false`.  As a result, `propLoad` will default using `Prop_Txt` (base64-mode) with checksum validation.