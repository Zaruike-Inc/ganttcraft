export type TSearchType = "PROJECT" | "GROUP";

export default interface IGateway {
    /**
     * Fetch the current URI of API
     * @param {boolean} withAPI - [default=false]
     */
    getURI(withAPI: boolean): string;
}
