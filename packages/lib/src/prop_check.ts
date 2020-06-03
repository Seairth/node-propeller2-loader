import SerialPort = require('serialport');

import { TimeoutError } from './errors';
import { CommandOptions, getSelectParams, getValidCommandOptions } from './options';

export async function propCheck(port: SerialPort, options: Partial<CommandOptions> = {}): Promise<string> {
  if (! port.isOpen) {
    throw new Error('Port is not open.');
  }

  return new Promise((resolve, reject) => {
    const opt = getValidCommandOptions(options, 100);
    const cmd = `>Prop_Chk ${getSelectParams(opt)}\r`;
    const responsePattern = /\r\nProp_Ver ([A-Z])\r\n/;

    let response = '';
    const callback = (data: string) => {
      response += data;

      // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
      const matches = response.match(responsePattern);

      if (matches) {
        clearTimeout(h);
        port.off('data', callback);
        resolve(matches[1]);
      }
    };

    const h = setTimeout(
      () => {
        port.off('data', callback);
        reject(new TimeoutError());
      },
      opt.timeout);

    port.write(cmd);
    port.on('data', callback);
  });
}
