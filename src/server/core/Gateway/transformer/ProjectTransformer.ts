import {TProvider} from "#types/IPluginManager";
import {IGitlabIssue, IGitlabIssuesWithProject, IGitlabProject} from "#types/gateway/IGitlabGateway";
import {IProject, IProjectWithIssues} from "#types/gateway/ITransformer";
import {IGithubIssue, IGithubIssuesWithProject, IGithubProject} from "#types/gateway/IGithubGateway";

export default class ProjectTransformer {
    private readonly datas;

    private readonly provider: TProvider;

    constructor(provider: TProvider, projectsDatas: IGitlabProject[] | IGitlabIssuesWithProject[] | IGithubProject[]) {
        this.provider = provider;
        this.datas = projectsDatas;

    }

    toString(): IProject[] {
        if (this.provider === 'GITLAB') {
            return (this.datas as IGitlabProject[]).map((e) => {
                return {
                    type: 'project',
                    id: e.id,
                    name: e.name,
                    nameWithNameSpace: e.name_with_namespace,
                    pathWithNameSpace: e.path_with_namespace,
                    startCount: e.start_count,
                    topics: e.topics,
                    visibility: e.visibility,
                    archived: e.archived,
                    webUrl: e.web_url
                }
            })
        } else if (this.provider === 'GITHUB') {
            return (this.datas as IGithubProject[]).map((p) => {
                return {
                    type: 'project',
                    id: p.id,
                    name: p.name,
                    visibility: p.private ? 'private' : 'public',
                    archived: false,
                    webUrl: p.html_url,
                    nameWithNameSpace: p.full_name,
                    startCount: p.stargazers_count,
                    pathWithNameSpace: p.full_name,
                    topics: p.topics
                }
            });
        } else {
            return [];
        }
    }

    /**
     * Fetch only the first one project for prepare the view with issue
     * @return {IProject|undefined}
     */
    toOneProject(): IProjectWithIssues | undefined {
        if (this.provider === 'GITLAB') {
            const p = this.datas[0] as IGitlabIssuesWithProject;
            const {startedAt, endedAt} = this.extractStartAndEndProject(p.issues, p.created_at);

            return {
                type: 'project',
                id: p.id,
                name: p.name,
                nameWithNameSpace: p.name_with_namespace,
                pathWithNameSpace: p.path_with_namespace,
                startCount: p.start_count,
                topics: p.topics,
                visibility: p.visibility,
                archived: p.archived,
                startProjectAt: startedAt,
                endProjectAt: endedAt,
                haveMilestone: p.haveMilestone,
                webUrl: p.web_url,
                milestones: p.milestones !== undefined && p.milestones !== null ? p.milestones.map((m) => {
                    return {
                        id: m.id,
                        groupId: m.groupe_id,
                        title: m.title,
                        dueDate: m.due_date ?? endedAt,
                        createdAt: m.created_at,
                        updatedAt: m.updated_at,
                        idd: m.iid,
                        webUrl: m.web_url,
                        deps: this.foundRefMilestone(p.issues, m.iid, p.id)
                    }
                }) : [],
                issues: p.issues
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((i) => {
                        return {
                            // internal ID not accessible by web
                            id: i.id,
                            // Id accessible for seen in web
                            iid: i.iid,
                            webUrl: i.web_url,
                            title: i.title,
                            description: i.description,
                            createdAt: this.findAt('start', i, i.created_at),
                            updatedAt: i.updated_at,
                            closedAt: this.findAt('end', i, endedAt),
                            author: {
                                id: i.author.id,
                                username: i.author.username,
                                avatarUrl: i.author.avatar_url,
                                webUrl: i.author.web_url
                            },
                            milestone: i.milestone !== null && i.milestone !== undefined ? {
                                id: i.milestone.id,
                                iid: i.milestone.iid,
                                title: i.milestone.title,
                                createdAt: i.milestone.created_at,
                                updatedAt: i.milestone.updated_at,
                                groupeId: i.milestone.groupe_id,
                                webUrl: i.milestone.web_url
                            } : null,
                            tasksCompletionStatus:
                                i.task_completion_status !== null && i.task_completion_status !== undefined &&
                                i.task_completion_status.count > 0 && i.task_completion_status.completed_count > 0 ?
                                    (i.task_completion_status.completed_count / i.task_completion_status.count * 100) :
                                    0,
                            // implement ref between other cards in safe mode (no need regex for that)
                            linksRefs: this.foundRef(p.issues, i.id, i.references, p.id),
                        }
                    })
            }
        } else if (this.provider === 'GITHUB') {
            const p = this.datas[0] as IGithubIssuesWithProject;
            const {startedAt, endedAt} = this.extractStartAndEndProject(p.issues, p.created_at);
            return {
                type: 'project',
                id: p.id,
                name: p.name,
                topics: p.topics,
                nameWithNameSpace: p.full_name,
                pathWithNameSpace: p.full_name,
                startCount: p.stargazers_count,
                visibility: p.private ? 'private' : 'public',
                archived: p.archived,
                startProjectAt: startedAt,
                endProjectAt: endedAt,
                haveMilestone: p.haveMilestone,
                webUrl: p.html_url,
                issues: p.issues.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((i) => {
                        return {
                            // internal ID not accessible by web
                            id: i.id,
                            // Id accessible for seen in web
                            iid: i.id,
                            webUrl: i.html_url,
                            title: i.title,
                            description: i.description,
                            createdAt: this.findAt('start', i, i.created_at),
                            updatedAt: i.updated_at,
                            closedAt: this.findAt('end', i, endedAt),
                            author: {
                                id: i.user.id,
                                username: i.user.login,
                                avatarUrl: i.user.avatar_url,
                                webUrl: i.user.html_url
                            },
                            milestone: i.milestone !== null && i.milestone !== undefined ? {
                                id: i.milestone.id,
                                iid: i.milestone.id,
                                title: i.milestone.title,
                                createdAt: i.milestone.created_at,
                                updatedAt: i.milestone.updated_at,
                                groupeId: i.milestone.id,
                                webUrl: i.milestone.html_url
                            } : null,
                            tasksCompletionStatus: 0,
                            // implement ref between other cards in safe mode (no need regex for that)
                            linksRefs: this.foundRef(p.issues, i.id, {
                                full: i.html_url,
                                short: `#${i.id}`
                            }, p.id),
                        }
                    }),
                milestones: [],
            }
        } else {
            return undefined;
        }
    }

