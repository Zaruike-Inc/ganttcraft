import {ILogger} from "./IConsole";
import {FastifyServer} from "./IFastify";

export type TProvider = 'GITLAB' | 'GITHUB' | 'BITBUCKET' | 'GITEA';
export type PLManagerType = 'fastify' | 'db' | 'other';

export interface IPluginOptions {
    port: number;
    hostname: string;
    provider: TProvider;
}

export interface IOptPLManager {
    name: PLManagerType;
    server?: FastifyServer;
    pluginsOptions: IPluginOptions;
}

export interface IGitPluginsOptions {
    logger: ILogger,
    provider: {
        host?: string,
        clientId: string,
        clientSecret: string,
        callbackDomain: string
    }
}
