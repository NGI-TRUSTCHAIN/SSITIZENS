import http_status from 'http-status';
import { RPC_ERROR_MSGS } from '../constants/rpc.constants.js';

export class AppError extends Error {
  constructor(
    public status: number,
    public name: string,
    public message: string,
  ) {
    status = status ?? http_status.INTERNAL_SERVER_ERROR;
    name = name ?? http_status[`${http_status.INTERNAL_SERVER_ERROR}_NAME`];
    message = message ?? name;
    super();
  }
}

export class BadRequestError extends AppError {
  constructor(message?: string, name?: string) {
    const status = http_status.BAD_REQUEST;
    name = name ?? http_status[`${status}_NAME`];
    message = message ?? http_status[status];
    super(status, name, message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message?: string, name?: string) {
    const status = http_status.UNAUTHORIZED;
    name = name ?? http_status[`${status}_NAME`];
    message = message ?? http_status[status];
    super(status, name, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message?: string, name?: string) {
    const status = http_status.FORBIDDEN;
    name = name ?? http_status[`${status}_NAME`];
    message = message ?? http_status[status];
    super(status, name, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message?: string, name?: string) {
    const status = http_status.NOT_FOUND;
    name = name ?? http_status[`${status}_NAME`];
    message = message ?? http_status[status];
    super(status, name, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message?: string, name?: string) {
    const status = http_status.CONFLICT;
    name = name ?? http_status[`${status}_NAME`];
    message = message ?? http_status[status];
    super(status, name, message);
    this.name = 'ConflictError';
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message?: string, name?: string) {
    const status = http_status.UNSUPPORTED_MEDIA_TYPE;
    name = name ?? http_status[`${status}_NAME`];
    message = message ?? http_status[status];
    super(status, name, message);
    this.name = 'UNSUPPORTED_MEDIA_TYPE';
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message?: string, name?: string) {
    const status = http_status.UNPROCESSABLE_ENTITY;
    name = name ?? http_status[`${status}_NAME`];
    message = message ?? http_status[status];
    super(status, name, message);
    this.name = 'UnprocessableEntityError';
  }
}

export class InternalServerError extends AppError {
  constructor(message?: string, name?: string) {
    const status = http_status.INTERNAL_SERVER_ERROR;
    name = name ?? http_status[`${status}_NAME`];
    message = message ?? http_status[status];
    super(status, name, message);
    this.name = 'InternalServerError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message?: string, name?: string) {
    const status = http_status.SERVICE_UNAVAILABLE;
    name = name ?? http_status[`${status}_NAME`];
    message = message ?? http_status[status];
    super(status, name, message);
    this.name = 'ServiceUnavailableError';
  }
}


export type ErrorMessagesType = typeof RPC_ERROR_MSGS[number];
export class RpcError extends Error {
  constructor(
      public code: number,
      public message: ErrorMessagesType,
      public data?: string,
  ) {
      super(message);
  }
}

export class RpcInvalidRequest extends RpcError {
  constructor(
      public data?: string,
  ) {
      super(-32600, "Invalid Request", data);
  }
}

export class RpcMethodNotFound extends RpcError {
  constructor(
      public data?: string,
  ) {
      super(-32601, "Method not found", data);
  }
}

export class RpcInvalidParams extends RpcError {
  constructor(
      public data?: string,
  ) {
      super(-32602, "Invalid params", data);
  }
}

export class RpcInternalError extends RpcError {
  constructor(
      public data?: string,
  ) {
      super(-32603, "Internal error", data);
  }
}

export class RpcServerError extends RpcError {
  constructor(
      public code: number,
      public data?: string,
  ) {
      super(code, "Server error", data);
  }
}

// Error type class family definition

export class ErrorType extends Error {
  name: string;
  message: string;
  cause?: string;

  constructor(name: string, message: string, cause?: string) {
      super();
      this.name = name;
      this.message = message;
      this.cause = cause;
  }
}
export class ExecutionFailed extends ErrorType {
  constructor(message: string, cause?: string) {
      super("Execution failed", message, cause);
  }
}

export class InvalidParameters extends ErrorType {
  constructor(message: string, cause?: string) {
      super("Invalid Parameters Provided", message, cause);
  }
}