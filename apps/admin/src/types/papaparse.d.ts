declare module 'papaparse' {
  export interface ParseConfig {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    step?: (results: ParseResult<any>, parser: Parser) => void;
    complete?: (results: ParseResult<any>, file?: File) => void;
    error?: (error: ParseError, file?: File) => void;
    download?: boolean;
    skipEmptyLines?: boolean;
    chunk?: (results: ParseResult<any>, parser: Parser) => void;
    fastMode?: boolean;
    transform?: (value: string, field: string | number) => any;
    transformHeader?: (header: string) => string;
  }

  export interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      fields: string[];
      truncated: boolean;
    };
  }

  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
  }

  export interface Parser {
    abort: () => void;
    stream: (chunk: string) => void;
  }

  export function parse<T = any>(input: string | File, config?: ParseConfig): ParseResult<T>;
  export function unparse(data: any[], config?: any): string;
  export function parseRemote(url: string, config?: ParseConfig): void;

  const Papa: {
    parse: typeof parse;
    unparse: typeof unparse;
    parseRemote: typeof parseRemote;
  };

  export default Papa;
}
