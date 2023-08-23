import {IFastifyReply, IFastifyRequestExtendGitlab} from "#types/IFastify";
import {ILogger} from "#types/IConsole";
import HTTPController from "#srv/Controller/HTTPController";
import {HTTPCodeSuccess} from "#types/controller/IHttpController";
import TopicsTransformer from "#srv/core/Gateway/transformer/TopicsTransformer";
import GenericController from "#srv/core/Gateway/generic/GenericController";

/**
 * Custom method for gitlab endpoint
 * @extends GenericController
 */
class GitlabController extends GenericController {
    async fetchTopics(
        req: IFastifyRequestExtendGitlab<undefined>,
        res: IFastifyReply,
        logger: ILogger
    ): Promise<IFastifyReply> {
        const topicsList = await req.gitGateway.getTopics();
        // TODO: emit error when unable to fetch data
        return HTTPController.response(res, 'SUCCESS', HTTPCodeSuccess.OK, logger, [{
            key: 'topics',
            content: !topicsList ? [] : (new TopicsTransformer('GITLAB', topicsList)).toString()
        }])
    }

    async fetchProjects(
        req: IFastifyRequestExtendGitlab<undefined>,
        res: IFastifyReply,
        logger: ILogger
    ): Promise<IFastifyReply> {
        // logic here for fetch all projects of current user
        const repProjects = await req.gitGateway.searchByProjects('');
        return HTTPController.response(res, 'SUCCESS', HTTPCodeSuccess.OK, logger, [{
            key: 'projects',
            content: repProjects
        }]);
    }

}

const gitlabInstance = new GitlabController('GITLAB');
export default gitlabInstance;
