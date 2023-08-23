import {ILogger} from "#types/IConsole";
import clientProvider from "#utils/ClientProvider";
import {isNotNull} from "#utils/Validator";
import BaseGateway from "../BaseGateway";
import IGitlabGateway, {
    IGitlabGroup, IGitlabIssue, IGitlabIssuesWithGroupProject, IGitlabIssuesWithProject, IGitlabMilestoneLight,
    IGitlabProject,
    IGitlabRawUser,
    IGitlabTopicsRaw,
    IGitlabUser
} from "#types/gateway/IGitlabGateway";
import ProjectTransformer from "#srv/core/Gateway/transformer/ProjectTransformer";
import {IGroup, IProject} from "#types/gateway/ITransformer";
import GroupTransformer from "#srv/core/Gateway/transformer/GroupTransformer";
import GatewayError from "#srv/core/Error/GatewayError";
import {TSearchType} from "#srv/core/Gateway/IGateway";

const defaultURI = 'https://gitlab.com/';


export class GitlabGateway extends BaseGateway implements IGitlabGateway {
    private readonly logger: ILogger;
    private readonly uri: string;
    private readonly oauthToken: string;
    private headers: {
        Authorization: string
    };

    /**
     * @constructor
     * @param {ILogger} logger - Wrapper of console
     * @param {string} oauthToken - OauthToken of user
     */
    constructor(logger: ILogger, oauthToken: string) {
        super('Gitlab');
        this.logger = logger;
        this.uri =
            isNotNull(process.env.NEXT_PUBLIC_GIT_HOST) && typeof process.env.NEXT_PUBLIC_GIT_HOST !== "undefined"
                ? process.env.NEXT_PUBLIC_GIT_HOST : defaultURI;
        this.oauthToken = oauthToken;
        this.headers = {
            Authorization: `Bearer ${this.oauthToken}`
        }
    }

    async getTopics(): Promise<false | IGitlabTopicsRaw[]> {
        return clientProvider<IGitlabTopicsRaw[]>(`${this.getURI(true)}/topics`, {
            headers: this.headers
        }).then((rep) => {
            if (
                isNotNull(rep) && isNotNull(rep.parseBody) &&
                typeof rep.parseBody !== "undefined" &&
                rep.status === 200
            ) {
                return rep.parseBody as IGitlabTopicsRaw[]
            }
            return false;
        }).catch(() => {
            return false;
        })
    }

    /**
     * Current URI of API
     * @param {boolean} withAPI - [default=false] Show the uri with the api or not
     * @return {string}
     */
    getURI(withAPI: boolean = false): string {
        if (withAPI) {
            return `${this.uri}/api/v4`;
        }
        return this.uri;
    }

    async findByName(type: 'PROJECT', name: string): Promise<IGitlabProject>
    async findByName(type: 'GROUP', name: string): Promise<IGitlabGroup>
    async findByName(type: TSearchType, name: string): Promise<IGitlabProject | IGitlabGroup> {
        if (type === 'PROJECT') {
            return await this.fetchOneProject(name);
        } else {
            return await this.fetchOneGroup(name);
        }
    }

