import {FastifyInstance, FastifyRegisterOptions, FastifyReply, FastifyRequest} from "fastify";
import {ILogger} from "./IConsole";
import {GitlabGateway} from "#srv/core/Gateway/gitlab/GitlabGateway";
import IGitlabGateway from "#types/gateway/IGitlabGateway";
import IGithubGateway from "#types/gateway/IGithubGateway";

export interface IFastifyOptions extends FastifyRegisterOptions<any> {
    logger?: ILogger;
}

export type FastifyServer = FastifyInstance;

/**
 * Interface managing methods extended to Fastify
 * @extends FastifyReply
 * @return {IFastifyReply}
 */
export interface IFastifyReply extends FastifyReply {
    /**
     * Define the code to return to the view
     * @param {number} code - Code we want to display
     * @return IFastifyReply
     */
    code(code: number): IFastifyReply;

    /**
     * Returns to the view the answer that we want
     * @return IFastifyReply
     */
    send(content: unknown): IFastifyReply;
}

export interface IFastifyRequestExtend<T, P = unknown> extends FastifyRequest {
    body: T,
    params: P
}

export interface IFastifyRequestExtendGithub<T, P = unknown> extends IFastifyRequestExtend<T, P> {
    gitGateway: IGithubGateway
}

export interface IFastifyRequestExtendGitlab<T, P = unknown> extends IFastifyRequestExtend<T, P> {
    gitGateway: IGitlabGateway
}

export interface IFastifyRequestExtendBitbucket<T, P = unknown> extends IFastifyRequestExtend<T, P> {
    gitGateway: GitlabGateway
}

export interface IFastifyRequestExtendGitea<T, P = unknown> extends IFastifyRequestExtend<T, P> {
    gitGateway: GitlabGateway
}

export type TFastifyRequestExtendGeneric<T, P = unknown> =
    IFastifyRequestExtendGithub<T, P>
    | IFastifyRequestExtendGitea<T, P>
    | IFastifyRequestExtendGitlab<T, P>
    | IFastifyRequestExtendBitbucket<T, P>
