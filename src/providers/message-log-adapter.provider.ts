import { Context, Getter, Provider, inject } from "@loopback/core";
import { LoggingBindings, WinstonLogger } from "@loopback/logging";
import { ApiLogAdapterBindings, SharedBindings } from "../keys";
import {
  MessageLogAdapter,
  MessageLogAdapterOptions,
} from "../lib/message-log-adapter";
import { LogAdapterOptions, XRequestId } from "../lib/types";

export class MessageLogAdapterProvider implements Provider<MessageLogAdapter> {
  constructor(
    @inject(LoggingBindings.WINSTON_LOGGER)
    private logger: WinstonLogger,
    @inject.context()
    private context: Context,
    @inject(ApiLogAdapterBindings.OPTIONS, { optional: true })
    private options?: LogAdapterOptions,
    @inject(SharedBindings.USER_AGENT, { optional: true })
    private userAgent?: string,
    @inject.getter(SharedBindings.X_REQUEST_ID, { optional: true })
    private requestIdGetter?: Getter<XRequestId>,
  ) {}

  private async getRequestId(): Promise<XRequestId> {
    const requestId = await this.requestIdGetter?.();
    return requestId;
  }
  async value(): Promise<MessageLogAdapter> {
    const { context, options, userAgent } = this;
    const { level, showBody } = options ?? {};

    const contextId = context?.name;
    const requestId = await this.getRequestId();

    const messageLogAdapterOptions: MessageLogAdapterOptions = {
      level,
      showBody,
      userAgent,
      contextId,
      requestId,
    };
    const adapter = new MessageLogAdapter(
      this.logger,
      messageLogAdapterOptions,
    );
    return adapter;
  }
}
