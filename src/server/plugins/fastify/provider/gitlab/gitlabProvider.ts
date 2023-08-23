import fp from "fastify-plugin";
import {IFastifyReply} from "#types/IFastify";
import {FastifyInstance, FastifyPluginAsync} from "fastify";
import oauthPlugin from '@fastify/oauth2';
import {isNotNull} from "#utils/Validator";
import {IGitPluginsOptions} from "#types/IPluginManager";
import {readFileSync} from "fs";
import {join} from "node:path";
import jwt from 'jsonwebtoken';
import HTTPController from "#srv/Controller/HTTPController";
import {HTTPCodeError} from "#types/controller/IHttpController";
import HttpErrorController from "#srv/core/Error/HttpErrorController";
import {Router} from '#srv/core/Router';
import gitlabRoad from "./routes/gitlabRoad";

interface IGitlabReplyToken {
    token: {
        access_token: string,
        token_type: 'Bearer',
        expires_in: number,
        refresh_token: string,
        scope: string,
        created_at: string,
        expires_at: string
    }
}

const defaultGitlabStrategy = {
    tokenHost: 'https://gitlab.com',
    tokenPath: '/oauth/token',
    authorizePath: '/oauth/authorize'

}
/**
 * Plugin for register the user and manipulate this api
 * @param {FastifyInstance} app
 * @param {IGitPluginsOptions} opt
 * @return {Promise<void>}
 */
const gitlabProvider: FastifyPluginAsync<IGitPluginsOptions> = async (
    app: FastifyInstance,
    opt: IGitPluginsOptions
): Promise<void> => {
    // Get the current domain can be gitlab.com or custom domain if self-hosted
    const baseDomain = isNotNull(opt.provider.host) && typeof opt.provider.host !== "undefined" ?
        opt.provider.host : defaultGitlabStrategy.tokenHost;
    /**
     * Gitlab Strategy is important for connect the user to this api
     */
    await app.register(oauthPlugin, {
        name: 'customOauth2',
        credentials: {
            client: {
                id: opt.provider.clientId,
                secret: opt.provider.clientSecret
            },
            auth: {
                authorizeHost: baseDomain,
                authorizePath: defaultGitlabStrategy.authorizePath,
                tokenHost: baseDomain,
                tokenPath: defaultGitlabStrategy.tokenPath
            }
        },
        startRedirectPath: '/login',
        callbackUri: `${opt.provider.callbackDomain}/login/callback`,
        scope: ['read_api', 'read_repository', 'read_user']
    });
    /**
     * Make cookie of user if working
     * Return error if token is invalid
     * @param {FastifyInstance} req - Current request
     * @param {IFastifyReply} res - Current response
     * @return {IFastifyReply}
     */
    app.get('/login/callback', async function (req, res: IFastifyReply): Promise<IFastifyReply> {
        try {
            // @ts-ignore
            const {token}: IGitlabReplyToken = await app.customOauth2.getAccessTokenFromAuthorizationCodeFlow(req);
            const k = readFileSync(join(process.cwd(), 'src', 'server', 'keys', 'jwtES512.pem'));
            // For a better security make a JWT token for prevent leak data ^^
            const tokenSign = jwt.sign({
                access_token: token.access_token
            }, k, {
                algorithm: 'ES512',
                expiresIn: "1d"
            });

            // Défine the time ou the current date with +4h for UTC
            const currentDate = new Date().setHours(new Date().getHours() + 4);
            // define the cookie for login
            res.setCookie('oauth', Buffer.from(tokenSign, 'utf-8').toString('base64'), {
                path: '/',
                sameSite: 'strict',
                signed: true,
                // maxAge: 7200,
                expires: new Date(currentDate),
                priority: 'high'
            });
            /**
             * Internal note :
             * IF isn't setup the JS for redirect the user this will be not working
             * cause Next.JS have isn't time to persist the cookie
             *
             * This will be make an infinite loop
             *
             * This code patch the loop and redirect the user to home page for prevent any error
             */
            return res.type('text/html').code(200).send(`<script>window.location.href = "/"</script>`);
        } catch (e) {
            // return error if is present
            return HTTPController.response(
                res,
                'ERROR_INTERNAL',
                HTTPCodeError.INTERNAL_ERROR,
                opt.logger,
                undefined,
                new HttpErrorController(req, e as TypeError)
            );
        }
    });

    // Register the classic road for manipulate this api :)
    await app.register((e: FastifyInstance) => Router(e, gitlabRoad, 'api/v1/', {
        logger: opt.logger
    }))
}

export default fp(gitlabProvider);
