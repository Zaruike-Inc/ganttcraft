import {IncomingMessage, ServerResponse} from "node:http";
import {ILogger} from "#types/IConsole";
import {FastifyServer} from "#types/IFastify";
import {IPluginOptions, TProvider} from "#types/IPluginManager";
import nextServer from 'next';
import {loadWebpackHook} from "next/dist/server/config-utils.js";
import InstallErrorHandler from './installErrorHandler';
import providers from '../provider/index';
import {isNull} from "#utils/Validator";

export default class IndexMiddleWare {
    /**
     * Wrapper of console
     * @private
     */
    private readonly logger: ILogger;

    /**
     * @constructor
     * @param {ILogger} logger - Wrapper of console
     */
    constructor(logger: ILogger) {
        this.logger = logger;
    }

    /**
     * Permet d'afficher quel plugin est actif ou non dans l'application
     * @param {string} str - Plugin or message
     * @param {boolean} isEnabled [default=true] Enabled or not
     * @return {void}
     */
    message(str: string, isEnabled: boolean = true): void {
        if (isEnabled) {
            this.logger.info(`Plugin: ${str} [enabled]`);
        } else {
            this.logger.warning(`Plugin: ${str} [disabled]`);
        }
    }

    async register(server: FastifyServer, pluginsOptions: IPluginOptions): Promise<void> {
        const dev = process.env.NODE_ENV !== 'production';
        this.message('Error Handler');
        // register the error handler
        await server.register((e) => InstallErrorHandler(e, {logger: this.logger}));
        // register multipart for each request
        await server.register(import('@fastify/multipart'));
        if (isNull(process.env.COOKIE_SECRET)) {
            throw new TypeError(`Unable to find COOKIE_SECRET in env file must be define`);
        }
        this.message('COOKIE');
        await server.register(import('@fastify/cookie'), {secret: process.env.COOKIE_SECRET})
        // register CSRF only if enabled
        if (process.env.CSRF) {
            this.message('CSRF');
            // Todo: implement self logic here
        } else {
            this.message('CSRF', false);
        }

        // Enabled the compression is bad idea in prod
        if (process.env.COMPRESSION) {
            await server.register(import('@fastify/compress'));
            this.message('COMPRESSION');
            if (!dev) {
                this.logger.cmds(
                    `This is not recommended in PROD. Compression conflicts with NGINX or Apache server`
                )
            }
        }

        /**
         * Register the plugins type for Oauth and make request for the api of each git provider
         */
        await this.registerProvider(server, pluginsOptions.provider);
        // Register the server for next JS
        await server.register((fastify, _opts, next) => {
            const app = nextServer({
                dev: dev,
                hostname: pluginsOptions.hostname,
                port: pluginsOptions.port
            })
            /**
             * Patch WEBPACK configuration in custom server
             * BC SINCE NEXT.JS 13.1.1
             * Issue :
             * - https://github.com/vercel/next.js/issues/45255
             * - https://github.com/vercel/next.js/issues/45413
             * Need to place after the call with the server and before the handle request
             *
             * New BC of next 13.4.13 remove the argument in loadWebpackHook
             * - remove {init: true}
             */
            loadWebpackHook();
            const handle = app.getRequestHandler();

            app.prepare().then(() => {
                // In dev mode
                if (dev) {
                    // Only in dev
                    fastify.get('/_next/*',
                        async (req: { raw: IncomingMessage }, reply: { raw: ServerResponse, hijack(): void }) => {
                            await handle(req.raw, reply.raw);
                            reply.hijack();
                        }
                    )
                }
                // each request need to be to send to next.js after
                fastify.all(
                    '/*',
                    async (req: { raw: IncomingMessage }, reply: { raw: ServerResponse; hijack(): void }) => {
                        await handle(req.raw, reply.raw);
                        reply.hijack();
                    },
                );

                // en cas de page 404 ce que l'on renvoie à la vue
                fastify.setNotFoundHandler(
                    async (request: { raw: IncomingMessage }, reply: { raw: ServerResponse; hijack(): void }) => {
                        await app.render404(request.raw, reply.raw);
                        reply.hijack();
                    },
                );
                next();
            }).catch((err: Error) => {
                this.logger.error(err);
                return next(err);
            })
        })
    }

    /**
     * Register the plugin by the provider
     * @param {FastifyServer} server
     * @param {TProvider} provider - Current Provider selected
     * @return {Promise<void>}
     * @private
     */
    private async registerProvider(server: FastifyServer, provider: TProvider): Promise<void> {
        if (
            provider !== 'GITEA' &&
            provider !== 'GITHUB' &&
            provider !== 'GITLAB' &&
            provider !== 'BITBUCKET' ||
            !providers[provider]
        ) {
            throw new TypeError(`Invalid provider selected ${provider} expect GITEA, GITHUB, GITLAB or BITBUCKET`);
        }
        const clientId = process.env.GIT_CLIENT_ID;
        const clientSecret = process.env.GIT_CLIENT_SECRET;
        const callbackDomain = process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN;
        if (isNull(clientId) || typeof clientId === 'undefined') {
            throw new TypeError(`Missing GIT_CLIENT_ID property in env file`);
        }
        if (isNull(clientSecret) || typeof clientSecret === 'undefined') {
            throw new TypeError(`Missing GIT_CLIENT_SECRET property in env file`);
        }
        // URI of current domain for prevent infinite loop and redirect to correct domain
        if (isNull(callbackDomain) || typeof callbackDomain === 'undefined') {
            throw new TypeError(`Missing NEXT_PUBLIC_GIT_CALLBACK_DOMAIN property in env file`);
        }
        // register the road for oauth and register each road for the current git
        server.register(providers[provider], {
            logger: this.logger,
            provider: {
                host: process.env.NEXT_PUBLIC_GIT_HOST,
                clientId: clientId,
                clientSecret: clientSecret,
                callbackDomain
            }
        });
    }
}
