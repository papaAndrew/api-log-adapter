import { BindingScope, inject, injectable } from "@loopback/core";
import { LogError, LogErrorProvider, Request } from "@loopback/rest";
import { ApiLogAdapterBindings } from "../keys";

interface LogAdapter {
  onError(err: Error, request: Request, statusCode: number): void;
}

@injectable({ scope: BindingScope.REQUEST })
export class LogResponseErrorProvider implements LogErrorProvider {
  constructor(
    @inject(ApiLogAdapterBindings.HTTP_LOG_ADAPTER, { optional: true })
    private logAdapter?: LogAdapter,
  ) {}

  value(): LogError {
    return (err: Error, statusCode: number, request: Request) => {
      if (this.logAdapter) {
        this.logAdapter.onError(err, request, statusCode);
      }
      throw err;
    };
  }
}
