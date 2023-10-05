import {
  BindingScope,
  Provider,
  Setter,
  inject,
  injectable
} from '@loopback/core';
import {Request, RestBindings} from '@loopback/rest';
import {SharedBindings} from '../keys';
import {XRequestId} from '../lib/types';


@injectable({scope: BindingScope.REQUEST})
export class RequestIdProvider implements Provider<XRequestId> {
  private requestId: XRequestId;

  constructor(
    @inject(RestBindings.Http.REQUEST)
    httpRequest: Request,
    @inject.setter(SharedBindings.X_REQUEST_ID)
    requestIdSetter: Setter<XRequestId>,
  ) {
    this.requestId = httpRequest.get(SharedBindings.X_REQUEST_ID.key);
    requestIdSetter(this.requestId);
  }

  value(): XRequestId {
    return this.requestId;
  }
}
