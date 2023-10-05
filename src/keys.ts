import { BindingKey, CoreBindings } from "@loopback/core";
import { HttpLogAdapter } from "./lib/http-log-adapter";
import { MessageLogAdapter } from "./lib/message-log-adapter";
import { XRequestId } from "./lib/types";

const keyComponent = `${CoreBindings.COMPONENTS}.ApiLogAdapterComponent`;

export namespace ApiLogAdapterBindings {
  export const COMPONENT = BindingKey.create(keyComponent);

  export const OPTIONS = BindingKey.create(`${keyComponent}.options`);

  /**
   * Current request context
   */
  //export const CONTEXT = BindingKey.create(keyComponent);

  export const LOG_REQUEST_INTERCEPTOR = BindingKey.create(
    `${keyComponent}.LogRequestInterceptor`,
  );

  export const LOG_RESPONSE_SEND = BindingKey.create(
    `${keyComponent}.LogResponseSend`,
  );

  export const LOG_RESPONSE_REJECT = BindingKey.create(
    `${keyComponent}.LogResponseReject`,
  );

  export const LOG_RESPONSE_ERROR = BindingKey.create(
    `${keyComponent}.LogResponseError`,
  );

  export const MESSAGE_LOG_ADAPTER = BindingKey.create<MessageLogAdapter>(
    `${keyComponent}.MessageLogAdapter`,
  );

  export const HTTP_LOG_ADAPTER = BindingKey.create<HttpLogAdapter>(
    `${keyComponent}.HttpLogAdapter`,
  );

  export const REQUEST_ID = BindingKey.create<XRequestId>(
    `${keyComponent}.RequestId`,
  );

  export const INTERCEPTED_METHOD = BindingKey.create<string>(
    `${keyComponent}.InterceptedMethod`,
  );
}

export namespace SharedBindings {
  export const X_REQUEST_ID = BindingKey.create<XRequestId>(`X-Request-Id`);

  export const USER_AGENT = BindingKey.create<string>(`User-Agent`);
}
