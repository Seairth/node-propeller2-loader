import SerialPort = require('serialport');

export function waitForDuration(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitForDrain(port:SerialPort, fullDrain = false): Promise<any> {
  return new Promise(resolve => {
    if (fullDrain) {
      port.drain(() => resolve());
    }
    else {
      port.once('drain', () => resolve());
    }
  });
}
