

export type LogAdapterOptions = {
  level?: string;
  showBody?: boolean | string;
  logInvocation?: boolean | string;
};

export type XRequestId = string | undefined;

export interface ApiLogAdapter {
  level: string;
  sender: string;
  contextId?: string;
  requestId?: string;
  dataToString(data: any): string;
  debug(eventName: string, message: string, args: object): void;
  info(eventName: string, message: string, args: object): void;
  warn(eventName: string, message: string, args: object): void;
  http(eventName: string, message: string, args: object): void;
  error(eventName: string, message: string, args: object): void;
  onMessage(eventName: string, message: string, data?: string): void;
}
