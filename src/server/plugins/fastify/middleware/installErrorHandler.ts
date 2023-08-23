import fp from "fastify-plugin";
import { IFastifyOptions } from "#types/IFastify";
import {FastifyError, FastifyPluginAsync} from "fastify";
interface IParsedError {
    message: string;
    status: number;
    extensions?: { code?: number };
}

function parseError(error: FastifyError): IParsedError {
    if (error["message"].includes('csrf')) {
        return {message: "Invalid CSRF token: please reload the page.", status: 403};
    }
    // Récupère le code d'erreur
    const code = (error['statusCode'] || (error as unknown as { status: string })['status'] || error['code']) as string;
    // Force le code en base 10
    const codeAsFloat = parseInt(code, 10);
    const httpCode = isFinite(codeAsFloat) && codeAsFloat >= 400 && codeAsFloat < 600 ? codeAsFloat : 500;
    return {message: "An unknown error occurred", status: httpCode};
}

const ErrorHandler: FastifyPluginAsync = async (app, opt: IFastifyOptions): Promise<void> => {
    app.setErrorHandler((error, _req, res) => {
        const parsedError = parseError(error);
        const errorMessageString = `Error: ${parsedError.message}`;
        if (res.sent) {
            opt.logger?.error(errorMessageString);
            return;
        }

        res.status(parsedError.status);
        res.header("Content-Type", "application/json; charset=utf-8").send({
            errors: [
                {
                    message: errorMessageString,
                    extensions: {...parsedError.extensions},
                },
            ],
        });
    });
}

export default fp(ErrorHandler);
