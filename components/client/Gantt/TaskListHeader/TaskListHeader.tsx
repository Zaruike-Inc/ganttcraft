import React from "react";
import TLHStyle from './TaskListHeader.module.css';

interface Props {
    headerHeight: number,
    rowWidth: string
}

const TaskListHeader = ({headerHeight,rowWidth}: Props): React.JSX.Element => {
    return <div className={`${TLHStyle.containerH} bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100`}>
        <div className={`${TLHStyle.header}`} style={{height: headerHeight}}>
            <div className={TLHStyle.item} style={{
                minWidth: `${parseInt(rowWidth.substring(0, rowWidth.length - 2), 10) + 75}px`,
            }}>Task</div>
            <div className={TLHStyle.item} style={{
                minWidth: `${parseInt(rowWidth.substring(0, rowWidth.length - 2), 10) - 37}px`,
            }}>Start</div>
            <div className={TLHStyle.item} style={{
                minWidth: `${parseInt(rowWidth.substring(0, rowWidth.length - 2), 10) - 37}px`,
            }}>End</div>
        </div>
    </div>
}

export default TaskListHeader;
