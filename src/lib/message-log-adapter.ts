import {WinstonLogger} from '@loopback/logging';
import {
  CustomLogAdapter,
  CustomLogAdapterOptions,
} from './custom-log-adapter';
import {ApiLogAdapter} from './types';

const MAX_FRAGMENT_LENGTH = 1024 * 4;
const MAX_FRAGMENTS_COUNT = 20;
const MAX_DATA_LENGTH = MAX_FRAGMENT_LENGTH * MAX_FRAGMENTS_COUNT;

export interface MessageLogAdapterOptions extends CustomLogAdapterOptions {
  maxDataLength?: string | number;
  maxFragmentLength?: string | number;
  maxFragmentsCount?: string | number;
};

export class MessageLogAdapter
  extends CustomLogAdapter
  implements ApiLogAdapter {
  public sender = MessageLogAdapter.name;
  public level = 'info';

  public maxDataLength: number = MAX_DATA_LENGTH;
  public maxFragmentsCount: number = MAX_FRAGMENTS_COUNT;
  public maxFragmentLength: number = MAX_FRAGMENT_LENGTH;

  constructor(
    logger?: WinstonLogger,
    options?: MessageLogAdapterOptions,
  ) {
    super(logger, options);

    if (options) {
      const {maxDataLength, maxFragmentsCount, maxFragmentLength} = options;
      this.maxFragmentsCount = maxFragmentsCount
        ? Number(maxFragmentsCount)
        : MAX_FRAGMENTS_COUNT;
      this.maxFragmentLength = maxFragmentLength
        ? Number(maxFragmentLength)
        : MAX_FRAGMENT_LENGTH;
      this.maxDataLength = maxDataLength
        ? Number(maxDataLength)
        : MAX_DATA_LENGTH;
    }
  }
  contextId?: string | undefined;
  requestId?: string | undefined;

  protected fragment(data: string, fragmentSize: number): string[] {
    const exp = new RegExp(`.{1,${fragmentSize}}`, 'gs');
    return String(data).match(exp) ?? [];
  }

  protected splitData(
    data: string,
    baseMsg?: string,
  ): {
    dataPart: string;
    messagePart?: string;
  }[] {
    const {maxDataLength, maxFragmentsCount, maxFragmentLength} = this;
    let maxLen = maxDataLength > 0 ? maxDataLength : 0;
    const fragCnt = maxFragmentsCount > 0 ? maxFragmentsCount : 1;
    const fragLen =
      maxFragmentLength > 0 ? maxFragmentLength : maxLen / fragCnt;
    if (fragLen === 0) {
      return [
        {
          dataPart: data,
          messagePart: baseMsg,
        },
      ];
    }
    const maxLen1 = fragCnt * fragLen;
    maxLen = maxLen > maxLen1 ? maxLen1 : maxLen;
    const wrapped =
      data.length > maxLen
        ? `${data.substring(0, maxLen - 32)} ...more ${data.length - maxLen + 32
        } characters`
        : data;

    return this.fragment(wrapped, fragLen).map((dataPart, i, arr) => {
      const messagePart = baseMsg
        ? `${baseMsg} (part ${i + 1} of ${arr.length})`
        : `${i} of ${arr.length}`;
      return {
        dataPart,
        messagePart,
      };
    });
  }

  onMessage(eventName: string, message: string, data?: string) {
    const base = this.buildTrapBasic(eventName);

    if (data) {
      const parts = this.splitData(data, message);
      if (parts.length > 1) {
        for (const part of parts) {
          const {dataPart, messagePart} = part;
          const trap = Object.assign(base, {dataPart});
          this.log(this.level, messagePart ?? message, trap);
        }
        return;
      }
      const trap = Object.assign(base, {data});
      this.log(this.level, message, trap);
      return;
    }
    this.log(this.level, message, base);
  }
}
