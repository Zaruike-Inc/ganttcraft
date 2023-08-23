import IGateway, {TSearchType} from "#srv/core/Gateway/IGateway";
import {IGroup, IProject} from "#types/gateway/ITransformer";

export interface IGithubUser {
    username: string,
    id: number,
    email: string,
    avatar: string
}

export interface IGithubRawUser {
    login: string,
    id: number,
    node_id: string,
    avatar_url: string,
    gravatar_id: string,
    url: string,
    html_url: string,
    public_repos: number,
    public_gists: number
}

export interface IGithubProject {
    id: number,
    name: string,
    archived: boolean,
    full_name: string,
    private: boolean,
    html_url: string,
    description: string,
    created_at: string,
    updated_at: string,
    pushed_at: string,
    stargazers_count: number,
    topics: string[]
}

export interface IGithubMilestone {
    id: number,
    url: string,
    html_url: string,
    state: "open" | "close",
    title: string,
    description: string,
    created_at: string,
    updated_at: string,
    closed_at: string | null,
    due_on: string | null
}

export interface IGithubIssue {
    url: string,
    repository_url: string,
    html_url: string,
    id: number,
    number: number,
    title: string,
    state: "open" | 'close',
    locked: boolean,
    milestone: null | IGithubMilestone,
    created_at: string,
    updated_at: string,
    closed_at: string | null,
    user: IGithubRawUser
    description: string,
    label: string[],
    body: string
}

export interface IGithubIssuesWithProject extends IGithubProject {
    issues: IGithubIssue[]
    haveMilestone: boolean,
    milestones: IGithubMilestone[]
}

/**
 * Interface of raw data provide github api
 * Note: this interface doesn't regroup all data cause
 * you don't need list all useless data
 * @return {IGithubGroup}
 */
export interface IGithubGroup {
    id: number,
    private: boolean,
    login: string,
    created_at: string,
    updated_at: string,
    url: string,
    description: string | null,
    is_verified: boolean,
    has_organization_projects: boolean,
    has_repository_projects: boolean,
    html_url: string,
    archived_at: null,
    type: string,
    projects: IGithubProject[]
}

export interface IGithubIssuesWithGroupProject extends IGithubGroup {

}

export default interface IGithubGateway extends IGateway {
    getCurrentUser(): Promise<IGithubUser | false>;

    searchBy(type: string[], query: string): Promise<(IProject | IGroup)[]>;

    /**
     * Search by current type and search by query in same time
     * @param {TSearchType} type - Current type of search
     * @param {string} name - Current name search
     * @return {Promise<IGithubIssuesWithProject|IGithubIssuesWithGroupProject>}
     */
    findIssuesBy(type: TSearchType, name: string): Promise<IGithubIssuesWithProject | IGithubIssuesWithGroupProject>

    /**
     * Find one project by full name
     * @param {string} name - Current name
     * @return {Promise<IGithubProject>}
     */
    fetchOneProject(name: string): Promise<IGithubProject>

    // searchByProjects(search: string): Promise<void>;
    //
    // searchByGroups(search: string): Promise<void>;
}
