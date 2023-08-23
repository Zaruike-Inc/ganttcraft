import {existsSync, readFileSync} from 'node:fs';
import {IObjectKeys} from "#types/IConsole";

// eslint-disable-next-line max-len
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg

export default class EnvLoader {
    private readonly path: string;

    /**
     * @constructor EnvLoader
     * @param {string} path - Path to load for the desired configuration
     */
    constructor(path: string = process.cwd() + '/.env') {
        this.path = path;
    }

    /**
     * Parse our file with the information received
     * @param {string} streamSrc - File content
     * @return {IObjectKeys}
     * @private
     */
    private _parser(streamSrc: string): IObjectKeys {
        const obj = {} as IObjectKeys
        let lines = streamSrc.toString();
        // Convert line breaks to same format
        lines = lines.replace(/\r\n?/mg, '\n');
        let match;
        while ((match = LINE.exec(lines)) != null) {
            const key = match[1]
            // Default undefined or null to empty string
            let value = (match[2] || '')
            // Remove whitespace
            value = value.trim()
            // Check if double-quoted
            const maybeQuote = value[0]
            // Remove surrounding quotes
            value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')
            // Expand newlines if double-quoted
            if (maybeQuote === '"') {
                value = value.replace(/\\n/g, '\n')
                value = value.replace(/\\r/g, '\r')
            }
            // Add to our object the information
            obj[key] = value
        }
        return obj;
    }

    /**
     * Load our file on which we want to obtain the information in the ".env"
     * @param {boolean} override [default=true] Override the default variables from the ".env" file
     * @return {Promise<void>}
     */
    async loadFile(override: boolean = true): Promise<void> {
        // vérifie que le fichier existe bien
        if (existsSync(this.path)) {
            const parsedObj = this._parser(readFileSync(this.path, {encoding: 'utf-8'}));
            Object.keys(parsedObj).forEach((key) => {
                if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
                    process.env[key] = parsedObj[key];
                } else {
                    if (override) {
                        process.env[key] = parsedObj[key];
                    }
                }
            })
        } else {
            throw new Error(`The environment file is missing: ${this.path}`);
        }
    }
}
