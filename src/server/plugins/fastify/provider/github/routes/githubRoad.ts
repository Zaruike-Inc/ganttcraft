import {ILogger} from "#types/IConsole";
import {FastifyInstance, FastifyRequest} from "fastify";
import {IFastifyOptions, IFastifyReply} from "#types/IFastify";
import HTTPController from "#srv/Controller/HTTPController";
import {HTTPCodeError} from "#types/controller/IHttpController";
import HttpErrorController from "#srv/core/Error/HttpErrorController";
import CheckController from "#srv/Controller/CheckController";
import githubController from "#srv/plugins/fastify/provider/github/controller/githubController";

/**
 * All road form GitHub request
 * @param {FastifyInstance} fastify - Instance of Fastify
 * @param {IFastifyOptions} opt - Current Options
 * @return {Promise<void>}
 */
export default async function githubRoad(fastify: FastifyInstance, opt: IFastifyOptions): Promise<void> {
    let logger: ILogger;
    if (opt !== undefined) {
        if (opt.logger !== undefined) {
            logger = opt.logger;
        }
    }

    fastify.get('user/@me', async (req, res) => {
        try {
            // At this point check if token is provided if isn't provide no need to continue reply bad request
            const token = await CheckController.verifyToken<undefined>(logger, req, res, 'GITHUB');
            if (!token.result) {
                return token.req;
            }
            return githubController.fetchCurrentUser(token.req, res, logger);
        } catch (e) {
            return HTTPController.response(
                res,
                'ERROR_INTERNAL',
                HTTPCodeError.INTERNAL_ERROR,
                logger,
                undefined,
                new HttpErrorController(req, e as TypeError)
            );
        }
    });

    /**
     * Find all projects and groups with this endpoint
     * @param {FastifyRequest} req - current request
     * @param {IFastifyReply} res - reply response
     * @return {Promise<IFastifyReply>}
     */
    fastify.post('search', async (req: FastifyRequest, res: IFastifyReply): Promise<IFastifyReply> => {
        try {
            const token = await CheckController.verifyToken<{
                typeSearch: string,
                query: string
            }>(logger, req, res, 'GITHUB');
            if (!token.result) {
                return token.req;
            }
            return githubController.searchBy(token.req, res, logger);
        } catch (e) {
            return HTTPController.response(
                res,
                'ERROR_INTERNAL',
                HTTPCodeError.INTERNAL_ERROR,
                logger,
                undefined,
                new HttpErrorController(req, e as TypeError)
            );
        }
    });

    /**
     * Fetch all issue by group or project at this moment
     * @param {FastifyRequest} req - current Request
     * @param {IFastifyReply} res - Reply
     * @return {Promise<IFastifyReply>}
     */
    fastify.post('issues', async (req: FastifyRequest, res: IFastifyReply): Promise<IFastifyReply> => {
        try {
            const token = await CheckController.verifyToken<{
                type: 'PROJECT' | 'GROUP',
                name: string
            }>(logger, req, res, 'GITHUB');
            if (!token.result) {
                return token.req;
            }

            return githubController.findIssuesBy(token.req, res, logger);
        } catch (e) {
            return HTTPController.response(
                res,
                'ERROR_INTERNAL',
                HTTPCodeError.INTERNAL_ERROR,
                logger,
                undefined,
                new HttpErrorController(req, e as TypeError)
            );
        }
    })
}
