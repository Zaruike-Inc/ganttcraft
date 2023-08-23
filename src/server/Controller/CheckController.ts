import {TProvider} from "#types/IPluginManager";
import {isNull} from "#utils/Validator";
import parseBodyItems from "#utils/parseBodyItems";
import {FastifyRequest} from "fastify";
import HTTPController from "./HTTPController";
import {readFileSync} from "fs";
import {join} from "path";
import {verify} from "jsonwebtoken";
import {HTTPCodeError} from "#types/controller/IHttpController";
import {GitlabGateway} from "#srv/core/Gateway/gitlab/GitlabGateway";
import {ILogger} from "#types/IConsole";
import {
    IFastifyReply,
    IFastifyRequestExtend,
    IFastifyRequestExtendGitea,
    IFastifyRequestExtendGithub,
    IFastifyRequestExtendGitlab,
    IFastifyRequestExtendBitbucket
} from "#types/IFastify";
import {
    IDecodedToken,
    TCheckDataWithGitea,
    TCheckDataWithGithub,
    TCheckDataWithGitlab,
    TCheckDataWithBitbucket
} from "#types/controller/ICheckController";
import {GithubGateway} from "#srv/core/Gateway/github/GithubGateway";

type TCheckDataWithProvider<T, P> =
    TCheckDataWithGitlab<T, P>
    | TCheckDataWithBitbucket<T, P>
    | TCheckDataWithGitea<T, P>
    | TCheckDataWithGithub<T, P>

class CheckController {
    async verifyToken<T, P = unknown>(
        logger: ILogger,
        req: FastifyRequest,
        res: IFastifyReply,
        provider: 'GITLAB',
        keys?: string[] | undefined
    ): Promise<TCheckDataWithGitlab<T, P>>
    async verifyToken<T, P = unknown>(
        logger: ILogger,
        req: FastifyRequest,
        res: IFastifyReply,
        provider: 'GITEA',
        keys?: string[] | undefined
    ): Promise<TCheckDataWithGitea<T, P>>
    async verifyToken<T, P = unknown>(
        logger: ILogger,
        req: FastifyRequest,
        res: IFastifyReply,
        provider: 'GITHUB',
        keys?: string[] | undefined
    ): Promise<TCheckDataWithGithub<T, P>>
    async verifyToken<T, P = unknown>(
        logger: ILogger,
        req: FastifyRequest,
        res: IFastifyReply,
        provider: 'BITBUCKET',
        keys?: string[] | undefined
    ): Promise<TCheckDataWithBitbucket<T, P>>
    async verifyToken<T, P = unknown>(
        logger: ILogger,
        req: FastifyRequest,
        res: IFastifyReply,
        provider: TProvider,
        keys?: string[] | undefined
    ): Promise<TCheckDataWithProvider<T, P>> {
        let token = req.headers['authorization'];
        let reqWithBody: FastifyRequest & { body: T };
        if (req.headers["content-type"] === 'application/json' || isNull(req.headers["content-type"])) {
            // force un cast ici pour éviter les incompatibilités
            reqWithBody = req as unknown as FastifyRequest & { body: T, params: P };
        } else {
            reqWithBody = await parseBodyItems<T, P>(req, false, keys);
        }

        return new Promise((resolve) => {
            if (!token) {
                return resolve({
                    req: HTTPController.response(res, "ERROR", HTTPCodeError.MISSING_TOKEN),
                    result: false
                })
            }
            if (token.length >= 7 && token.startsWith('Bearer ')) {
                token = token.slice(7, token.length);
                if (token.trim() === "null") {
                    return resolve({
                        req: HTTPController.response(res, "ERROR", HTTPCodeError.MALFORMED_TOKEN),
                        result: false
                    });
                } else {
                    const decodedBase = Buffer.from(token, 'base64').toString('utf-8');
                    const k = readFileSync(join(process.cwd(), 'src', 'server', 'keys', 'jwtES512.pem'));
                    return verify(decodedBase, k, {algorithms: ['ES512']}, (err, decoded) => {
                        if (err) {
                            return resolve({
                                req: HTTPController.response(res, "ERROR", HTTPCodeError.UNAUTHORIZED),
                                result: false
                            });
                        }

                        // Fetch the token clean
                        const deco = decoded as IDecodedToken;
                        // init the base of my var for implement the future type after
                        let reqA;
                        // Base of content
                        const baseItems: IFastifyRequestExtend<T, P> = {
                            ...req,
                            params: req.params as P,
                            body: reqWithBody.body
                        }
                        if (provider === 'GITLAB') {
                            reqA = {
                                ...baseItems,
                                gitGateway: new GitlabGateway(logger, deco.access_token)
                            } as IFastifyRequestExtendGitlab<T, P>;
                        } else if (provider === 'GITHUB') {
                            reqA = {
                                ...baseItems,
                                gitGateway: new GithubGateway(logger, deco.access_token)
                            } as unknown as IFastifyRequestExtendGithub<T, P>;
                        } else if (provider === 'BITBUCKET') {
                            reqA = {
                                ...baseItems,
                                gitGateway: new GitlabGateway(logger, deco.access_token)
                            } as IFastifyRequestExtendBitbucket<T, P>;
                        } else {
                            reqA = {
                                ...baseItems,
                                gitGateway: new GitlabGateway(logger, deco.access_token)
                            } as IFastifyRequestExtendGitea<T, P>;
                        }
                        /**
                         * Ignore the typing here cause not compatible between each gitGateway
                         * Or your need to implement generic method between each gateway
                         */
                        // @ts-ignore
                        return resolve({req: reqA, result: true});
                    });
                }
            } else {
                return resolve({
                    req: HTTPController.response(res, "ERROR", HTTPCodeError.MALFORMED_TOKEN),
                    result: false
                });
            }
        })
    }

    async fetchToken(url: string, res: IFastifyReply): Promise<{ req: IFastifyReply, result: false } | {
        result: true,
        token: string
    }> {
        return new Promise((resolve) => {
            const decodedBase = Buffer.from(url, 'base64').toString('utf-8');
            const k = readFileSync(join(process.cwd(), 'src', 'server', 'keys', 'jwtES512.pem'));
            return verify(decodedBase, k, {algorithms: ['ES512']}, (err, decoded) => {
                if (err) {
                    return resolve({
                        req: HTTPController.response(res, "ERROR", HTTPCodeError.UNAUTHORIZED),
                        result: false
                    });
                }

                // Fetch the token clean
                const deco = decoded as IDecodedToken;
                // init the base of my var for implement the future type after
                return resolve({token: deco.access_token, result: true});
            });
        })
    }
}

const checkController = new CheckController();
export default checkController;
