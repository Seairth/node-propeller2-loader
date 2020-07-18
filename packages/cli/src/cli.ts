import SerialPort = require('serialport');

import { Command } from 'commander';
import * as fs from 'fs';

import { propReset, propCheck, propLoad } from 'propeller2-loader';

function waitForOpen(port: SerialPort): Promise<void> {
  return new Promise((resolve, reject) => port.on('open', (err) => err ? reject(err) : resolve()));
}

async function openPort(path: string, baudRate: number): Promise<SerialPort> {
  let port: SerialPort;

  try {
    port = new SerialPort(path, { baudRate });
    await waitForOpen(port);
  }
  catch (error) {
    throw error; // for now, just rethrow
  }

  port.setEncoding('ascii');

  await propReset(port);

  try {
    await propCheck(port);
  }
  catch (error) {
    throw error;  // for now, just rethrow
  }

  return port;
}

async function findPort(baudRate: number): Promise<SerialPort> {
  const ports = await SerialPort.list();

  if (ports.length === 0) {
    throw new Error('No ports found');
  }

  let port: SerialPort|null = null;

  for(const portInfo of ports) {
    try {
      port = await openPort(portInfo.path, baudRate);
    }
    catch {
      // nope. not a valid P2. maybe the next one?
    }
  }

  if (!port) {
    throw new Error('No propeller chips found');
  }

  return port;
}

async function main() {
  const command = new Command();

  command
    .option('-p, --port <portName>', 'serial port to use')
    .option('-b, --baud <baudRate>', 'baud rate to use when opening the serial port')
    .version('0.1.0', '-v, --version');

  const loadCommand = new Command('load')
    .arguments('<filename>')
    .description('load a file')
    .option('--mode <mode>', '"hex", "base64"');

  command.addCommand(loadCommand);

  command
    .addCommand(new Command('version')
      .description('print the chip version'));

  command.parse();

  const baud = (command.baud as string) ?? '115200';

  let baudRate = parseInt(baud, 10);

  if (Number.isNaN(baudRate)) {
    command.help();
  } else {
    if (baud.endsWith('k') || baud.endsWith('K')) {
      baudRate = baudRate * 1_000;
    } else if (baud.endsWith('m') || baud.endsWith('M')) {
      baudRate = baudRate * 1_000_000;
    }
  }

  if (command.args[0] === 'version' && command.args.length > 1) {
    command.help();
  }

  if (command.args[0] === 'load') {
    if (loadCommand.args.length !== 1) {
      command.help();
    }

    try {
      fs.accessSync(loadCommand.args[0], fs.constants.R_OK);
    } catch {
      command.help();
    }

    if (loadCommand.mode && loadCommand.mode !== 'hex' && loadCommand.mode !== 'base64') {
      command.help();
    }
  }

  let port: SerialPort;

  try {
    if (command.port) {
      port = await openPort(command.port, baudRate);
    }
    else {
      port = await findPort(baudRate);
    }
  }
  catch (error) {
    console.log(error);
    return;
  }

  if (command.args[0] === 'version') {
    console.log(await propCheck(port));
  }
  else if (command.args[0] === 'load') {
    try {
      const bin = fs.readFileSync(loadCommand.args[0]);
      await propLoad(port, bin, { hex: (loadCommand.mode === 'hex')  });
    }
    catch(e) {
      console.error(e);
    }
  }

  port.close();
}

main().then(()=>{/* */},()=>{/* */});