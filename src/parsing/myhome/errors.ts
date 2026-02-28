/**
 * Error codes for myhome parsing. For UI display only; no upload or form logic.
 */

export const ParserErrorCode = {
  PRICE_NOT_FOUND: "PRICE_NOT_FOUND",
  TITLE_NOT_FOUND: "TITLE_NOT_FOUND",
  IMAGE_NOT_FOUND: "IMAGE_NOT_FOUND",
} as const;

export type ParserErrorCodeType = (typeof ParserErrorCode)[keyof typeof ParserErrorCode];

export interface ParserErrorDetail {
  code: ParserErrorCodeType;
  message: string;
}

export function createParserError(
  code: ParserErrorCodeType,
  message: string,
): ParserErrorDetail {
  return { code, message };
}
