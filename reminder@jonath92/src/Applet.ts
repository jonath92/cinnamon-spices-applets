import { CLIENT_ID, CLIENT_SECRET, SETTINGS_PATH } from "./consts";

import { stringify } from 'query-string'

const { IconApplet } = imports.ui.applet
const { Message, MemoryUse, ProxyResolverDefault, SessionAsync } = imports.gi.Soup;
const ByteArray = imports.byteArray;

const { new_for_path } = imports.gi.Gio.File

interface GenericResponse {
    Success: boolean;
    Data: any;
    ErrorData: HttpError;
}

interface HTTPParams {
    [key: string]: boolean | string | number;
}

type ErrorDetail = "no key" | "bad key" | "no location" | "bad location format" |
    "location not found" | "no network response" | "no api response" | "location not covered" |
    "bad api response - non json" | "bad api response" | "no response body" |
    "no response data" | "unusual payload" | "key blocked" | "unknown" | "bad status code" | "import error";

interface HttpError {
    code: number;
    message: ErrorDetail;
    reason_phrase: string;
    data?: any;
    response?: imports.gi.Soup.Message
}

type Method = "GET" | "POST" | "PUT" | "DELETE";


export class ReminderApplet extends IconApplet {

    private readonly _httpSession = new SessionAsync();

    private refreshToken: string



    constructor(orientation: imports.gi.St.Side, panel_height: number, instance_id: number) {
        super(orientation, panel_height, instance_id)
        this.set_applet_icon_name("computer");


        this.refreshToken = this.getRefreshToken()


    }

    on_applet_clicked() {
        this.getAccessToken()
    }


    private async getAccessToken() {

        const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

        const query = encodeURI(url)

        const message = Message.new('POST', query)

        const params = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: this.refreshToken
        }

        const paramsStringified = stringify(params)


        //  @ts-ignore
        message.set_request('application/x-www-form-urlencoded', MemoryUse.COPY, ByteArray.fromString(paramsStringified))

        this._httpSession.queue_message(message, (session, message) => {
            global.log(message.response_body.data)
        })


        // const response = await this.LoadAsync(url, params, "POST")

        // global.log(response.Data)
    }



    /**
    * Handles obtaining data over http. 
    */
    public async LoadAsync(url: string, params?: HTTPParams, method: Method = "GET"): Promise<GenericResponse> {
        let message = await this.Send(url, params, method);

        let error: HttpError = null;

        // Error generation
        if (!message) {
            error = {
                code: 0,
                message: "no network response",
                reason_phrase: "no network response",
                response: null
            }
        }
        // network or DNS error
        else if (message.status_code < 100 && message.status_code >= 0) {
            error = {
                code: message.status_code,
                message: "no network response",
                reason_phrase: message.reason_phrase,
                response: message
            }
        }
        else if (message.status_code > 300 || message.status_code < 200) {
            error = {
                code: message.status_code,
                message: "bad status code",
                reason_phrase: message.reason_phrase,
                response: message
            }
        }
        else if (!message.response_body) {
            error = {
                code: message.status_code,
                message: "no response body",
                reason_phrase: message.reason_phrase,
                response: message
            }
        }
        else if (!message.response_body.data) {
            error = {
                code: message.status_code,
                message: "no response data",
                reason_phrase: message.reason_phrase,
                response: message
            }
        }

        if (message?.status_code > 200 && message?.status_code < 300) {
            global.log("Warning: API returned non-OK status code '" + message?.status_code + "'");
        }

        global.log("API full response: " + message?.response_body?.data?.toString());
        if (error != null)
            global.log("Error calling URL: " + error.reason_phrase + ", " + error?.response?.response_body?.data);
        return {
            Success: (error == null),
            Data: message?.response_body?.data,
            ErrorData: error
        }
    }


    /**
     * Send a http request
     * @param url 
     * @param params 
     * @param method 
     */
    public async Send(url: string, params?: HTTPParams, method: Method = "GET"): Promise<imports.gi.Soup.Message> {
        // Add params to url
        if (params != null) {
            let items = Object.keys(params);
            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                url += (index == 0) ? "?" : "&";
                url += (item) + "=" + params[item]
            }
        }

        let query = encodeURI(url);
        let data: imports.gi.Soup.Message = await new Promise((resolve, reject) => {
            let message = Message.new(method, query);

            message.request_body

            this._httpSession.queue_message(message, (session, message) => {
                resolve(message);
            });
        });

        return data;
    }


    private getRefreshToken() {
        const settingsFile = new_for_path(SETTINGS_PATH)
        const [success, contents] = settingsFile.load_contents(null)

        const settings = JSON.parse(contents)
        return settings["refresh_token"] as string
    }

}