    async findIssuesByProjectId(project: IGitlabProject) {
        return clientProvider<IGitlabIssue[]>(`${this.getURI(true)}/projects/${project.id}/issues?per_page=100`, {
            headers: this.headers
        }, 'GET', true).then((rep) => {
            if (rep.parseBody !== undefined) {
                if (rep.status === 200) {
                    const issues = rep.parseBody as IGitlabIssue[];
                    const uniqueMilestones = this.buildUniqueMilestoneTab(issues);
                    const content: IGitlabIssuesWithProject = {
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

    async findIssuesBy(
        type: TSearchType,
        name: string
    ): Promise<IGitlabIssuesWithProject | IGitlabIssuesWithGroupProject> {
        if (type === 'PROJECT') {
            // fetch the current project
            const project = await this.findByName(type, name);
            // fetch all issues now
            return this.findIssuesByProjectId(project);
        } else {
            const projectsWithIssues = [];
            // Groupe mode
            const group = await this.findByName(type, name);
            if (group.projects !== undefined && group.projects.length > 0) {
                for (let i = 0; i < group.projects.length; i++) {
                    projectsWithIssues.push(await this.findIssuesByProjectId(group.projects[i]));
                }
            }
            return {
                ...group,
                projects: projectsWithIssues
            };
        }
    }

    private buildUniqueMilestoneTab(issues: IGitlabIssue[]) {
        // Extract the uniques IDS
        const milestonesNotUniques = issues
            .filter((e) => e.milestone !== undefined && e.milestone !== null)
            .map((p) => p.milestone) as IGitlabMilestoneLight[];
        const ids = milestonesNotUniques.map((m) => m.id)
        return milestonesNotUniques.filter(({id}, index) => !ids.includes(id, index + 1)).sort((a, b) => {
            return a.created_at < b.created_at ? -1 : 1
        })
    }

    async fetchOneProject(
        nameOrID: string | number
    ): Promise<IGitlabProject> {
        let baseURI = `${this.getURI(true)}/projects/`;
        if (nameOrID.toString().startsWith('/')) {
            baseURI += `${encodeURIComponent(nameOrID)}`;
        } else {
            baseURI += `/${encodeURIComponent(nameOrID)}`
        }
        return clientProvider<IGitlabProject>(baseURI, {
            headers: this.headers
        }, 'GET', true).then(async (rep): Promise<IGitlabProject> => {
            if (rep.parseBody !== undefined) {
                if (rep.status === 200) {
                    return rep.parseBody as IGitlabProject
                }
                if (rep.status === 404) {
                    return Promise.reject(new GatewayError('GITLAB', 'NOT_FOUND'));
                }
            }
            return Promise.reject(new GatewayError('GITLAB', 'INTERNAL_ERROR'));
        });
    }

    async fetchOneGroup(
        nameOrID: string | number
    ): Promise<IGitlabGroup> {
        let baseURI = `${this.getURI(true)}/groups/`;
        if (nameOrID.toString().startsWith('/')) {
            baseURI += `${encodeURIComponent(nameOrID)}`;
        } else {
            baseURI += `/${encodeURIComponent(nameOrID)}`
        }
        return clientProvider<IGitlabGroup>(baseURI, {
            headers: this.headers
        }, 'GET', true).then((rep) => {
            if (rep.parseBody !== undefined) {
                if (rep.status === 200) {
                    return rep.parseBody as IGitlabGroup;
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

    async getCurrentUser(): Promise<IGitlabUser | false> {
        return clientProvider<IGitlabRawUser>(`${this.getURI(true)}/user`, {
            headers: this.headers
        }).then((rep) => {
            /**
             * Check if the response isn't null or undefined and check if this api reply a code 200 for valid user
             */
            if (
                isNotNull(rep) &&
                isNotNull(rep.parseBody) &&
                typeof rep.parseBody !== "undefined" &&
                rep.status === 200
            ) {
                // eslint-disable-next-line camelcase
                const {id, email, username, name, avatar_url, web_url} = rep.parseBody;
                return {
                    id,
                    email,
                    username,
                    name,
                    // eslint-disable-next-line camelcase
                    avatar: avatar_url,
                    // eslint-disable-next-line camelcase
                    url: web_url,
                } as IGitlabUser
            } else {
                return false;
            }
        }).catch(() => {
            // Error emit here
            return false;
        })
    }

    async searchBy(type: string[], query: string): Promise<(IProject | IGroup)[]> {
        if (type.length === 0) {
            return [];
        }

        let projects: IProject[] = [];
        let groups: IGroup[] = [];

        if (type.filter((e) => e === 'projects').length > 0) {
            const projectsSearch = await this.searchByProjects(query);
            if (typeof projectsSearch !== "boolean") {
                projects = new ProjectTransformer('GITLAB', projectsSearch).toString();
            }
        }
        if (type.filter((e) => e === 'group').length > 0) {
            const groupsSearch = await this.searchByGroups(query);
            if (typeof groupsSearch !== 'boolean') {
                groups = new GroupTransformer('GITLAB', groupsSearch).toString();
            }
        }

        return [...projects, ...groups];
    }

    /**
     * Search one or multiple project at this lvl
     *
     * Note don't use search endpoint in direct because you can't fetch the visibility
     * @param {string} search - [default=""] Project search
     * @return {Promise<boolean|IGitlabProject[]>}
     */
    async searchByProjects(search: string = ''): Promise<boolean | IGitlabProject[]> {
        let baseUri = `/projects`;
        let currentSearch = search;
        // Auto switch to groupe mode cause multiple lvl of layers
        if (search.includes('/')) {
            const searchSplit = search.split('/');
            currentSearch = searchSplit.pop() as string;
            const group = searchSplit.join('/');
            baseUri = `/groups/${encodeURI(group)}/search`;
        }
        const baseUriContent = `${this.getURI(true)}/${baseUri}?${
            new URLSearchParams({scope: 'projects', search: currentSearch})
        }`;
        return clientProvider<IGitlabProject[]>(`${baseUriContent}`, {
            headers: this.headers
        }, 'GET').then((rep) => {
            this.logger.error(rep);
            if (
                isNotNull(rep) &&
                isNotNull(rep.parseBody) &&
                typeof rep.parseBody !== "undefined" &&
                rep.status === 200
            ) {
                return rep.parseBody;
            } else {
                return false;
            }
        }).catch((e) => {
            console.log(e);
            return false
        })

    }

    async searchByGroups(search: string): Promise<boolean | IGitlabGroup[]> {
        const baseUriContent = `${this.getURI(true)}/groups?${new URLSearchParams({search: search})}`;
        return clientProvider<IGitlabGroup[]>(`${baseUriContent}`, {
            headers: this.headers
        }, 'GET').then((rep) => {
            this.logger.error(rep);
            if (
                isNotNull(rep) &&
                isNotNull(rep.parseBody) &&
                typeof rep.parseBody !== "undefined" &&
                rep.status === 200
            ) {
                return rep.parseBody;
            } else {
                return false;
            }
        }).catch((e) => {
            console.log(e);
            return false
        })
    }
}
