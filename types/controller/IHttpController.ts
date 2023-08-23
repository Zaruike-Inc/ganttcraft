import {ILogger} from "#types/IConsole";
import {IFastifyReply} from "#types/IFastify";

/**
 * Status possible que l'on renverra
 * @return {string}
 */
export type TStatusHttp = 'SUCCESS' | 'ERROR' | 'ERROR_INTERNAL';
export type TOtherProperty = { key: string, content: unknown }[];

export enum HTTPCodeSuccess {
    OK = 2000
}

export enum HTTPCodeError {
    GENERIC_BAD_REQUEST = 4000,
    UNAUTHORIZED = 4001,
    MISSING_ARG = 4002,
    INVALID_TOKEN = 4004,
    MALFORMED_TOKEN = 4029,
    INTERNAL_ERROR = 5000,
    MISSING_TOKEN = 4301,
    NOT_FOUND = 4400,
}

/**
 * Each custom code for valid code 2XX
 */
export type THttpCodeSuccess = HTTPCodeSuccess.OK

/**
 * Each custom code in this app for error 4XX and 5XX
 */
export type THttpCodeError =
    HTTPCodeError.GENERIC_BAD_REQUEST |
    HTTPCodeError.INTERNAL_ERROR |
    HTTPCodeError.UNAUTHORIZED |
    HTTPCodeError.MISSING_TOKEN |
    HTTPCodeError.MALFORMED_TOKEN |
    HTTPCodeError.NOT_FOUND |
    HTTPCodeError.INVALID_TOKEN |
    HTTPCodeError.MISSING_ARG;
export default interface IHttpController {
    /**
     * Extrait le code HTTP (que l'on retournera à la vue)
     * @param {number} code - Code Http courant (erreur ect...)
     * @return {number}
     */
    extractHttpCode(code: number): number;

    /**
     * Renvoie la réponse à la vue comme on le souhaite
     * @param {IFastifyReply} res - Réponse que l'on renverra à la vue
     * @param {'SUCCESS'} type - Type du status que l'on souhaite
     * @param {THttpCodeSuccess} code - Code que l'on souhaite renvoyer
     * @param {ILogger} logger - Wrapper de notre console
     * @param {TOtherProperty} otherProperty - Message supplémentaire que l'on souhaite ajouter
     * @return {IFastifyReply}
     */
    response(
        res: IFastifyReply,
        type: 'SUCCESS',
        code: THttpCodeSuccess,
        logger?: ILogger,
        otherProperty?: TOtherProperty,
    ): IFastifyReply;

    /**
     * Renvoie la réponse à la vue comme on le souhaite
     * @param {IFastifyReply} res - Réponse que l'on renverra à la vue
     * @param {'ERROR'} type - Type d'erreur que l'on veut renvoyer à la vue
     * @param {THttpCodeError} code - Code que l'on souhaite renvoyer
     * @param {ILogger} logger - Wrapper de notre console
     * @param {TOtherProperty} otherProperty - Message supplémentaire que l'on souhaite ajouter
     * @return {IFastifyReply}
     */
    response(
        res: IFastifyReply,
        type: 'ERROR',
        code: THttpCodeError,
        logger?: ILogger,
        otherProperty?: TOtherProperty,
    ): IFastifyReply;

    /**
     * Renvoie la réponse à la vue comme on le souhaite
     * @param {IFastifyReply} res - Réponse que l'on renverra à la vue
     * @param {'ERROR_INTERNAL'} type - Tout ce qui touche aux erreurs internes
     * @param {THttpCodeError} code - Code que l'on souhaite renvoyer
     * @param {ILogger} logger - Wrapper de notre console
     * @param {TOtherProperty} otherProperty - Message supplémentaire que l'on souhaite ajouter
     * @param {TypeError} error - Erreur à renvoyer à la vue
     * @return {IFastifyReply}
     */
    response(
        res: IFastifyReply,
        type: 'ERROR_INTERNAL',
        code: THttpCodeError,
        logger?: ILogger,
        otherProperty?: TOtherProperty,
        error?: TypeError
    ): IFastifyReply;

    /**
     * Renvoie la réponse à la vue comme on le souhaite
     * @param {IFastifyReply} res - Réponse que l'on renverra à la vue
     * @param {'ERROR_INTERNAL'} type - Tout ce qui touche aux erreurs internes
     * @param {THttpCodeError} code - Code que l'on souhaite renvoyer
     * @param {ILogger} logger - Wrapper de notre console
     * @param {TOtherProperty} otherProperty - Message supplémentaire que l'on souhaite ajouter
     * @param {TypeError} error - Erreur à renvoyer à la vue
     * @return {IFastifyReply}
     */
    response(
        res: IFastifyReply,
        type: TStatusHttp,
        code: THttpCodeError | THttpCodeSuccess,
        logger?: ILogger,
        otherProperty?: TOtherProperty,
        error?: TypeError
    ): IFastifyReply;
}
