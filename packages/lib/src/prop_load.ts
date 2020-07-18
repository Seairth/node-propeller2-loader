import SerialPort = require('serialport');

import { ChecksumError, TimeoutError } from './errors';
import { waitForDuration } from './utils';
import { getSelectParams, getValidWriteCommandOptions, WriteCommandOptions } from './options';

const AUTOBAUD_CHAR = '>';
const AUTOBAUD_INTERVAL = 32;

const CHECKSUM_MASK = 0x706F7250;
const FUDGE_FACTOR = 1.1;

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

  const opt = getValidWriteCommandOptions(options, 100);

  let bufferLen = data.byteLength;

  const mod4 = data.byteLength % 4;

  if (data.byteLength % 4 !== 0) {
    bufferLen += 4 - mod4;
  }

  if (opt.checksum) {
    bufferLen += 4;
  }

  const buffer = new ArrayBuffer(bufferLen);

  if (data instanceof ArrayBuffer) {
    (new Uint8Array(buffer).set(new Uint8Array(data)));
  } else {
    (new Uint8Array(buffer).set(data));
  }

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

  text = text.replace(new RegExp(`(.{${AUTOBAUD_INTERVAL}})`, 'g'), `$1${AUTOBAUD_CHAR}`);
  text = `> Prop_${cmd} ${getSelectParams(opt)} ` + text + (opt.checksum ? ' ?' : ' ~');

  // (text length + approximate header length) * (byte rate at 8N1) * (fudge factor)
  const writeTime = (text.length + 20) * (10 / port.baudRate) * FUDGE_FACTOR;

  port.write(text);

  if (opt.checksum) {
    return new Promise((resolve, reject) => {
      const callback = (response: string) => {
        clearTimeout(h);
        port.off('data', callback);

        if (response[0] === '.') {
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
        (writeTime * 1000) + opt.timeout);

      port.on('data', callback);
    });
  } else {
    await waitForDuration(writeTime * 1000);
  }
}
