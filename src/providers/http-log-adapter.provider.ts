import {
  Getter,
  Provider,
  inject
} from '@loopback/core';
import {ApiLogAdapterBindings} from '../keys';
import {HttpLogAdapter} from '../lib/http-log-adapter';
import {MessageLogAdapter} from '../lib/message-log-adapter';
import {XRequestId} from '../lib/types';

export class HttpLogAdapterProvider
  implements Provider<HttpLogAdapter>
{
  /**
   * When RequestIdProvider will created, the key 'X-RequestId' wil be bound before MessageLogAdapter get
   * @param requestId create RequestIdProvider
   * @param logAdapterGetter get MessageLogAdapter
   */
  constructor(
    @inject(ApiLogAdapterBindings.REQUEST_ID)
    public requestId: XRequestId,
    @inject.getter(ApiLogAdapterBindings.MESSAGE_LOG_ADAPTER)
    private logAdapterGetter: Getter<MessageLogAdapter>,
  ) { }

  async value(): Promise<HttpLogAdapter> {
    return this.logAdapterGetter()
      .then(logAdapter => new HttpLogAdapter(logAdapter));
  }
}
