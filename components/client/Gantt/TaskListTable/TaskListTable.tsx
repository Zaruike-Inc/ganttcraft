import React, {useMemo} from "react";
import {Task} from "gantt-task-react";
import Link from "next/link";
import TLTStyle from './TaskListTable.module.css';
import {MonthFormats} from "gantt-task-react/dist/types/public-types";


interface Props {
    locale: string;
    tasks: Task[];

    onExpanderClick(task: Task): void;

    monthFormat?: MonthFormats
    rowWidth: string;
    rowHeight: number
}

const localeDateStringCache: Record<string, string> = {};
const toLocaleDateStringFactory = (locale: string) => (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = date.toString() + dateTimeOptions.month;
    let lds = localeDateStringCache[key];
    if (!lds) {
        lds = date.toLocaleDateString(locale, dateTimeOptions);
        localeDateStringCache[key] = lds;
    }
    return lds;
};

const TaskListTable = (
    {
        onExpanderClick,
        tasks,
        locale,
        rowWidth,
        rowHeight,
        monthFormat
    }: Props
): React.JSX.Element => {
    const dateTimeOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        day: "numeric",
        month: monthFormat,
    };
    const toLocaleDateString = useMemo(
        () => toLocaleDateStringFactory(locale),
        [locale]
    );
    const buildTitle = (name: string): string => {
        let nameEdit = name;
        if (nameEdit.length > 50) {
            nameEdit = `${nameEdit.substring(0, 47).trim()}...`
        }
        return nameEdit;
    }
    return <div
        className={
            `${TLTStyle.containerTasks} border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 bg-white
             transition-all duration-300`
        }
    >
        {tasks.map((task) => {
            let expanderSymbol = "";
            if (task.hideChildren === false) {
                expanderSymbol = "▼";
            } else if (task.hideChildren === true) {
                expanderSymbol = "▶";
            }
            return <div key={`${task.id}row`} className={'flex justify-center items-center'}
                        style={{height: rowHeight}}>
                <div className={TLTStyle.taskListCell} style={{
                    minWidth: `${parseInt(rowWidth.substring(0, rowWidth.length - 2), 10) + 75}px`,
                    maxWidth: `${parseInt(rowWidth.substring(0, rowWidth.length - 2), 10) + 75}px`
                }}>
                    <div className="flex items-center">
                        <div
                            className={`${
                                task.hideChildren ? TLTStyle.taskListExpander : TLTStyle.taskListEmptyExpander
                            } text-neutral-700 dark:text-neutral-100`}
                            onClick={() => onExpanderClick(task)}
                        >
                            {expanderSymbol}
                        </div>
                        <Link
                            title={task.name}
                            className={
                                'pl-1 font-heading text-sm font-medium leading-normal text-neutral-700' +
                                ' dark:text-neutral-100'
                            }
                            href={`${task.link}`} target={'_blank'}
                            rel={'noreferrer nofollow'}>
                            {buildTitle(task.name)}
                        </Link>
                    </div>
                </div>
                <div className={`${TLTStyle.taskListCell} text-sm leading-normal text-zinc-700 dark:text-neutral-100`}
                     style={{
                         minWidth: `${parseInt(rowWidth.substring(0, rowWidth.length - 2), 10) - 37}px`,
                         maxWidth: `${parseInt(rowWidth.substring(0, rowWidth.length - 2), 10) - 37}px`
                     }}>&nbsp;{toLocaleDateString(task.start, dateTimeOptions)}
                </div>
                <div
                    className={`${TLTStyle.taskListCell} text-sm leading-normal text-zinc-700 dark:text-neutral-100`}
                    style={{
                        minWidth: `${parseInt(rowWidth.substring(0, rowWidth.length - 2), 10) - 37}px`,
                        maxWidth: `${parseInt(rowWidth.substring(0, rowWidth.length - 2), 10) - 37}px`
                    }}>&nbsp;{toLocaleDateString(task.end, dateTimeOptions)}
                </div>
            </div>
        })}
    </div>
}

export default TaskListTable;
