import { BindingScope, inject, injectable } from "@loopback/core";
import {
  HandlerContext,
  Reject,
  RejectProvider,
  writeResultToResponse,
} from "@loopback/rest";
import { ApiLogAdapterBindings } from "../keys";

interface LogAdapter {
  onReject(handlerContext: HandlerContext, err: any): void;
}

@injectable({ scope: BindingScope.REQUEST })
export class LogResponseRejectProvider implements RejectProvider {
  constructor(
    @inject(ApiLogAdapterBindings.HTTP_LOG_ADAPTER)
    private logAdapter: LogAdapter,
  ) {}

  value(): Reject {
    return (handlerContext: HandlerContext, err: any) => {
      this.logAdapter.onReject(handlerContext, err);
      const { response } = handlerContext;
      const { message, httpStatusCode } = err;
      response.statusCode = httpStatusCode ?? 500;
      response.statusMessage = message ?? "Internal server error";

      writeResultToResponse(response, {
        error: {
          ...err,
        },
      });
    };
  }
}
