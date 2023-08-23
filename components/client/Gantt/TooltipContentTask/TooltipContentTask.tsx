import React, {useEffect, useState} from "react";
import {Task} from "gantt-task-react";
import {IIssue} from "#types/gateway/ITransformer";

interface Props {
    task: Task,
    issues: IIssue[]
}

const TooltipContentTask = ({task, issues}: Props): React.JSX.Element => {
    const [currentIssue, setCurrentIssue] = useState<IIssue>();
    useEffect(() => {
        if (task !== undefined && task !== null && issues !== undefined && issues.length > 0) {
            const id = parseInt(task.id.split('issue-').join(''), 10);
            setCurrentIssue(issues.filter((e) => e.iid === id)[0]);
        }
    }, [issues, task]);

    return <div className={
        'p-4 border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 w-full border bg-white transition-all ' +
        'duration-300 rounded-md'
    }>
        <p className={'font-heading text-sm font-medium leading-normal text-neutral-700 dark:text-neutral-100'}>{`${
            task.name
        }: ${task.start.getDate()}-${
            task.start.getMonth() + 1
        }-${task.start.getFullYear()} - ${task.end.getDate()}-${
            task.end.getMonth() + 1
        }-${task.end.getFullYear()}`}</p>
        {task.end.getTime() - task.start.getTime() !== 0 && (
            <p className={
                'text-neutral-500 dark:text-neutral-300 font-sans text-xs font-normal leading-normal text-muted-400'
            }>{`Duration: ${~~(
                (task.end.getTime() - task.start.getTime()) /
                (1000 * 60 * 60 * 24)
            )} day(s)`}</p>
        )}
        <p className={
            'text-neutral-500 dark:text-neutral-300 font-sans text-xs font-normal leading-normal text-muted-400'
        }>
            {!!task.progress && `Progress: ${task.progress} %`}
        </p>
        {currentIssue !== undefined && currentIssue !== null && <div>
            <p className={
                "text-neutral-500 dark:text-neutral-300 font-sans text-xs font-normal leading-normal text-muted-400"
            }>
                <span>Created By :&nbsp;{currentIssue.author.username}</span>
            </p>
        </div>}
    </div>
}

export default TooltipContentTask;
