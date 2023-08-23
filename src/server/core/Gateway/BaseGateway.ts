
export default class BaseGateway {
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Base of instance of current file
     * @return {string}
     */
    toString(): string {
        return `[${this.name} GATEWAY]`;
    }
}