    /**
     * Extract datas start and endDate for expose project in view
     * @param {IGitlabIssue[] | null} datas - Gitlab Issues
     * @param {string} fallbackCreatedAt - Date of repo created
     * @private
     * @return {{startedAt: string, endedAt: string}}
     */
    private extractStartAndEndProject(
        datas: IGitlabIssue[] | IGithubIssue[] | null,
        fallbackCreatedAt: string
    ): {
        startedAt: string;
        endedAt: string;
    } {
        if (!datas || datas.length === 0) {
            return {
                startedAt: fallbackCreatedAt,
                endedAt: new Date().toISOString()
            }
        }
        // Extrait ici les dates de créations ect...
        let allDates = [
            ...datas.map(project => new Date(project.created_at).getTime()),
            ...datas.map(project => new Date(project.updated_at as string).getTime()),
            ...(datas as IGithubIssue[])
                // note : filter doesn't support the multiple cast ... this is sad cause typing is correct
                .filter(project => project.closed_at !== null)
                .map(project => new Date(project.closed_at as string).getTime())
        ];

        if (this.provider === 'GITLAB') {
            // Only Gitlab support the due date
            allDates = [...allDates, ...(datas as IGitlabIssue[])
                .filter(project => project.due_date !== null)
                .map(project => new Date(project.due_date as string).getTime()),]
        }

        return {
            startedAt: new Date(Math.min(...allDates)).toISOString(),
            endedAt: new Date(Math.max(...allDates)).toISOString()
        }
    }

    private foundRef(
        issues: IGitlabIssue[] | IGithubIssue[],
        id: number,
        references: {
            short: string;
            relative?: string;
            full?: string
        },
        projectId: number
    ): string[] {
        const issuesParsed = (issues as IGitlabIssue[]).filter((e) => e.id !== id);
        const tabContent: string[] = [];
        if (issuesParsed.length > 0) {
            for (let i = 0; i < issuesParsed.length; i++) {
                const issue = issues[i];
                if (
                    issue.description !== undefined &&
                    issue.description !== null && (
                        issue.description.includes(references.short)
                        || (references.full !== undefined && issue.description.includes(references.full))
                        || (references.relative !== undefined && issue.description.includes(references.relative))
                    )
                ) {
                    tabContent.push(`issue-${projectId}-${issue.id}`);
                }
            }
        }

        return tabContent;
    }

    private foundRefMilestone(issues: IGitlabIssue[], milestoneId: number, projectId: number): string[] {
        return issues
            .filter((i) => i.milestone !== null && i.milestone !== undefined && i.milestone.iid === milestoneId)
            .map((e) => `issue-${projectId}-${e.iid}`);
    }

    /**
     * Find the theoretical date for one issues
     * you can choose the start or end
     * @param {string} period - Current start or end date
     * @param {IGitlabIssue} i - Current issue
     * @param {string} endedAt - Fallback date
     * @return {string}
     * @private
     */
    private findAt(period: 'start' | 'end', i: IGitlabIssue | IGithubIssue, endedAt: string): string {
        if (this.provider === 'GITLAB') {
            return this.findAtGitlab(period, i as IGitlabIssue, endedAt);
        } else {
            // classic provider
            if (period === 'end') {
                // Classic provider
                if (i.closed_at !== undefined && i.closed_at !== null) {
                    return i.closed_at;
                } else {
                    return endedAt;
                }
            } else {
                return i.created_at;
            }
        }
    }

    private findAtGitlab(period: 'start' | 'end', i: IGitlabIssue, endedAt: string): string {
        if (period === 'end') {
            if (i.due_date !== undefined && i.due_date !== null) {
                return i.due_date;
            } else if (i.closed_at !== undefined && i.closed_at !== null) {
                return i.closed_at;
            } else if (
                i.milestone !== undefined &&
                i.milestone !== null &&
                i.milestone.due_date !== undefined &&
                i.milestone.due_date !== null
            ) {
                return i.milestone.due_date;
            } else {
                return endedAt;
            }
        } else {
            if (i.start_date !== undefined && i.start_date !== null) {
                return i.start_date;
            } else {
                return i.created_at;
            }
        }
    }
}
