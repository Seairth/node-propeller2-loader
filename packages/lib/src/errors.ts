/* eslint-disable max-classes-per-file */

export class LoaderError extends Error {
    constructor(...args: any[]) {
        super(...args);
        this.name = 'LoaderError';
    }
}

export class ChecksumError extends LoaderError {
    constructor(...args: any[]) {
        super(...args);
        this.name = 'ChecksumError';
    }
}

export class TimeoutError extends LoaderError {
    constructor(...args: any[]) {
        super(...args);
        this.name = 'TimeoutError';
    }
}
