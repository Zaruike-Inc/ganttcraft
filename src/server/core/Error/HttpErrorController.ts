import {FastifyRequest} from "fastify";

/**
 * Class for report the error with a little more information for whelp to debug faster
 * Send error too if you want a custom report like sentry or hook in discord, slack e.g...
 * @extends TypeError
 */
export default class HttpErrorController extends TypeError {
    private readonly method: string;
    private readonly road: string;

    /**
     * @constructor
     * @param {FastifyRequest} req - Current Request
     * @param {TypeError} e - Current Error
     */
    constructor(req: FastifyRequest, e: TypeError) {
        super();
        this.method = req.method;
        this.road = req.url;
        this.message = e.message;
        this.stack = e.stack;
    }

    __toString(): string {
        return `[${this.method}][${this.road}]${this.message}`;
    }
}
