import {
    IFastifyReply,
    TFastifyRequestExtendGeneric
} from "#types/IFastify";
import {ILogger} from "#types/IConsole";
import HTTPController from "#srv/Controller/HTTPController";
import {HTTPCodeError, HTTPCodeSuccess} from "#types/controller/IHttpController";
import {isNull} from "#utils/Validator";
import {jsonParser} from "#utils/jsonParser";
import {TProvider} from "#types/IPluginManager";
import ProjectTransformer from "#srv/core/Gateway/transformer/ProjectTransformer";
import {IGitlabIssuesWithGroupProject, IGitlabIssuesWithProject} from "#types/gateway/IGitlabGateway";
import GroupTransformer from "#srv/core/Gateway/transformer/GroupTransformer";
import GatewayError from "#srv/core/Error/GatewayError";
import HttpErrorController from "#srv/core/Error/HttpErrorController";
import {TSearchType} from "#srv/core/Gateway/IGateway";

/**
 * All road in commun with all provider
 */
export default class GenericController {
    private readonly provider: TProvider;

    /**
     * @constructor
     * @param {TProvider} provider - Current provider
     */
    constructor(provider: TProvider) {
        this.provider = provider;
    }

    /**
     * Fetch all information about the current user
     * @param {TFastifyRequestExtendGeneric<undefined>} req  - Current request with wrapper of Gitlab
     * @param {IFastifyReply} res - Return the current response
     * @param {ILogger} logger - Wrapper of console
     * @return {IFastifyReply}
     */
    async fetchCurrentUser(
        req: TFastifyRequestExtendGeneric<undefined>,
        res: IFastifyReply,
        logger: ILogger
    ): Promise<IFastifyReply> {
        const repUser = await req.gitGateway.getCurrentUser();
        if (!repUser) {
            // If the reply is invalid or internal error return this code
            return HTTPController.response(res, 'ERROR', HTTPCodeError.INVALID_TOKEN, logger, [{
                key: 'message',
                content: 'Token Invalid'
            }]);
        }
        // Return the response to the view
        return HTTPController.response(res, 'SUCCESS', HTTPCodeSuccess.OK, logger, [{
            key: 'user',
            content: repUser
        }]);
    }

    async searchBy(
        req: TFastifyRequestExtendGeneric<{ typeSearch: string, query: string }>,
        res: IFastifyReply,
        logger: ILogger
    ): Promise<IFastifyReply> {
        if (isNull(req.body)) {
            return HTTPController.response(res, 'ERROR', HTTPCodeError.MISSING_ARG, undefined, [{
                key: 'missing',
                content: ['typeSearch']
            }]);
        }

        /**
         * Note: the query here can be undefined this will be fine because you can fetch all project without query
         * At this moment the typeSearch need parsed for fetch datas
         */
        const {typeSearch, query} = req.body;
        const err = [];
        if (isNull(typeSearch)) {
            err.push('typeSearch');
        }

        const typeSearchParsed = jsonParser<string[]>(typeSearch, []);
        // Other param soon
        if (err.length > 0) {
            return HTTPController.response(res, 'ERROR', HTTPCodeError.MISSING_ARG, logger, [{
                key: 'missing',
                content: err
            }]);
        }
        // return the response with type of project
        return HTTPController.response(res, 'SUCCESS', HTTPCodeSuccess.OK, logger, [{
            key: 'projects',
            content: await req.gitGateway.searchBy(typeSearchParsed, query)
        }])
    }

    async findIssuesBy(
        req: TFastifyRequestExtendGeneric<{ type: TSearchType; name: string }>,
        res: IFastifyReply,
        logger: ILogger
    ): Promise<IFastifyReply> {
        if (isNull(req.body)) {
            return HTTPController.response(res, 'ERROR', HTTPCodeError.MISSING_ARG, logger, [{
                key: 'missing',
                content: ['type', 'name']
            }]);
        }
        const error = [];
        const {type, name} = req.body;
        if (isNull(type)) {
            error.push('type');
        }

        if (isNull(name)) {
            error.push('name');
        }

        if (error.length > 0) {
            return HTTPController.response(res, 'ERROR', HTTPCodeError.MISSING_ARG, logger, [{
                key: 'missing',
                content: error
            }]);
        }
        try {
            // logic here for fetch all projects of current user
            const repProjectsOrGroup = await req.gitGateway.findIssuesBy(type, name);
            logger.warning(repProjectsOrGroup);
            return HTTPController.response(res, 'SUCCESS', HTTPCodeSuccess.OK, logger, [{
                key: 'datas',
                content: type === 'PROJECT' ?
                    new ProjectTransformer(
                        this.provider,
                        [repProjectsOrGroup as IGitlabIssuesWithProject]
                    ).toOneProject() :
                    new GroupTransformer(
                        this.provider,
                        repProjectsOrGroup as IGitlabIssuesWithGroupProject
                    ).toParseProject()
            }]);
        } catch (e) {
            // Prevent problem with all gatewayError here
            if (e instanceof GatewayError) {
                if (e.currentErrorCode() === 'NOT_FOUND') {
                    return HTTPController.response(res, 'ERROR', HTTPCodeError.NOT_FOUND);
                } else {
                    // Normal error ?
                    return HTTPController.response(
                        res,
                        'ERROR_INTERNAL',
                        HTTPCodeError.INTERNAL_ERROR,
                        logger,
                        undefined,
                        new HttpErrorController(req, e as TypeError)
                    );
                }
            }
            return HTTPController.response(
                res,
                'ERROR_INTERNAL',
                HTTPCodeError.INTERNAL_ERROR,
                logger,
                undefined,
                new HttpErrorController(req, e as TypeError)
            );
        }
    }
}
