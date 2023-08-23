import {TProvider} from "#types/IPluginManager";
import {IGitlabGroup, IGitlabIssuesWithGroupProject} from "#types/gateway/IGitlabGateway";
import {IGroup, IGroupWithIssueProject, IProjectWithIssues} from "#types/gateway/ITransformer";
import ProjectTransformer from "#srv/core/Gateway/transformer/ProjectTransformer";
import {IGithubGroup, IGithubIssuesWithGroupProject} from "#types/gateway/IGithubGateway";

type TDatasGroupTransformer = IGitlabGroup[] | IGitlabIssuesWithGroupProject |
    IGithubIssuesWithGroupProject | IGithubGroup[];
export default class GroupTransformer {
    private readonly provider: TProvider;
    private readonly datas: TDatasGroupTransformer;

    /**
     * Current constructor for parsing the groups with project
     * @param {TProvider} provider
     * @param {TDatasGroupTransformer} datas - Current data to need parse
     */
    constructor(
        provider: TProvider,
        datas: TDatasGroupTransformer
    ) {
        this.provider = provider;
        this.datas = datas;
    }

    /**
     * No need to expose multiple project because i just want seen data of group at this moment
     * @return {IGroup[]}
     */
    toString(): IGroup[] {
        if (this.provider === 'GITLAB') {
            return (this.datas as IGitlabGroup[]).map((g) => {
                return {
                    id: g.id,
                    visibility: g.visibility,
                    type: 'group',
                    name: g.name,
                    nameWithNameSpace: g.full_name,
                    pathWithNameSpace: g.full_path,
                }
            })
        } else if (this.provider === 'GITHUB') {
            return (this.datas as IGithubGroup[]).map((g) => {
                return {
                    id: g.id,
                    visibility: 'public',
                    type: 'group',
                    name: g.login,
                    nameWithNameSpace: g.login,
                    pathWithNameSpace: g.login,
                }
            });
        } else {
            return [];
        }
    }

    toParseProject(): IGroupWithIssueProject | IGithubIssuesWithGroupProject | undefined {
        if (this.provider === 'GITLAB') {
            const g = this.datas as IGitlabIssuesWithGroupProject;
            return {
                id: g.id,
                visibility: g.visibility,
                type: 'group',
                name: g.name,
                nameWithNameSpace: g.full_name,
                pathWithNameSpace: g.full_path,
                projects: g.projects.map((p) => {
                    return new ProjectTransformer(this.provider, [p]).toOneProject() as IProjectWithIssues
                })
            }
        } else if (this.provider === 'GITHUB') {
            const g = this.datas as IGithubIssuesWithGroupProject;
            return {
                id: g.id,
                visibility: g.private ? 'private' : 'public',
                type: 'group',
                name: g.login,
                nameWithNameSpace: g.login,
                pathWithNameSpace: g.login,
                projects: g.projects.map((p) => {
                    return new ProjectTransformer(this.provider, [p]).toOneProject() as IProjectWithIssues
                })
            }
        } else {
            return undefined;
        }
    }
}
