import SerialPort = require('serialport');

import { ChecksumError, TimeoutError } from './errors';
import { waitForDrain } from './utils';
import { getSelectParams, getValidWriteCommandOptions, WriteCommandOptions } from './options';

const AUTOBAUD_CHAR = '>';
const AUTOBAUD_INTERVAL = 32;

const CHECKSUM_MASK = 0x706F7250;

function calculateAndSetChecksum(data: ArrayBuffer) {
  const a = new Uint32Array(data);

  const sum = a.reduce((p, c) => {
    let v = p+c;
    if (v > 0xFFFFFFFF) v-= 0x100000000;
    return v;
  }, 0);

  let checksum = CHECKSUM_MASK - sum;

  if (checksum < 0) {
    checksum += 0x100000000;
  }

  a[a.length - 1] = checksum;
}

export async function propLoad( port: SerialPort, data: ArrayBuffer|Buffer, options: Partial<WriteCommandOptions>): Promise<void> {
  if (! port.isOpen) {
    throw new Error('Port is not open.');
  }

  let bufferLen = data.byteLength;

  const mod4 = data.byteLength % 4;

  if (data.byteLength % 4 !== 0) {
    bufferLen += 4 - mod4;
  }

  if (options.checksum) {
    bufferLen += 4;
  }

  const buffer = new ArrayBuffer(bufferLen);

  if (data instanceof ArrayBuffer) {
    (new Uint8Array(buffer).set(new Uint8Array(data)));
  } else {
    (new Uint8Array(buffer).set(data));
  }

  const opt = getValidWriteCommandOptions(options, 100);

  if (opt.checksum) {
    calculateAndSetChecksum(buffer);
  }

  let cmd: string;
  let text: string;

  if (opt.hex) {
    cmd = 'Hex';
    const hexChars = new Array(buffer.byteLength);
    (new Uint8Array(buffer)).forEach((byte, i) => hexChars[i] = byte.toString(16).toUpperCase().padStart(2, '0'));
    text = hexChars.join(' ');
  } else {
    cmd = 'Txt';
    text = Buffer.from(buffer).toString('base64');
  }

  port.write(`> Prop_${cmd} ${getSelectParams(opt)} `);

  let sent = 0;

  for (const char of text) {
    if (!port.write(char)) {
      await waitForDrain(port);
    }

    sent = (sent + 1) % AUTOBAUD_INTERVAL;

    if (sent === 0) {
      if(!port.write(AUTOBAUD_CHAR)) {
        await waitForDrain(port);
      }
    }
  }

  if (opt.checksum) {
    port.write(' ?');
    await waitForDrain(port, true);

    return new Promise((resolve, reject) => {
      const callback = (response: string) => {
        clearTimeout(h);
        port.off('data', callback);

        if (response === '.') {
          resolve();
        } else {
          reject(new ChecksumError());
        }
      };

      const h = setTimeout(
        () => {
          port.off('data', callback);
          reject(new TimeoutError());
        },
        opt.timeout);

      port.on('data', callback);
    });
  } else {
    port.write(' ~');
    await waitForDrain(port, true);
  }
}
