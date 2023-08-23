import {lstatSync} from "node:fs";
import {join} from "node:path";
import {ILogger} from "#types/IConsole";
import IndexMiddleWare from "#srv/plugins/fastify/middleware";
import {FastifyServer} from "#types/IFastify";
import {IOptPLManager, IPluginOptions} from "#types/IPluginManager";

export default class PluginManager {
    // Charge notre logger en natif
    private readonly _logger: ILogger;
    // dossier contenant nos plugins
    private readonly dirPl: string;

    /**
     * @constructor
     * @param {ILogger} logger - Wrapper de notre logger
     * @param {string} dirPl - Dossier de nos plugins
     */
    constructor(logger: ILogger, dirPl: string) {
        this._logger = logger;
        this.dirPl = dirPl;
        // vérifie que le dossier existe bien
        if (!this.dirPl) {
            throw new TypeError(`Le dossier ${this.dirPl} n'existe pas...`);
        }
    }

    /**
     * Méthode permettant d'appeler nos importations automatiquement...
     * @param {IOptPLManager} opt - Options courant
     * @return {Promise<void>}
     */
    autoImport = async (opt: IOptPLManager): Promise<void> => {
        if (typeof opt.server !== "undefined") {
            /**
             * Charge les routes que nous utiliserons par la suite
             * On vérifie de force si le serveur existe même si on l'a déjà passé en paramètres par défaut
             */
            await this._loadPluginsFastify(opt.server, opt.pluginsOptions);
        }
    }

    /**
     * Charge les plugins liée à fastify en automatique qu'ils soient custom ou non
     * @param {FastifyServer} server - Instance de fastify
     * @param {IPluginOptions} pluginsOptions - Options de nos différents plugins
     * @return {Promise<void>}
     */
    private _loadPluginsFastify = async (server: FastifyServer, pluginsOptions: IPluginOptions): Promise<void> => {
        const dirMiddleware = join(this.dirPl, 'fastify', 'middleware');
        if (!this.isDir(dirMiddleware)) {
            throw new TypeError(`Impossible de charger le dossier ${dirMiddleware}, car il n'existe pas...`);
        }
        // On n'a pas le choix de passer par un dossier relatif donc on force un peu autrement ...
        const indexMiddleWare = new IndexMiddleWare(this._logger);
        // enregistre notre route
        await indexMiddleWare.register(server, pluginsOptions);
    }

    /**
     * Méthode permettant de vérifier si le dossier existe ou non en méthode synchrone
     * @param {string} dir - Chemin à vérifier
     * @return {boolean}
     */
    isDir = (dir: string): boolean => {
        try {
            return lstatSync(dir).isDirectory();
        } catch (e) {
            // lstatSync throws an error if path doesn't exist
            return false;
        }
    }
}
