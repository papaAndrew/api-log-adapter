import {HandlerContext, Request, Response} from '@loopback/rest';
import {anyToString} from './custom-log-adapter';
import {MessageLogAdapter} from './message-log-adapter';

// function readRequestBody(request: Request): Promise<string> {
//   let result = Buffer.alloc(0);
//   request.on("data", (chunk) => (result = Buffer.concat([result, chunk])));

//   return new Promise((resolve, reject) => {
//     request.on("end", () => resolve(result.toString()));
//     request.on("error", (err) => reject(err));
//   });
// }

export class HttpLogAdapter {
  private showBody: boolean = false;

  constructor(public logAdapter: MessageLogAdapter) {
    this.logAdapter.sender = HttpLogAdapter.name;
    const {showBody} = this.logAdapter.options ?? {};
    this.showBody = showBody === true || showBody === 'true';
  }

  onRequest(request: Request) {
    const {method, headers, url, params} = request;
    const result: any = {
      method,
      url,
      params: Object.is(params, {}) ? undefined : JSON.stringify(params),
      headers: JSON.stringify(headers),
    };

    this.logAdapter.http(
      'HttpRequest',
      'Incominhg HTTP request received',
      result,
    );
    return this;
  }

  onRequestBody(requestBody?: any) {
    const body = anyToString(requestBody);

    this.logAdapter.onMessage(
      'HttpRequestBody',
      'Incominhg HTTP request BODY',
      body,
    );
    return this;
  }

  onResponse(response: Response) {
    const {statusCode, statusMessage} = response;
    const headers = response.getHeaders();
    const result: any = {
      statusCode,
      statusMessage,
      headers: JSON.stringify(headers),
    };

    this.logAdapter.http(
      'HttpResponse',
      'Incominhg HTTP request RESPONSE',
      result,
    );
    return this;
  }

  onResponseBody(responseBody: any) {
    const body = this.showBody
      ? anyToString(responseBody)
      : `[* ${typeof responseBody}](hidden by options)`;
    this.logAdapter.onMessage(
      'HttpResponseBody',
      'Incominhg HTTP response body',
      body,
    );
    return this;
  }

  onError(error: Error, request?: Request, statusCode?: number) {
    const {method, url, params} = request ?? {};
    const result = {
      statusCode,
      method,
      url,
      params,
      requestReject: {
        ...error,
      },
    };
    this.logAdapter.error(
      'HttpResponseError',
      'Incominhg HTTP request ERROR',
      result,
    );
  }

  onReject(context: HandlerContext, err: Error) {
    const {method, url, params} = context.request;
    const {message, name, stack} = err;
    const result: any = {
      method,
      url,
      params: JSON.stringify(params),
      reject: {
        message,
        name,
        stack,
      },
    };
    this.logAdapter.error(
      'HttpResponseReject',
      'Incominhg HTTP request REJECT',
      result,
    );
    return this;
  }
}
