import React, {useEffect, useState} from "react";
import {Gantt, Task, ViewMode} from "gantt-task-react";
import {IGroupWithIssueProject, IProjectWithIssues} from "#types/gateway/ITransformer";
import ProjectOverview from "#/client/ProjectOverview/ProjectOverview";
import {TaskType} from "gantt-task-react/dist/types/public-types";
import PPCStyle from "#/client/ProjectPageClient.module.css";
import TaskListHeader from "#/client/Gantt/TaskListHeader/TaskListHeader";
import TaskListTable from "#/client/Gantt/TaskListTable/TaskListTable";
import TooltipContentTask from "#/client/Gantt/TooltipContentTask/TooltipContentTask";
import {MultiValue} from "react-select";

interface Props {
    viewMode: ViewMode;
    currentHeight: number;
    showCell: boolean,
    groupData: IGroupWithIssueProject | undefined
    currentMode: 'PROJECT' | 'GROUP'

    setShowCell(cell: boolean): void;

    handleOpenIssue(task: Task): void;

    setViewMode(mode: ViewMode): void;

}

const GroupGanttView = (
    {
        currentMode,
        setShowCell,
        groupData,
        setViewMode,
        viewMode,
        showCell,
        handleOpenIssue,
        currentHeight
    }: Props
): React.JSX.Element => {
    const [allFilterProject, setAllFilterProject] = useState<MultiValue<{
        label: string,
        value: string,
        project: {
            name: string,
            nameWithNameSpace: string
            pathWithNameSpace: string
        }
    }>>([]);
    const [filterProject, setFilterProject] = useState<MultiValue<{
        label: string,
        value: string,
        project?: {
            name: string,
            nameWithNameSpace: string
            pathWithNameSpace: string
        }
    }>>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    const handleSelectedProject = (selected: MultiValue<{
        label: string,
        value: string,
        project?: {
            name: string,
            nameWithNameSpace: string
            pathWithNameSpace: string
        }
    }>) => {
        setFilterProject(selected);
    }
    const handleParseProjectAndGroupData = (parseData: IGroupWithIssueProject): void => {
        let tempoIssues: Task[] = [];
        const {projects} = parseData;
        const tabId = filterProject.map((e) => parseInt(e.value, 10));
        for (let i = 0; i < projects.length; i++) {
            if (tabId.includes(projects[i].id)) {
                const {
                    issues,
                    name,
                    startProjectAt,
                    endProjectAt,
                    webUrl,
                    id,
                    milestones,
                    haveMilestone
                } = projects[i];
                // Défault task at this moment
                tempoIssues = [...tempoIssues, {
                    name,
                    // project: name,
                    type: 'project' as TaskType,
                    end: new Date(endProjectAt),
                    start: new Date(startProjectAt),
                    id: `project-${name}-${i}`,
                    progress: 0,
                    project: `project-${name}-${i}`,
                    isDisabled: false,
                    hideChildren: false,
                    // displayOrder: 1,
                    link: webUrl,
                    // issues:
                }, ...issues.map((e) => {
                    return {
                        start: new Date(e.createdAt),
                        end: e.closedAt !== undefined && e.closedAt !== null ?
                            new Date(e.closedAt) :
                            new Date(),
                        name: e.title,
                        id: `issue-${id}-${e.iid}`,
                        type: 'task' as TaskType,
                        isDisabled: true,
                        link: e.webUrl,
                        // dependencies: e.linksRefs,
                        project: `project-${name}-0`,
                        progress: parseInt(e.tasksCompletionStatus.toFixed(2), 10),
                    }
                }).sort(function (a, b) {
                    if (a.start < b.start) {
                        return -1;
                    }
                    if (a.start > b.start) {
                        return 1;
                    }
                    return 0;
                })];
                if (haveMilestone) {
                    tempoIssues = [...tempoIssues, ...milestones.map((m) => {
                        /**
                         * Note at this moment end date will be need to be same of start
                         * for correct output
                         */
                        return {
                            start: new Date(m.dueDate),
                            end: new Date(m.dueDate),
                            name: m.title,
                            id: `${name}-${m.title}`,
                            project: `project-${name}-0`,
                            isDisabled: true,
                            // displayOrder: tempoIssueLength + k,
                            progress: 0,
                            // table of each deps about issues or other stuff
                            dependencies: m.deps,
                            link: m.webUrl,
                            type: 'milestone' as TaskType
                        }
                    })]
                }
            }
        }


        // apply the reorder for prevent milestone to be at the end
        setTasks(tempoIssues)
    }

    useEffect(() => {
        if (groupData !== undefined && groupData !== null) {
            const allResults = groupData.projects.map((e) => {
                return {
                    label: e.name, value: `${e.id}`, project: {
                        name: e.name,
                        nameWithNameSpace: e.nameWithNameSpace,
                        pathWithNameSpace: e.pathWithNameSpace
                    }
                }
            })
            // in default load all project
            setFilterProject(allResults);
            setAllFilterProject(allResults);
        }
    }, [groupData]);

    useEffect(() => {
        if (groupData !== undefined && groupData !== null) {
            // parse project here
            handleParseProjectAndGroupData(groupData);
        }
    }, [groupData, filterProject]);

    return <>
        <ProjectOverview
            handleSelectProject={handleSelectedProject}
            allFilterProject={allFilterProject}
            filterProject={filterProject}
            currentMode={currentMode}
            project={groupData as unknown as IProjectWithIssues}
            setShowCell={setShowCell}
            showCell={showCell}
            setViewMode={setViewMode}
        />
        <div className={PPCStyle.containerGantt}>
            {tasks.length > 0 &&
                <Gantt
                    TaskListHeader={TaskListHeader}
                    TaskListTable={TaskListTable}
                    ganttWidth={currentHeight}
                    // auto height if lower to 8 tasks cause is no need to have a scroll at 3km after element
                    ganttHeight={tasks.length >= 8 ? 400 : undefined}
                    endStepsCount={7}
                    preStepsCount={1}
                    TooltipContent={(props) => TooltipContentTask({
                        ...props,
                        issues: []
                    })}
                    fontFamily={'roboto'}
                    onDoubleClick={handleOpenIssue}
                    tasks={tasks}
                    // onClick={handleSelectItem}
                    listCellWidth={showCell ? '200px' : ''}
                    locale={Intl.DateTimeFormat().resolvedOptions().locale}
                    viewMode={viewMode}
                />}
        </div>
    </>
}

export default GroupGanttView;
