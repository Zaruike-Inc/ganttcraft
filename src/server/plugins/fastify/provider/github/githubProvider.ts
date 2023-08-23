import {FastifyInstance, FastifyPluginAsync} from "fastify";
import {IGitPluginsOptions} from "#types/IPluginManager";
import oauthPlugin from '@fastify/oauth2';
import {IFastifyReply} from "#types/IFastify";
import jwt from "jsonwebtoken";
import {join} from "node:path";
import {readFileSync} from "node:fs";
import HTTPController from "#srv/Controller/HTTPController";
import {HTTPCodeError} from "#types/controller/IHttpController";
import HttpErrorController from "#srv/core/Error/HttpErrorController";
import {Router} from "#srv/core/Router";
import fp from "fastify-plugin";
import githubRoad from "./routes/githubRoad";

const githubProvider: FastifyPluginAsync<IGitPluginsOptions> = async (
    app: FastifyInstance,
    opt: IGitPluginsOptions
): Promise<void> => {
    await app.register(oauthPlugin, {
        name: 'githubOAuth2',
        scope: ['read:project', 'read:user', 'read:org'],
        credentials: {
            client: {
                id: opt.provider.clientId,
                secret: opt.provider.clientSecret
            },
            auth: oauthPlugin.GITHUB_CONFIGURATION
        },
        startRedirectPath: '/login',
        callbackUri: `${opt.provider.callbackDomain}/login/callback`
    });


    app.get('/login/callback', async function (req, res: IFastifyReply): Promise<IFastifyReply> {
        try {
            // @ts-ignore
            const {token}: IGitlabReplyToken = await app.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
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

    // register the classic road for manipulate this api :)
    await app.register((e: FastifyInstance) => Router(e, githubRoad, 'api/v1/', {logger: opt.logger}));
}

export default fp(githubProvider);
