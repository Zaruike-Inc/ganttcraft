import IConsole, {ILogger, IObjectKeys, LoggerOptions} from "#types/IConsole";
import util from "util";
import {sleep} from "#utils/Sleep";
import draftLog from 'draftlog';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const consoleF: IConsole = console as unknown as IConsole;
// Implement logic into the console
draftLog.into(console);

export default class Logger implements ILogger {
    private drafts: Map<string | number,
        {
            spinning: boolean | number;
            text: string;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            draft: (value: string | void) => string;
        }>;
    private _devMod: boolean;
    private readonly _projectName: string;
    private readonly _colors: IObjectKeys = {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
    };

    constructor(options: LoggerOptions) {
        this._devMod = options.devMod || false;
        this._projectName = options.name || 'STUDIT';
        this.drafts = new Map();
    }

    /**
     * update the map only value for change text
     * @param {string} name - nom du champ à update
     * @param {string} value - Valeur à attribuer
     */
    private _updateMap = async (name: string, value: string): Promise<Map<string | number,
        {
            spinning: boolean | number;
            text: string;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            draft: (_value: string | void) => string;
        }>> => {
        if (this.drafts.has(name)) {
            const k = this.drafts.get(name);
            if (k !== undefined) {
                k.text = value;
                k.spinning = true;
                await sleep(50);
                const clone = new Map(this.drafts).set(name, k);
                await sleep(50);
                this.drafts = clone;
            }
        }
        return this.drafts;
    };

    public color(color: string, text: string): string {
        if (this._colors.hasOwnProperty(color)) {
            return `${this._colors[color]}${text}\x1b[0m`;
        } else {
            return `${text}\x1b[0m`;
        }
    }

    loading(load: unknown, returnString?: boolean): string | void {
        const log = `[${this.color('magenta', this._projectName)}][${
            this.color('magenta', Date().toString().split(' ').slice(1, 5).join(' '))
        }] ${
            typeof load === 'string' ? load : util.inspect(load)
        }`;
        if (returnString) {
            return log;
        }
        console.log(log);
    }

    cmds(cmd: unknown, returnString?: boolean): string | void {
        const log = `[${this.color('cyan', this._projectName)}][${
            this.color('cyan', Date().toString().split(' ').slice(1, 5).join(' '))
        }] ${
            typeof cmd === 'string' ? cmd : util.inspect(cmd)
        }`;
        if (returnString) {
            return log;
        }
        console.log(log);
    }

    error(err: unknown, returnString?: boolean): string | void {
        const log = `[${this.color('red', this._projectName)}][${this.color(
            'red',
            Date().toString().split(' ').slice(1, 5).join(' '))
        }] ${
            typeof err === 'string' ? err : util.inspect(err)
        }`;
        if (returnString) {
            return log;
        }
        console.log(log);
    }

    warning(warn: unknown, returnString?: boolean): string | void {
        const log = `[${this.color('yellow', this._projectName)}][${this.color(
            'yellow',
            Date().toString().split(' ').slice(1, 5).join(' '))
        }] ${
            typeof warn === 'string' ? warn : util.inspect(warn)
        }`;
        if (returnString) {
            return log;
        }
        console.log(log);
    }

    info(info: unknown, returnString?: boolean): string | undefined {
        const log = `[${this.color('green', this._projectName)}][${this.color(
            'green',
            Date().toString().split(' ').slice(1, 5).join(' '),
        )}] ${typeof info === 'string' ? info : util.inspect(info)}`;
        if (returnString) {
            return log;
        }
        console.log(log);
    }

    async draft(name: string | number, text: string): Promise<string | void> {
        if (!process.stderr.isTTY) {
            return this.info(text);
        }
        this.drafts.set(name, {
            spinning: true,
            text,
            draft: consoleF.draft(this.info(`${frames[0]} ${this.drafts.get(name)?.text}`, true)) as unknown as (
                value: string | void,
            ) => string,
        });
        if (this.drafts.get(name) !== undefined && this.drafts.get(name) !== null) {
            for (let i = 0; Number(this?.drafts?.get(name)?.spinning); i++) {
                await sleep(50);
                this?.drafts
                    ?.get(name)
                    ?.draft(this.info(`${frames[i % frames.length]} ${this.drafts.get(name)?.text}`, true));
            }
        }
    }

    async updateDraft(name: string | number, text: string): Promise<string | void> {
        if (!process.stderr.isTTY) {
            return this.info(text);
        }
        await this._updateMap(String(name), text);
    }

    async endDraft(name: string | number, text: string, succeed = true): Promise<void> {
        if (this.drafts !== null && this.drafts.get(name) !== null && this.drafts.get(name)?.spinning !== undefined) {
            const dr = this.drafts.get(name) as unknown as { spinning: boolean };
            dr.spinning = false;
        }
        await sleep(50);
        this?.drafts?.get(name)?.draft(this[succeed ? 'info' : 'error'](`${succeed ? '✔' : '✖'} ${text}`, true));
        this.drafts.delete(name);
    }
}
