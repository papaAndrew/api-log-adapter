import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {OperationRetval, Response, SendProvider, writeResultToResponse} from '@loopback/rest';
import {ApiLogAdapterBindings} from '../keys';
import {HttpLogAdapter} from '../lib/http-log-adapter';

@injectable({scope: BindingScope.APPLICATION})
export class LogResponseSendProvider implements SendProvider {
  constructor(
    @inject(ApiLogAdapterBindings.HTTP_LOG_ADAPTER)
    private logAdapter: HttpLogAdapter,
    @inject.getter(ApiLogAdapterBindings.INTERCEPTED_METHOD, {optional: true})
    private interceptedMethodGetter?: Getter<string>,
  ) { }

  value() {
    // Use the lambda syntax to preserve the "this" scope for future calls!
    return async (response: Response, result: OperationRetval) => {
      await this.action(response, result);
    };
  }

  private async isIntercepted(): Promise<boolean> {
    const interceptedMethod = await this.interceptedMethodGetter?.();
    return !!interceptedMethod;
  }
  /**
   * Use the mimeType given in the request's Accept header to convert
   * the response object!
   * @param response - The response object used to reply to the  client.
   * @param result - The result of the operation carried out by the controller's
   * handling function.
   */
  async action(response: Response, result: OperationRetval) {

    await this.isIntercepted()
      .then((intercepted) => {
        if (intercepted) {
          this.logAdapter
            .onResponse(response)
            .onResponseBody(result);
        }
      })

    writeResultToResponse(response, result);
  }
}
