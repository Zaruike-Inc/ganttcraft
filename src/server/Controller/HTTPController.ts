import {ILogger} from "#types/IConsole";
import {IFastifyReply} from "#types/IFastify";
import IHttpController, {
    THttpCodeError,
    THttpCodeSuccess,
    TOtherProperty,
    TStatusHttp
} from "#types/controller/IHttpController";
import {isNotNull} from "#utils/Validator";

class HTTPController implements IHttpController {
    response(
        res: IFastifyReply,
        type: TStatusHttp,
        code: THttpCodeError | THttpCodeSuccess,
        logger?: ILogger,
        otherProperty?: TOtherProperty,
        error?: TypeError
    ): IFastifyReply {
        // extrait le code http que l'on veut
        const currentCode = this.extractHttpCode(code);
        // récupère la base de notre réponse
        let baseResponse = {
            status: currentCode,
            code: code
        }

        // Si on souhaite d'autre propriété supplémentaire
        if (isNotNull(otherProperty) && otherProperty !== undefined && otherProperty.length > 0) {
            const supplyRep = Object.fromEntries(otherProperty.map((t) => [t.key, t.content]));
            baseResponse = {
                ...baseResponse,
                ...supplyRep
            }
        }

        // en cas d'erreur interne
        if (type === "ERROR_INTERNAL" && error !== undefined && error !== null && logger !== undefined) {
            logger.error(error);
        }
        // Renvoie la réponse à la vue
        return res.code(currentCode).send(baseResponse);
    }

    redirect(res: IFastifyReply, target: string, isPermanant = false): IFastifyReply {
        return res.code(isPermanant ? 301 : 302).redirect(target);
    }

    extractHttpCode(code: number): number {
        let currentHttpCode = 0;
        if (code >= 2000 && code <= 2099) {
            currentHttpCode = 200;
        } else if (code >= 2100 && code <= 2199) {
            currentHttpCode = 201;
        } else if (code >= 4000 && code <= 4099) {
            currentHttpCode = 400;
        } else if (code >= 4100 && code <= 4199) {
            currentHttpCode = 401;
        } else if (code >= 4300 && code <= 4399) {
            currentHttpCode = 403;
        } else if (code >= 4400 && code <= 4499) {
            currentHttpCode = 404;
        } else if (code >= 5000 && code <= 5100) {
            currentHttpCode = 500;
        }
        return currentHttpCode;
    }
}

const httpController = new HTTPController();
export default httpController;
