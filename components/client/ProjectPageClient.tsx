'use client'
import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../hook/hooks";
import Loading from "../../app/loading";
import {useRouter} from "next/navigation";
import {authenticateUser} from "../../store/reducer/userReducer";
import {IGitlabUser} from "#types/gateway/IGitlabGateway";
import {useSearchParams} from "next/dist/client/components/navigation";
import clientProvider from "#utils/ClientProvider";
import {Task, ViewMode} from 'gantt-task-react';
import {IGroupWithIssueProject, IProjectWithIssues} from "#types/gateway/ITransformer";
import 'gantt-task-react/dist/index.css';
import ProjectGanttView from "#/client/ProjectGanttView/ProjectGanttView";
import GroupGanttView from "#/client/GroupGanttView/GroupGanttView";

interface Props {
    data: { valid: boolean, user?: IGitlabUser }
}

const ProjectPageClient = ({data}: Props): React.JSX.Element => {
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
    const [projectData, setProjectData] = useState<IProjectWithIssues>();
    const [groupData, setGroupData] = useState<IGroupWithIssueProject>();
    const [currentHeight, setCurrentHeight] = useState<number>(1000)
    // Hide or show all cells :)
    const [showCell, setShowCell] = useState<boolean>(true);
    const [currentMode, setCurrentMode] = useState<'PROJECT' | 'GROUP'>('PROJECT');
    const user = useAppSelector((s) => s.user);
    const dispatch = useAppDispatch();
    const Router = useRouter();
    const params = useSearchParams();
    useEffect(() => {
        if (data.valid && data.user !== undefined) {
            // authenticate the user
            dispatch(authenticateUser(data.user));
        } else {
            // if user isn't connected or session is expired for to reconnect
            Router.push('/login');
        }
    }, [data]);


    useEffect(() => {
        if (user && user.token) {
            const projectParam = params.get('project');
            const groupParam = params.get('group');
            if (projectParam !== undefined && projectParam !== null) {
                setCurrentMode('PROJECT');
                clientProvider<{ datas: IProjectWithIssues }>(
                    `${process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN}/api/v1/issues`,
                    {
                        headers: {Authorization: `Bearer ${user.token}`},
                        body: {
                            name: projectParam,
                            type: currentMode
                        }
                    }, 'POST', true).then((rep) => {
                    if (rep !== undefined && rep !== null) {
                        if (rep.parseBody !== undefined && rep.status === 200) {
                            setProjectData(rep.parseBody.datas);
                        }
                    }
                })
            } else if (groupParam !== null && groupParam !== undefined) {
                setCurrentMode('GROUP')
                clientProvider<{ datas: IGroupWithIssueProject }>(
                    `${process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN}/api/v1/issues`,
                    {
                        headers: {Authorization: `Bearer ${user.token}`},
                        body: {
                            name: groupParam,
                            type: 'GROUP'
                        }
                    }, 'POST', true).then((rep) => {
                    if (rep !== undefined && rep !== null) {
                        if (rep.parseBody !== undefined && rep.status === 200) {
                            setGroupData(rep.parseBody.datas)
                        }
                    }
                })
            } else {
                // Todo : return to the view error with missing params
            }
        }
    }, [params, user]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentHeight(window.innerWidth);
        }
    }, [typeof window !== "undefined"]);

    /**
     * Open this issue in view mode
     * @param {Task} task Current task selected
     * @return {void}
     */
    const handleOpenIssue = (task: Task): void => {
        // fetch the current URI of your host
        if (task.link !== undefined && task.link !== null) {
            window.open(task.link, "_blank");
        }
    }

    if (!user) {
        return <Loading/>
    }

    return <div>
        {currentMode === 'PROJECT' &&
            <ProjectGanttView
                currentMode={currentMode}
                setShowCell={setShowCell}
                projectData={projectData}
                showCell={showCell}
                currentHeight={currentHeight}
                handleOpenIssue={handleOpenIssue}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />
        }
        {currentMode === 'GROUP' && <GroupGanttView
            currentMode={currentMode}
            setShowCell={setShowCell}
            groupData={groupData}
            showCell={showCell}
            currentHeight={currentHeight}
            handleOpenIssue={handleOpenIssue}
            viewMode={viewMode}
            setViewMode={setViewMode}
        />}
    </div>
}

export default ProjectPageClient;
