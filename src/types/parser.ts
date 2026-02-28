/**
 * Parser result contract: selectors return success or failure, never throw.
 */

export type SelectorSuccess<T> = {
  ok: true;
  value: T;
};

export type SelectorError = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type SelectorResult<T> = SelectorSuccess<T> | SelectorError;

export interface ParserError {
  code: string;
  message: string;
}

export interface ParserOutput<T> {
  data: Partial<T>;
  errors: ParserError[];
}

export function success<T>(value: T): SelectorSuccess<T> {
  return { ok: true, value };
}

export function failure(code: string, message: string): SelectorError {
  return {
    ok: false,
    error: { code, message },
  };
}
