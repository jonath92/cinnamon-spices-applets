import { stringify } from "query-string";

const { Message, SessionAsync, Session } = imports.gi.Soup;
const { PRIORITY_DEFAULT } = imports.gi.GLib;

const httpSession = new Session() as any;

export interface HTTPParams {
  [key: string]: boolean | string | number | undefined;
}

export interface HttpError {
  code: number;
  message: string;
  reason_phrase: string;
}

export function isHttpError(x: any): x is HttpError {
  return typeof x.reason_phrase === "string";
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

// not complete
interface Headers {
  "Content-Type": "application/json" | "application/x-www-form-urlencoded";
  Authorization?: string;
}

// FIXME: why is T1 not allowed to be of type HTTPParams?
export interface LoadJsonArgs<T1 = any, T2 = HTTPParams> {
  url: string;
  method?: Method;
  bodyParams?: T1;
  queryParams?: T2;
  headers: Headers;
}

const ByteArray = imports.byteArray;

function checkForHttpError(
  message: imports.gi.Soup.Message
): HttpError | false {
  const code = message?.status_code | 0;
  const reason_phrase = message?.reason_phrase || "no network response";

  let errMessage: string | undefined;

  if (code < 100) {
    errMessage = "no network response";
  } else if (code < 200 || code > 300) {
    errMessage = "bad status code";
  } else if (!message.response_body?.data) {
    errMessage = "no response body";
  }

  return errMessage
    ? {
        code,
        reason_phrase,
        message: errMessage,
      }
    : false;
}

export function loadJsonAsync<T1>(args: LoadJsonArgs): Promise<T1> {
  const { url, method = "GET", bodyParams, queryParams, headers } = args;

  const uri = queryParams ? `${url}?${stringify(queryParams)}` : url;
  const message = Message.new(method, uri);

  Object.entries(headers).forEach(([key, value]) => {
    // @ts-ignore
    message.request_headers.append(key, value);
  });

  if (bodyParams) {
    const bodyParamsStringified = stringify(bodyParams);
    // @ts-ignore
    message.request_body.append(
      ByteArray.fromString(bodyParamsStringified, "UTF-8")
    );
  }

  return new Promise((resolve, reject) => {
    httpSession.send_and_read_async(
      message,
      PRIORITY_DEFAULT,
      null,
      (session: any, result: any) => {
        const res: imports.gi.GLib.Bytes | null =
          httpSession.send_and_read_finish(result);

          const responseBody = res != null ? ByteArray.toString(ByteArray.fromGBytes(res)) : null;

          if (!responseBody) {
            return; 
            // TODO. error handling
          }

          const data = JSON.parse(responseBody) as T1;
          resolve(data);

      }


    );

  });
}
