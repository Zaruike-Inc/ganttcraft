import React, {useEffect, useState} from "react";
import ProjectOverview from "#/client/ProjectOverview/ProjectOverview";
import PPCStyle from "#/client/ProjectPageClient.module.css";
import {Gantt, Task, ViewMode} from "gantt-task-react";
import TaskListHeader from "#/client/Gantt/TaskListHeader/TaskListHeader";
import TaskListTable from "#/client/Gantt/TaskListTable/TaskListTable";
import TooltipContentTask from "#/client/Gantt/TooltipContentTask/TooltipContentTask";
import {IProjectWithIssues} from "#types/gateway/ITransformer";
import {TaskType} from "gantt-task-react/dist/types/public-types";

interface Props {
    viewMode: ViewMode;
    currentHeight: number;
    showCell: boolean,
    projectData: IProjectWithIssues | undefined
    currentMode: 'PROJECT' | 'GROUP'

    handleOpenIssue(task: Task): void;

    setShowCell(show: boolean): void;

    setViewMode(mode: ViewMode): void;
}

const ProjectGanttView = (
    {
        currentMode,
        handleOpenIssue,
        setViewMode,
        currentHeight,
        showCell,
        setShowCell,
        viewMode,
        projectData
    }: Props
): React.JSX.Element => {
    const [tasks, setTasks] = useState<Task[]>([]);
    /**
     * Move this part to helper maybe for better visibility
     * @param {IProjectWithIssues} parseData - Current data
     * @return {void}
     */
    const handleParseProjectData = (parseData: IProjectWithIssues): void => {
        let tempoIssues: Task[] = [];
        const {
            issues,
            name,
            startProjectAt,
            endProjectAt,
            haveMilestone,
            milestones,
            webUrl,
            id
        } = parseData;
        // Défault task at this moment
        tempoIssues = [{
            name,
            // project: name,
            type: 'project' as TaskType,
            end: new Date(endProjectAt),
            start: new Date(startProjectAt),
            id: `project-${name}-0`,
            progress: 0,
            project: `project-${name}-0`,
            isDisabled: false,
            hideChildren: false,
            displayOrder: 1,
            link: webUrl
        }];

        tempoIssues = [...tempoIssues, ...issues.map((e) => {
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
        // apply the reorder for prevent milestone to be at the end
        setTasks(tempoIssues.sort(function (a, b) {
            if (a.start < b.start) {
                return -1;
            }
            if (a.start > b.start) {
                return 1;
            }
            return 0;
        }))
    }

    useEffect(() => {
        if (projectData !== undefined && projectData !== null) {
            handleParseProjectData(projectData);
        }
    }, [projectData]);
    return <>
        <ProjectOverview
            currentMode={currentMode}
            project={projectData}
            setShowCell={setShowCell}
            showCell={showCell}
            setViewMode={setViewMode}
        />
        <div className={PPCStyle.containerGantt}>
            {tasks.length > 0 && <Gantt
                TaskListHeader={TaskListHeader}
                TaskListTable={TaskListTable}
                ganttWidth={currentHeight}
                // auto height if lower to 8 tasks cause is no need to have a scroll at 3km after element
                ganttHeight={tasks.length >= 8 ? 400 : undefined}
                endStepsCount={7}
                preStepsCount={1}
                TooltipContent={(props) => TooltipContentTask({
                    ...props,
                    issues: projectData !== undefined && projectData !== null ? projectData.issues : []
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
export default ProjectGanttView;
