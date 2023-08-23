export interface IObjectKeys {
    [key: string]: string | undefined;
}

/**
 * Implements new methods compared to the native console
 * @extends Console
 */
export default interface IConsole extends Omit<Console, 'draft'> {
    draft: (info: string | undefined) => string;
}

export interface ILogger {
    /**
     * Displays text with a desired time and format
     * @param {unknown} cmd - Content you want to display
     * @param {boolean|undefined} returnString [value=true] Display content in view
     * @return {string|void}
     **/
    cmds(cmd: unknown, returnString?: boolean): string | void;

    /**
     * Return a text with the color you want
     * @param {string} color - Color wish
     * @param {string} text - Text we want with our color
     * @return {string}
     */
    color(color: string, text: string): string;

    /**
     * Dynamically display information in a map graphically
     * @param {string|name} name - Field name
     * @param {string} text - Content you want to display
     * @return {Promise<string|void>}
     */
    draft(name: string | number, text: string): Promise<string | void>;

    /**
     * Stop looping information in console and return information to view
     * @param {string|number} name - Name to stop
     * @param {string} text - Text to display
     * @param {boolean} succeed - Returns whether the operation was successful or not
     */
    endDraft(name: string | number, text: string, succeed?: boolean): Promise<void>;

    /**
     * Displays an error on view
     * @param {unknown} err - Content you want to display
     * @param {boolean} returnString [value=true] Display content in view
     */
    error(err: unknown, returnString?: boolean): string | void;

    /**
     * Display info in view
     * @param {unknown} info - Content you want to display
     * @param {boolean} returnString [value=true] - Display content in view
     */
    info(
        info: string | boolean | number | Error,
        returnString?: boolean
    ): string | void;

    /**
     * Displays info in view, but in a different color
     * @param {unknown} info - Content you want to display
     * @param {boolean} returnString [value=true] - Display content in view
     * @return {string|void}
     */
    loading(info: unknown, returnString?: boolean): string | void;

    /**
     * Updates your map Attention this can cause some bug if the action is repeated
     * @param {string|number} name - name of the field to update
     * @param {string} text - Content to update
     * @return {Promise<string | void>}
     */
    updateDraft(name: string | number, text: string): Promise<string | void>;

    /**
     * Displays danger in sight
     * @param {unknown} warn - Content you want to display
     * @param {boolean} returnString [value=true] - Display content in view
     * @return {string | void}
     */
    warning(warn: unknown, returnString?: boolean): string | void;
}

/**
 * Parameter to put when instantiating the logger
 */
export interface LoggerOptions {
    devMod: boolean;
    name?: string;
}
