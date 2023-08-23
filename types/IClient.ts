export type TKeyBody = string | Blob | number | boolean | undefined;

export interface IHeaderSend {
    Authorization?: string;
    Accept: string;
    'Content-Type'?: string;
    /**
     * User agent customizable (pas besoin de type en plus)
     * @return {string|undefined}
     */
    'User-Agent'?: string;
}

export interface HttpResponse<T> extends Response {
    parseBody?: T & { code: number };
}

export interface IBodyInterface {
    body?: {
        [key: string]: TKeyBody;
        default?: boolean;
    };
    customConfig?: {
        headers?: Partial<IHeaderSend>;
    };
    headers?: Partial<IHeaderSend>;
}

export interface IHandleResponse extends Response {
    error?: string;
}
