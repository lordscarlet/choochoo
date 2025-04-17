import { ErrorCode } from "./error_code";

export class UserError extends Error {
  constructor(
    readonly statusCode: number,
    msg: string,
    readonly errorCode?: ErrorCode,
  ) {
    super(msg);
  }

  toString(): string {
    return this.constructor.name + ": " + this.message;
  }
}

export class InvalidInputError extends UserError {
  constructor(msg: string, errorCode?: ErrorCode) {
    super(400, msg, errorCode);
  }
}

export class InvalidXsrfToken extends UserError {
  constructor() {
    super(400, "Invalid XSRF token", ErrorCode.INVALID_XSRF_TOKEN);
  }
}

export class UnauthorizedError extends UserError {
  constructor(msg: string) {
    super(401, msg);
  }
}

export class PermissionDeniedError extends UserError {
  constructor(msg: string) {
    super(403, msg);
  }
}

export class NotFoundError extends UserError {
  constructor(msg: string) {
    super(404, msg);
  }
}

interface ErrorData {
  invalidInput?: true | string;
  permissionDenied?: true | string;
  notFound?: true | string;
  unauthorized?: true | string;
  errorCode?: ErrorCode;
}

export type ErrorInput = ErrorData | string;

export function emitError(err: ErrorInput): never {
  if (typeof err === "string") {
    throw new Error(err);
  } else if (err.invalidInput != null) {
    throw new InvalidInputError(
      err.invalidInput === true ? "invalidInput" : err.invalidInput,
      err.errorCode,
    );
  } else if (err.permissionDenied != null) {
    throw new PermissionDeniedError(
      err.permissionDenied === true ? "permissionDenied" : err.permissionDenied,
    );
  } else if (err.notFound != null) {
    throw new NotFoundError(err.notFound === true ? "notFound" : err.notFound);
  } else if (err.unauthorized != null) {
    throw new UnauthorizedError(
      err.unauthorized === true ? "unauthorized" : err.unauthorized,
    );
  } else {
    throw new Error("unknown");
  }
}
