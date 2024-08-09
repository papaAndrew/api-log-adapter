import {WinstonLogger} from '@loopback/logging';
import {Stream} from 'stream';
import {LogAdapterOptions, XRequestId} from './types';

export interface CustomLogAdapterOptions extends LogAdapterOptions {
  userAgent?: string;
  contextId?: string;
  requestId?: XRequestId;
}

export type TrapBasic = {
  sender: string;
  eventName: string;
  contextId?: string;
  userAgent?: string;
  requestId?: string;
};

export function anyToString(data: any): string {
  if (Buffer.isBuffer(data)) {
    return '[*buffer]';
  }
  if (data instanceof Stream) {
    return '[*stream]';
  }

  switch (typeof data) {
    case 'string':
    case 'bigint':
    case 'boolean':
    case 'number':
      return String(data);
    case 'object':
      return JSON.stringify(data);
    default:
      return `[*${typeof data}]`;
  }
}

export class CustomLogAdapter {
  public sender: string = CustomLogAdapter.name;

  constructor(
    protected logger?: WinstonLogger,
    public options?: CustomLogAdapterOptions,
  ) {}

  dataToString(data: any): string {
    return anyToString(data);
  }

  protected buildTrapBasic(eventName: string): TrapBasic {
    const {options, sender} = this;
    const {userAgent, contextId, requestId} = options ?? {};

    return {
      sender,
      eventName,
      userAgent,
      contextId,
      requestId,
    };
  }

  log(level: string, message: string, trap: object) {
    this.logger?.log(level, message, trap);
  }

  http(eventName: string, message: string, args: object) {
    const title = this.buildTrapBasic(eventName);
    this.log('http', message, {
      ...title,
      ...args,
    });
  }
  info(eventName: string, message: string, args: object) {
    const title = this.buildTrapBasic(eventName);
    this.log('info', message, {
      ...title,
      ...args,
    });
  }
  debug(eventName: string, message: string, args: object) {
    const title = this.buildTrapBasic(eventName);
    this.log('debug', message, {
      ...title,
      ...args,
    });
  }
  warn(eventName: string, message: string, args: object) {
    const title = this.buildTrapBasic(eventName);
    this.log('warn', message, {
      ...title,
      ...args,
    });
  }
  error(eventName: string, message: string, args: object) {
    const title = this.buildTrapBasic(eventName);
    this.log('error', message, {
      ...title,
      ...args,
    });
  }
}
