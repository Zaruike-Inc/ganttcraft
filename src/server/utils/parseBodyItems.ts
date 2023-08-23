import {createWriteStream, mkdirSync, lstatSync} from "fs";
import * as util from "util";
import {pipeline} from "stream";
import os from 'os';
import {join} from "path";
import {FastifyRequest} from "fastify";
import {isNotNull} from '#utils/Validator';

const pump = util.promisify(pipeline);
const isDir = (dir: string): boolean => {
    try {
        return lstatSync(dir).isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}
/**
 * Instance de fichier que l'on renvoie
 */
export interface IFileBody {
    filename: string,
    encoding: string,
    mimetype: string,
    tmpFile: string;
}

/**
 * Parse le contenu du body avec les champs que l'on veut
 * @param {FastifyRequest} req - Instance de la requête
 * @param {boolean} ignoreFile [default=false] Ignore ou non les fichiers
 * @param {string[]} keys - Tableau de clés
 * @return {Promise}
 */
export default async function parseBodyItems<T, P>(
    req: FastifyRequest,
    ignoreFile: boolean = false,
    keys?: string[]
): Promise<FastifyRequest & { body: T, params: P }> {
    let restrict = false;
    if (isNotNull(keys)) {
        restrict = true;
    }
    const body = {} as { [key: string]: IFileBody | string }
    for await (const part of req.parts({
        limits: {
            // force la limite à 400MB ici
            fileSize: 1024 * 1024 * 400
        }
    })) {
        if ("file" in part && part.file) {
            // si on souhaite ignorer les fichiers, on ne fait rien ! (au niveau file)
            if (!ignoreFile) {
                /**
                 * Garantie l'unicité du fichier avec un timezone en plus pour éviter d'écraser
                 * les différents fichiers / dossiers
                 */
                const baseFileTmp = `${os.tmpdir()}/tmpFile-${new Date().getTime()}`;
                if (!isDir(baseFileTmp)) {
                    mkdirSync(baseFileTmp)
                }
                // créer notre fichier
                const tmpPath = join(baseFileTmp, part.filename);
                // si le mode restreint est actif
                if (restrict) {
                    // cas où la clé est trouvée sinon on l'ignore
                    if (keys !== undefined && keys.filter((e) => e === part.fieldname).length > 0) {
                        // créer notre stream de notre fichier ici
                        await pump(part.file, createWriteStream(tmpPath));

                        body[part.fieldname] = {
                            filename: part.filename,
                            encoding: part.encoding,
                            mimetype: part.mimetype,
                            tmpFile: tmpPath
                        }
                    }
                } else {
                    // créer notre stream de notre fichier ici
                    await pump(part.file, createWriteStream(tmpPath));

                    body[part.fieldname] = {
                        filename: part.filename,
                        encoding: part.encoding,
                        mimetype: part.mimetype,
                        tmpFile: tmpPath
                    }
                }
            }
        } else {
            // si le mode restreint est actif, on récupère seulement ce que l'on veut
            if (restrict) {
                // vérifie que le tableau de clé n'est pas vide
                if (keys !== undefined && keys.filter((e) => e === part.fieldname).length > 0) {
                    body[part.fieldname] = (part as { value: string }).value;
                }
            } else {
                // si le mode restreint n'est pas actif renvoie tous
                body[part.fieldname] = (part as { value: string }).value;
            }
        }
    }

    // eslint-disable-next-line no-param-reassign
    req.body = body as unknown as T;
    return req as unknown as FastifyRequest & { body: T, params: P };
}
