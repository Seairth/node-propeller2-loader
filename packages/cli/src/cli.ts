import SerialPort = require('serialport');

import { Command } from 'commander';
import * as fs from 'fs';

import { propReset, propCheck, propLoad } from 'propeller2-loader';


export function waitForOpen(port: SerialPort): Promise<any> {
  return new Promise((resolve, reject) => port.on('open', (err) => err ? reject(err) : resolve()));
}

async function openPort(path: string): Promise<SerialPort> {
  let port: SerialPort;

  try {
    port = new SerialPort(path);
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

async function findPort(): Promise<SerialPort> {
  const ports = await SerialPort.list();

  if (ports.length === 0) {
    throw new Error('No ports found');
  }

  let port: SerialPort|null = null;

  for(const portInfo of ports) {
    try {
      port = await openPort(portInfo.path);
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
    .version('0.1.0', '-v, --version');

  command
    .addCommand(
      new Command('load')
        .arguments('<filename>')
        .description('load a file')
        .option('--mode <mode>', '"hex", "base64"')
    );

  command
    .addCommand(new Command('version')
      .description('print the chip version'));

  command.parse();

  if (command.args[0] === 'version' && command.args.length > 1) {
    command.help();
  }

  if (command.args[0] === 'load') {
    if (command.args.length !== 2) {
      command.help();
    }

    try {
      fs.accessSync(command.args[1], fs.constants.R_OK);
    } catch {
      command.help();
    }

    if (command.mode && command.mode !== 'hex' && command.mode !== 'base64') {
      command.help();
    }
  }

  let port: SerialPort;

  try {
    if (command.port) {
      port = await openPort(command.port);
    }
    else {
      port = await findPort();
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
      // const bin = readFileSync('C:\\Users\\Seairth\\dev\\Parallax\\P2\\play\\led_matrix.bin');
      const bin = fs.readFileSync(command.args[1]);
      await propLoad(port, bin, { timeout: 1000, hex: (command.mode === 'hex')  });
    }
    catch(e) {
      console.error(e);
    }

    await new Promise(f => setTimeout(f, 1000));
  }

  port.close();
}

main().then(()=>{/* */},()=>{/* */});