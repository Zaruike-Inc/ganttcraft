import CheckController from "#srv/Controller/CheckController";
import HTTPController from "#srv/Controller/HTTPController";
import HttpErrorController from "#srv/core/Error/HttpErrorController";
import {ILogger} from "#types/IConsole";
import {IFastifyOptions, IFastifyReply} from "#types/IFastify";
import {HTTPCodeError} from "#types/controller/IHttpController";
import {FastifyInstance, FastifyRequest} from "fastify";
import gitlabController from "#srv/plugins/fastify/provider/gitlab/controller/gitlabController";

/**
 * All road form gitlab request
 * @param {FastifyInstance} fastify - Instance of Fastify
 * @param {IFastifyOptions} opt - Current Options
 * @return {Promise<void>}
 */
export default async function gitlabRoad(fastify: FastifyInstance, opt: IFastifyOptions): Promise<void> {
    let logger: ILogger;
    if (opt !== undefined) {
        if (opt.logger !== undefined) {
            logger = opt.logger;
        }
    }

    /**
     * Fetch the data of current user with oauth token
     * @param {FastifyRequest} req Current request
     * @param {IFastifyReply} res Reply request
     * @return {Promise<IFastifyReply>}
     */
    fastify.get('user/@me', async (req: FastifyRequest, res: IFastifyReply): Promise<IFastifyReply> => {
        try {
            // At this point check if token is provided if isn't provide no need to continue reply bad request
            const token = await CheckController.verifyToken<undefined>(logger, req, res, 'GITLAB');
            if (!token.result) {
                return token.req;
            }
            return gitlabController.fetchCurrentUser(token.req, res, logger);
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

    fastify.get('topics', async (req: FastifyRequest, res: IFastifyReply): Promise<IFastifyReply> => {
        try {
            const token = await CheckController.verifyToken<undefined>(logger, req, res, 'GITLAB');
            if (!token.result) {
                return token.req;
            }
            return gitlabController.fetchTopics(token.req, res, logger);
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
            }>(logger, req, res, 'GITLAB');
            if (!token.result) {
                return token.req;
            }
            return gitlabController.searchBy(token.req, res, logger);
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
            }>(logger, req, res, 'GITLAB');
            if (!token.result) {
                return token.req;
            }

            return gitlabController.findIssuesBy(token.req, res, logger);
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
