 import {TProvider} from "#types/IPluginManager";

export default class GatewayError extends Error {
    private readonly provider: TProvider;
    private readonly errorCode: string;

    constructor(provider: TProvider, errorCode: string, error?: TypeError) {
        super(errorCode);
        this.provider = provider;
        this.errorCode = errorCode;
        // Implement extra message here
        if (error !== undefined) {
            this.message = error?.message;
        }
    }

    currentErrorCode(){
        return this.errorCode;
    }
}
