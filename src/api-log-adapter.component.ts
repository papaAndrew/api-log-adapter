import {
  Application,
  Binding,
  BindingScope,
  Component,
  CoreBindings,
  Interceptor,
  inject,
} from "@loopback/core";
import {
  LoggingBindings,
  LoggingComponent,
  LoggingComponentConfig,
} from "@loopback/logging";
import { RestBindings } from "@loopback/rest";
import { LoggerOptions, format } from "winston";
import { ApiLogAdapterBindings } from "./keys";
import { LogAdapterOptions } from "./lib/types";
import { HttpLogAdapterProvider } from "./providers/http-log-adapter.provider";
import { LogRequestInterceptor } from "./providers/log-request.interceptor";
import { LogResponseErrorProvider } from "./providers/log-response-error.provider";
import { LogResponseRejectProvider } from "./providers/log-response-reject.provider";
import { LogResponseSendProvider } from "./providers/log-response-send.provider";
import { MessageLogAdapterProvider } from "./providers/message-log-adapter.provider";
import { RequestIdProvider } from "./providers/requestid.provider";

export class ApiLogAdapterComponent implements Component {
  bindings = [
    Binding.bind(ApiLogAdapterBindings.REQUEST_ID)
      .toProvider(RequestIdProvider)
      .inScope(BindingScope.REQUEST),
    Binding.bind(ApiLogAdapterBindings.MESSAGE_LOG_ADAPTER)
      .toProvider(MessageLogAdapterProvider)
      .inScope(BindingScope.TRANSIENT),
    Binding.bind(ApiLogAdapterBindings.HTTP_LOG_ADAPTER)
      .toProvider(HttpLogAdapterProvider)
      .inScope(BindingScope.REQUEST),
    Binding.bind<Interceptor>(ApiLogAdapterBindings.LOG_REQUEST_INTERCEPTOR)
      .toProvider(LogRequestInterceptor)
      .inScope(BindingScope.REQUEST),
  ];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private app: Application,
    @inject(ApiLogAdapterBindings.OPTIONS, { optional: true })
    options?: LogAdapterOptions,
  ) {
    this.configureWinston(options);

    this.updateSequence(options);
  }

  private configureWinston(options?: LogAdapterOptions) {
    const { combine, timestamp, json } = format;

    const loggerConfig: LoggerOptions = {
      level: options?.level ?? "debug",
      format: combine(timestamp(), json()),
    };

    this.app
      .configure<LoggerOptions>(LoggingBindings.WINSTON_LOGGER)
      .to(loggerConfig);
    const loggingComponentConfig: LoggingComponentConfig = {
      enableFluent: false,
      enableHttpAccessLog: false,
    };
    this.app
      .configure<LoggingComponentConfig>(LoggingBindings.COMPONENT)
      .to(loggingComponentConfig);
    this.app.component(LoggingComponent);
  }

  private updateSequence(options?: LogAdapterOptions) {
    let canUpdate: boolean = true;

    const { logInvocation } = options ?? {};
    if (typeof logInvocation !== "undefined") {
      canUpdate = logInvocation === true || logInvocation === "true";
    }

    if (canUpdate) {
      this.app
        .bind(RestBindings.SequenceActions.SEND)
        .toProvider(LogResponseSendProvider);
      this.app
        .bind(RestBindings.SequenceActions.LOG_ERROR)
        .toProvider(LogResponseErrorProvider);
      this.app
        .bind(RestBindings.SequenceActions.REJECT)
        .toProvider(LogResponseRejectProvider);
    }
  }
}
