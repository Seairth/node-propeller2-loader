import SerialPort = require('serialport');

import { waitForDuration } from './utils';

export const AUTOBAUD_PREAMBLE = '> ';

export async function propReset(port: SerialPort, sendPreamble = true): Promise<void> {
    if (! port.isOpen) {
      throw new Error('Port is not open.');
    }

    port.set({
      dtr: true
    });

    await waitForDuration(10);

    port.set({
      dtr: false
    });

    if (sendPreamble) {
      await waitForDuration(20);
      port.write(AUTOBAUD_PREAMBLE);
    }
  }
