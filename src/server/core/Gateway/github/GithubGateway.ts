import BaseGateway from "#srv/core/Gateway/BaseGateway";
import IGithubGateway, {
    IGithubGroup,
    IGithubIssue, IGithubIssuesWithGroupProject, IGithubIssuesWithProject, IGithubMilestone,
    IGithubProject,
    IGithubRawUser,
    IGithubUser
} from "#types/gateway/IGithubGateway";
import {ILogger} from "#types/IConsole";
import clientProvider from "#utils/ClientProvider";
import {isNotNull} from "#utils/Validator";
import {IGroup, IProject} from "#types/gateway/ITransformer";
import ProjectTransformer from "#srv/core/Gateway/transformer/ProjectTransformer";
import GroupTransformer from "#srv/core/Gateway/transformer/GroupTransformer";
import {TSearchType} from "#srv/core/Gateway/IGateway";
import GatewayError from "#srv/core/Error/GatewayError";

/**
 * All method for manipulate GitHub api
 */
export class GithubGateway extends BaseGateway implements IGithubGateway {
    private readonly logger: ILogger;
    private readonly baseUri: string = 'github.com';
    private readonly oauthToken: string;

    private readonly headers: {
        Accept: string,
        Authorization: string,
        // Current version used for this result
        "X-GitHub-Api-Version": string,
    }

    constructor(logger: ILogger, oauthToken: string) {
        super('GITHUB');
        this.logger = logger;
        this.oauthToken = oauthToken;
        this.headers = {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${this.oauthToken}`,
            "X-GitHub-Api-Version": "2022-11-28"
        }
    }

    async searchBy(type: string[], query: string): Promise<(IProject | IGroup)[]> {
        // Note: the empty query for GitHub is equal a bot for prevent that is better to return empty content here
        if (type.length === 0 || query.trim().length === 0) {
            return [];
        }

        let groups: IGroup[] = [];
        let projects: IProject[] = [];

        // fetch project part
        if (type.filter((e) => e === 'projects').length > 0) {
            const projectsSearch = await this.searchByProjects(query);
            if (typeof projectsSearch !== "boolean") {
                projects = new ProjectTransformer('GITHUB', projectsSearch).toString();
            }
        }
        // fetch the group part
        if (type.filter((e) => e === 'group').length > 0) {
            const groupsSearch = await this.searchByGroups(query);
            if (typeof groupsSearch !== 'boolean') {
                groups = new GroupTransformer('GITHUB', groupsSearch).toString();
            }
        }

        return [...projects, ...groups];
    }

    getURI(withAPI: boolean): string {
        if (withAPI) {
            return `https://api.${this.baseUri}`;
        }
        return `https://${this.baseUri}`;
    }

    async getCurrentUser(): Promise<IGithubUser | false> {
        return clientProvider<IGithubRawUser>(`${this.getURI(true)}/user`, {
            headers: this.headers
        }).then((rep) => {
            if (
                isNotNull(rep) &&
                isNotNull(rep.parseBody) &&
                typeof rep.parseBody !== "undefined" &&
                rep.status === 200
            ) {
                // eslint-disable-next-line camelcase
                const {id, login, avatar_url} = rep.parseBody;
                return {
                    id: id,
                    username: login,
                    // eslint-disable-next-line camelcase
                    avatar: avatar_url,
                    email: login
                };
            } else {
                return false;
            }
        }).catch((e) => {
            this.logger.error(e);
            return false;
        })
    }

    async searchByGroups(search: string = ''): Promise<boolean | IGithubGroup[]> {
        return clientProvider<{ items: IGithubGroup[] }>(
            // Force here search by orgs and not a user
            `${this.getURI(true)}/search/users?q=${encodeURIComponent(search)}+type:org`,
            {
                headers: this.headers,
            }, 'GET').then((rep) => {
            // TODO: maybe include error code 422 (ratelimit) and implement 404 not found
            if (
                isNotNull(rep) &&
                isNotNull(rep.parseBody) &&
                typeof rep.parseBody !== "undefined" &&
                rep.status === 200
            ) {
                return rep.parseBody.items;
            } else {
                return false;
            }
        }).catch(() => {
            return false
        })
    }

    async searchByProjects(search: string = ''): Promise<boolean | IGithubProject[]> {
        return clientProvider<{
            items: IGithubProject[]
        }>(
            `${this.getURI(true)}/search/repositories?${new URLSearchParams({per_page: '20', q: search})}`,
            {
                headers: this.headers,
            }, 'GET').then((rep) => {
            if (
                isNotNull(rep) &&
                isNotNull(rep.parseBody) &&
                typeof rep.parseBody !== "undefined" &&
                rep.status === 200
            ) {
                return rep.parseBody.items;
            } else {
                return false;
            }
        }).catch(() => {
            return false
        })
    }

    async fetchOneProject(nameWithPath: string): Promise<IGithubProject> {
        const baseURI = `${this.getURI(true)}/repos/${nameWithPath}`;
        return clientProvider<IGithubProject>(baseURI, {
            headers: this.headers
        }, 'GET', true).then(async (rep) => {
            if (rep.parseBody !== undefined) {
                if (rep.status === 200) {
                    return rep.parseBody as IGithubProject
                }
                if (rep.status === 404) {
                    return Promise.reject(new GatewayError('GITHUB', 'NOT_FOUND'));
                }
            }
            return Promise.reject(new GatewayError('GITHUB', 'INTERNAL_ERROR'));
        });
    }

