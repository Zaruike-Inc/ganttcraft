import IGateway, {TSearchType} from "#srv/core/Gateway/IGateway";
import {IGroup, IProject, TProjectVisibility} from "#types/gateway/ITransformer";

export interface IGitlabRawUser {
    id: number;
    name: string;
    username: string;
    state: 'active' | 'deactivated' | 'banned';
    avatar_url: string;
    web_url: string;
    created_at: string,
    email: string
}

export interface IGitlabUser {
    id: number;
    username: string;
    email: string,
    name: string,
    avatar: string,
    url: string,
    // dedicated to user store not here
    token?: string
}

export interface IGitlabProject {
    id: number,
    description?: string,
    name: string,
    name_with_namespace: string,
    path: string,
    path_with_namespace: string,
    created_at: string,
    topics: string[],
    last_activity_at: string,
    start_count: number,
    visibility: TProjectVisibility,
    empty_repo: boolean,
    archived: boolean,
    web_url: string
}

export interface IGitlabIssuesWithProject extends IGitlabProject {
    issues: IGitlabIssue[],
    haveMilestone: boolean,
    milestones?: IGitlabMilestoneLight[]
}

export interface IGitlabMilestoneLight {
    id: number,
    iid: number,
    groupe_id: number,
    description?: string,
    title: string,
    created_at: string,
    updated_at: string,
    due_date?: string | null,
    start_date?: string,
    expired: boolean,
    web_url: string
}

export interface IGitlabIssue {
    id: number,
    start_date: string | null;
    iid: number,
    project_id: number,
    title: string,
    description?: string,
    state: 'closed' | 'opened',
    created_at: string,
    updated_at?: string,
    closed_at?: string,
    due_date: null | string,
    milestone?: IGitlabMilestoneLight,
    type: 'ISSUE',
    has_tasks: boolean,
    task_completion_status?: {
        count: number,
        completed_count: number
    },
    author: {
        id: number,
        username: string,
        name: string,
        avatar_url: string,
        web_url: string
    }
    references: {
        short: string,
        relative: string,
        full: string
    },
    web_url: string
}

export interface IGitlabGroup {
    id: number,
    name: string,
    web_url: string,
    path: string,
    visibility: TProjectVisibility,
    full_name: string,
    full_path: string,
    created_at: string,
    projects: IGitlabProject[]
}

export interface IGitlabIssuesWithGroupProject extends Omit<IGitlabGroup, 'projects'> {
    projects: IGitlabIssuesWithProject[]
}

/**
 * Generic Topics form for the user
 */
export interface IGitlabTopics extends Omit<IGitlabTopicsRaw, 'total_projects_count'> {
    totalProjectCounts: number
}


/**
 * Object from gitlab API
 * @return {IGitlabTopics}
 */
export interface IGitlabTopicsRaw {
    id: number,
    name: string,
    title: string,
    total_projects_count: number
}

export default interface IGitlabGateway extends IGateway {
    /**
     * Fetch all issues existing in current repo or group
     * @param {TSearchType} type - Current Type
     * @param name - Name of project (path)
     * @return {Promise<IGitlabIssuesWithProject>}
     * Each issues here can be provide group or from project
     *
     * TODO: Gitlab have TASKS in issues this isn't ready yet to expose in this api dont forgot to include that soon
     */
    findIssuesBy(type: TSearchType, name: string): Promise<IGitlabIssuesWithProject | IGitlabIssuesWithGroupProject>;

    /**
     * Fetch the current user by the Oauth token
     *
     * Return a boolean if the token is invalid
     * @return {Promise<IGitlabUser|boolean>}
     */
    getCurrentUser(): Promise<IGitlabUser | false>;

    /**
     * Fetch all topics can access by user
     * @return {Promise<IGitlabTopics[]|false>}
     */
    getTopics(): Promise<IGitlabTopicsRaw[] | false>;

    /**
     * Search By type of you want
     * Here using method of search project and group and other stuff at this point
     * @param type - Current search type
     * @param query - Current query
     */
    searchBy(type: string[], query: string): Promise<(IProject | IGroup)[]>

    searchByProjects(search: string): Promise<boolean | IGitlabProject[]>;

    searchByGroups(search: string): Promise<boolean | IGitlabGroup[]>;
}
