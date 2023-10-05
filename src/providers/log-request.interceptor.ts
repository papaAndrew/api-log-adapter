import {
  BindingScope,
  Interceptor,
  InvocationContext,
  Provider,
  ValueOrPromise,
  inject,
  injectable
} from '@loopback/core';
import {Request, RestBindings} from '@loopback/rest';
import {ApiLogAdapterBindings} from '../keys';
import {HttpLogAdapter} from '../lib/http-log-adapter';
import {LogAdapterOptions, XRequestId} from '../lib/types';

@injectable({scope: BindingScope.APPLICATION})
export class LogRequestInterceptor implements Provider<Interceptor> {

  constructor(
    @inject(RestBindings.Http.REQUEST)
    private request: Request,
    @inject(ApiLogAdapterBindings.REQUEST_ID)
    public requestId: XRequestId,
    @inject(ApiLogAdapterBindings.HTTP_LOG_ADAPTER)
    private logAdapter: HttpLogAdapter,
    @inject(ApiLogAdapterBindings.OPTIONS)
    private logOptions: LogAdapterOptions,
  ) { }

  value(): Interceptor {
    return this.intercept.bind(this);
  }

  private bindToContext(invocationContext: InvocationContext) {
    const {parent, targetName} = invocationContext;
    if (parent) {
      parent.bind(ApiLogAdapterBindings.INTERCEPTED_METHOD).to(targetName);
    }
  }

  private logRequest() {
    let canLog: boolean = true;
    const {logInvocation} = this.logOptions ?? {};

    if (typeof logInvocation !== 'undefined') {
      canLog = logInvocation === true || logInvocation === "true";
    }
    if (canLog) {
      const {logAdapter, request} = this;
      logAdapter
        .onRequest(request)
        .onRequestBody(request.body);
    }
  }

  private async intercept<T>(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<T>,
  ) {
    this.bindToContext(invocationCtx);

    this.logRequest();

    return next();
  }
}