    async fetchOneGroup(nameWithPath: string): Promise<IGithubGroup> {
        const baseURI = `${this.getURI(true)}/orgs/${nameWithPath}`;
        return clientProvider<IGithubGroup>(baseURI, {
            headers: this.headers
        }, 'GET', true).then(async (rep) => {
            if (rep.parseBody !== undefined) {
                if (rep.status === 200) {
                    return {
                        ...rep.parseBody,
                        projects: await this.findAllProjectByOrg(nameWithPath)
                    } as IGithubGroup;
                }
                if (rep.status === 404) {
                    return Promise.reject(new GatewayError('GITHUB', 'NOT_FOUND'));
                }
            }
            return Promise.reject(new GatewayError('GITHUB', 'INTERNAL_ERROR'));
        }).catch((e) => {
            return Promise.reject(new GatewayError('GITHUB', 'INTERNAL_ERROR', e as TypeError));
        })
    }

    /**
     * Find all repos here
     * @param {string} nameWithPath - Current name of repository
     * @return {Promise<IGithubProject[]>}
     * @private
     */
    private async findAllProjectByOrg(nameWithPath: string): Promise<IGithubProject[]> {
        const baseURI = `${this.getURI(true)}/orgs/${nameWithPath}/repos`;
        return clientProvider<IGithubProject[]>(baseURI, {
            headers: this.headers
        }, 'GET', true).then(async (rep) => {
            if (rep.parseBody !== undefined) {
                if (rep.status === 200) {
                    return rep.parseBody as IGithubProject[];
                }
                if (rep.status === 404) {
                    return Promise.reject(new GatewayError('GITHUB', 'NOT_FOUND'));
                }
            }
            return Promise.reject(new GatewayError('GITHUB', 'INTERNAL_ERROR'));
        }).catch((e) => {
            return Promise.reject(new GatewayError('GITHUB', 'INTERNAL_ERROR', e as TypeError));
        })
    }

    async findByName(type: 'PROJECT', name: string): Promise<IGithubProject>
    async findByName(type: 'GROUP', name: string): Promise<IGithubGroup>
    async findByName(type: TSearchType, name: string): Promise<IGithubGroup | IGithubProject> {
        if (type === 'PROJECT') {
            return await this.fetchOneProject(name);
        } else {
            return await this.fetchOneGroup(name);
        }
    }

    async findIssuesBy(
        type: TSearchType,
        name: string
    ): Promise<IGithubIssuesWithProject | IGithubIssuesWithGroupProject> {
        if (type === 'PROJECT') {
            const project = await this.findByName(type, name);
            // fetch all issues now
            return this.findIssuesByProjectId(project);
        } else {
            const groups = await this.findByName(type, name);
            const projectsWithIssues: IGithubIssuesWithProject[] = [];
            if (groups.projects !== undefined && groups.projects.length > 0) {
                for (let i = 0; i < groups.projects.length; i++) {
                    projectsWithIssues.push(await this.findIssuesByProjectId(groups.projects[i]))
                }
            }
            return {
                ...groups,
                projects: projectsWithIssues
            };
        }
    }

    /**
     * Find 100 lasted issues by the current repository
     * @param {IGithubProject} project - Current project
     * @return {Promise<IGithubIssuesWithProject>}
     * @private
     */
    private async findIssuesByProjectId(project: IGithubProject): Promise<IGithubIssuesWithProject> {
        return clientProvider<IGithubIssue[]>(
            // Found all 100 issues of current repo and fetch all state
            `${this.getURI(true)}/repos/${project.full_name}/issues?per_page=100&state=all&type:issue`,
            {
                headers: this.headers
            }, 'GET', true).then((rep) => {
            if (rep.parseBody !== undefined) {
                if (rep.status === 200) {
                    const issues = rep.parseBody as IGithubIssue[];
                    const uniqueMilestones = this.buildUniqueMilestoneTab(issues);
                    const content: IGithubIssuesWithProject = {
                        ...project,
                        issues,
                        haveMilestone: uniqueMilestones.length > 0,
                        milestones: uniqueMilestones
                    }
                    // return the datas here
                    return content;
                }
                if (rep.status === 404) {
                    return Promise.reject(new GatewayError('GITLAB', 'NOT_FOUND'));
                }
            }
            return Promise.reject(new GatewayError('GITLAB', 'INTERNAL_ERROR'));
        }).catch((e) => {
            return Promise.reject(new GatewayError('GITLAB', 'INTERNAL_ERROR', e as TypeError));
        })
    }

    /**
     * Create a tab of milestone and order the content by date
     * @param {IGithubIssue[]} issues - Current tab of issues
     * @return {IGithubMilestone[]}
     * @private
     */
    private buildUniqueMilestoneTab(issues: IGithubIssue[]): IGithubMilestone[] {
        // Extract the uniques IDS
        const milestonesNotUniques = issues
            .filter((e) => e.milestone !== undefined && e.milestone !== null)
            .map((p) => p.milestone) as IGithubMilestone[];
        const ids = milestonesNotUniques.map((m) => m.id)
        return milestonesNotUniques.filter(({id}, index) => !ids.includes(id, index + 1)).sort((a, b) => {
            return a.created_at < b.created_at ? -1 : 1
        })
    }
}
