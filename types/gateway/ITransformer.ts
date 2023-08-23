export interface ITopics {
    id: number,
    name: string,
    slug: string,
    totalProjectsCount: number
}

export type TProjectVisibility = 'private' | 'internal' | 'public';

export interface IGroupOrProject extends Omit<IProject, 'type'> {
    type: 'project' | 'group'
}

export interface IGroup {
    type: 'group',
    id: number,
    visibility: TProjectVisibility,
    name: string,
    nameWithNameSpace: string,
    pathWithNameSpace: string,
}

export interface IGroupWithIssueProject extends IGroup {
    projects: IProjectWithIssues[]
}

export interface IProject {
    type: 'project',
    id: number,
    name: string,
    nameWithNameSpace: string,
    pathWithNameSpace: string,
    topics: string[],
    startCount: number,
    visibility: TProjectVisibility,
    archived: boolean,
    webUrl: string
}

export interface IIssue {
    id: number,
    iid: number,
    title: string,
    description?: string,
    createdAt: string,
    updatedAt?: string,
    closedAt?: string,
    webUrl: string
    milestone?: {
        id: number,
        iid: number,
        title: string,
        createdAt: string,
        updatedAt?: string,
        webUrl: string
    } | null,
    author: {
        id: number,
        username: string,
        avatarUrl: string,
        webUrl: string
    },
    linksRefs: string[];
    tasksCompletionStatus: number,
}

export interface IMilestoneLight {
    id: number,
    title: string,
    groupId?: number,
    dueDate: string,
    createdAt: string,
    updatedAt?: string,
    idd: number,
    deps: string[],
    webUrl: string
}

export interface IProjectWithIssues extends IProject {
    startProjectAt: string,
    endProjectAt: string
    issues: IIssue[],
    milestones: IMilestoneLight[],
    haveMilestone: boolean
}
