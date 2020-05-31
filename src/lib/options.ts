export interface CommandOptions {
  INAmask: number,
  INAdata: number,
  INBmask: number,
  INBdata: number,
  timeout: number
}

export interface WriteCommandOptions extends CommandOptions {
  checksum: boolean,
  hex: boolean
}

export function getValidCommandOptions(options: Partial<CommandOptions>, defaultTimeout: number): CommandOptions {
  return {
    INAmask: (options.INAmask !== undefined) ? options.INAmask : 0,
    INAdata: (options.INAdata !== undefined) ? options.INAdata : 0,
    INBmask: (options.INBmask !== undefined) ? options.INBmask : 0,
    INBdata: (options.INBdata !== undefined) ? options.INBdata : 0,
    timeout: (options.timeout !== undefined) ? options.timeout : defaultTimeout
  };
}

export function getValidWriteCommandOptions(options: Partial<WriteCommandOptions>, defaultTimeout: number): WriteCommandOptions {
  return {
    ...getValidCommandOptions(options, defaultTimeout),
    checksum: (options.checksum !== undefined) ? options.checksum : true,
    hex: (options.hex !== undefined) ? options.hex : false
  };
}

export function getSelectParams(options: CommandOptions): string {
  return [options.INAmask, options.INAdata, options.INBmask, options.INBdata]
    .map(p => p.toString(16).toUpperCase())
    .join(' ');
}
