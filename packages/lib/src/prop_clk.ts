import SerialPort = require('serialport');

import { LoaderError, TimeoutError } from './errors';
import { CommandOptions, getSelectParams, getValidCommandOptions } from './options';
import { AUTOBAUD_PREAMBLE } from './prop_reset';
import { waitForDuration } from './utils';

export function propClk(port: SerialPort, value: number, options: Partial<CommandOptions> = {}): Promise<void> {
  if (! port.isOpen) {
    throw new Error('Port is not open.');
  }

  const opt = getValidCommandOptions(options, 100);

  port.write(`> Prop_Clk ${getSelectParams(opt)} ${value.toString(16).toUpperCase()}\r`);

  return new Promise((resolve, reject) => {
    const callback = (data: string) => {
      clearTimeout(h);
      port.off('data', callback);

      if (data === '.') {
        resolve();
      } else {
        reject(new LoaderError());
      }
    };

    const h = setTimeout(
      () => {
        port.off('data', callback);
        reject(new TimeoutError());
      },
      opt.timeout);

    port.on('data', callback);
  })
  .then(() => waitForDuration(10))
  .then(() => { port.write(AUTOBAUD_PREAMBLE); });
}
