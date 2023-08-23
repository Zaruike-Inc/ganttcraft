import PluginManager from "#srv/core/PluginManager";
import {ILogger} from "#types/IConsole";
import {TProvider} from "#types/IPluginManager";
import Logger from "#utils/Logger";
import {isNotNull} from "#utils/Validator";
import fastifyServer, {FastifyInstance} from "fastify";
import {join} from "node:path";

export default class App {
    /**
     * Enabled or not the dev mode
     * @private
     */
    private readonly devMod: boolean;
    /**
     * Port of server
     * @private
     */
    private readonly port: string | number;
    /**
     * Current hostname
     * @private
     */
    private readonly hostname: string;
    /**
     * Plugin manager for load any fastify plugin or road here
     * @private
     */
    private readonly pluginManager: PluginManager;
    /**
     * @private
     * our logger to be able to have the information easily in console
     */
    private readonly logger: ILogger;
    /**
     * Current instance of fastify for server
     * @private
     */
    private readonly server: FastifyInstance;

    constructor() {
        this.devMod = process.env.NODE_ENV === 'development' || false;
        this.hostname = process.env.HOSTNAME || '0.0.0.0';
        this.logger = new Logger({
            name: isNotNull(process.env.NAME) ? process.env.NAME : 'GANTTCRAFT',
            devMod: this.devMod
        })
        this.port = process.env.PORT ?? 3081;
        this.server = fastifyServer({
            pluginTimeout: 80000,
            // the default is 100 update to 200 for oauth link
            maxParamLength: 200
        });
        // Plugins manager
        this.pluginManager = new PluginManager(
            this.logger,
            join(__dirname, 'server', 'plugins')
        );
    }


    async init(): Promise<void> {
        this.logger.info(`[WEB] Start the service`);
        this.logger.draft('startWeb1', '[WEB_CORE] Start the server');
        await this.pluginManager.autoImport({
            name: 'fastify',
            server: this.server,
            pluginsOptions: {
                port: parseInt(String(this.port), 10),
                hostname: this.hostname,
                provider: process.env.GIT_PROVIDER as TProvider
            }
        });
    }

    async start(): Promise<void> {
        this.server.listen({
            port: typeof this.port === 'string' ? parseInt(this.port, 10) : this.port,
            host: this.hostname,
            ipv6Only: false
        }, (err, address) => {
            if (err) {
                this.logger.endDraft('startWeb1', 'Fail to start the server', false);
                this.logger.error(err);
            }

            if (address !== undefined && address.length > 0) {
                // return the message to the view
                this.logger.endDraft(
                    'startWeb1',
                    /**
                     * Note: doesn't return localhost cause the priority is IPV6 is the support
                     * is enabled in your computer here the IPV6 will be disabled cause make trouble with next.js
                     */
                    `[WEB_CORE] ${address.includes('0.0.0.0') ? address.replace('0.0.0.0', '127.0.0.1') : address}`,
                    true,
                );
            }
        });
    }
}
