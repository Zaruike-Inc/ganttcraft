import {HttpResponse, IBodyInterface, IHandleResponse, IHeaderSend} from "#types/IClient";

const handleResponse = (response: IHandleResponse): IHandleResponse => {
    return response;
};

export default async function clientProvider<T>(
    endpoint: string,
    {body, ...customConfig}: IBodyInterface,
    type: string | undefined = undefined,
    multipart = false,
    needCaching = false
): Promise<HttpResponse<T>> {
    const headers: IHeaderSend = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...customConfig.headers
    }
    const extractData = {...customConfig};
    if (extractData.headers !== undefined) {
        delete extractData.headers;
    }

    const config = {
        method: type ?? (body ? 'POST' : 'GET'),
        ...extractData,
        headers: headers,
        next: {},
        body: undefined as unknown as BodyInit
    }

    if (needCaching) {
        // Revalidate in 1h
        config.next = {revalidate: 3600}
    }

    if (body && Object.keys(body) !== undefined && Object.keys(body).length > 0) {
        if (multipart) {
            const formData = new FormData();
            // permet de construire les informations sous forme d'un json
            const keys = Object.keys(body);
            for (let i = 0; i < keys.length; i++) {
                if (body[keys[i]] instanceof Blob) {
                    formData.append(
                        keys[i],
                        body[keys[i]] as Blob,
                        (body[keys[i]] as unknown as { name: string }).name
                    );
                } else {
                    formData.append(keys[i], body[keys[i]] as string | Blob);
                }
            }
            config.body = formData;
            // Remove the content type this cause internal error if multipart was enabled
            delete config.headers['Content-Type'];
        } else {
            config.body = JSON.stringify(body);
        }
    }

    try {
        const response: HttpResponse<T> = await fetch(`${endpoint}`, config as unknown as RequestInit);
        response.parseBody = await response.json();
        return response;
    } catch (err) {
        return handleResponse(err as IHandleResponse);
    }
}
