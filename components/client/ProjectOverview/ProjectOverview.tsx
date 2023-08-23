import React from "react";
import {IProjectWithIssues} from "#types/gateway/ITransformer";
import JdentIconSVG from "#/client/JdentIconSVG/JdentIconSVG";
import {ViewMode} from "gantt-task-react";
import MultipleSelect from "#/client/MultipleSelect/MultipleSelect";
import {MultiValue} from "react-select";

interface Props {
    project: IProjectWithIssues | undefined;
    showCell: boolean;
    currentMode: 'PROJECT' | 'GROUP';
    filterProject?: MultiValue<{
        label: string,
        value: string,
        project?: {
            name: string,
            nameWithNameSpace: string
            pathWithNameSpace: string
        }
    }>
    allFilterProject?: MultiValue<{
        label: string,
        value: string,
        project?: {
            name: string,
            nameWithNameSpace: string
            pathWithNameSpace: string
        }
    }>

    handleSelectProject?(selected: MultiValue<{
        label: string,
        value: string,
        project?: {
            name: string,
            nameWithNameSpace: string
            pathWithNameSpace: string
        }
    }>): void;

    setShowCell(show: boolean): void;

    setViewMode(view: ViewMode): void;
}

const EmptyProject = (): React.JSX.Element => {
    return <p>No project left</p>
}

const ProjectOverview = (
    {
        allFilterProject,
        handleSelectProject,
        filterProject,
        currentMode,
        setShowCell,
        showCell,
        project,
        setViewMode
    }: Props
): React.JSX.Element => {
    if (!project) {
        return <></>;
    }

    return <div className={'grid grid-cols-12 gap-0.5 md:gap-6'}>
        <div className="col-span-12 md:col-span-4">
            <div
                className={'border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 relative w-full bg-white ' +
                    'transition-all duration-300 rounded-md p-6 mb-6'}>
                <div className="flex w-full items-center gap-4">
                    <div
                        className={'relative inline-flex shrink-0 items-center justify-center outline-none h-10 w-10' +
                            ' rounded-full'}>
                        <div
                            className={'flex h-full w-full items-center justify-center overflow-hidden text-center' +
                                ' transition-all duration-300 rounded-full'
                            }>
                            <JdentIconSVG
                                size={40}
                                className={
                                    'max-h-full max-w-full object-cover shadow-sm dark:border-transparent h-10 w-10'
                                }
                                value={project.pathWithNameSpace}/>
                        </div>
                    </div>
                    <div>
                        <h3
                            className={
                                'font-heading text-sm font-medium leading-normal text-neutral-700 dark:text-neutral-100'
                            }
                        >{project.name}</h3>
                        <p className={
                            'text-neutral-500 dark:text-neutral-300 font-sans text-xs font-normal leading-normal' +
                            ' text-neutral-400'
                        }>{project.nameWithNameSpace}</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-span-12 md:col-span-8">
            <div
                className={'border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 relative w-full bg-white ' +
                    'transition-all duration-300 rounded-md p-6 mb-6'}>
                <div className={'flex justify-between'}>
                    <div className="justify-start flex gap-2">
                        <button
                            type={'button'}
                            onClick={() => setShowCell(!showCell)}
                            className={
                                'font-sans font-normal text-sm inline-flex items-center justify-center leading-5 ' +
                                'no-underline h-8 px-3 py-2 space-x-1 border nui-focus transition-all duration-300 ' +
                                'disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:shadow-none' +
                                ' text-neutral-700 bg-white border-neutral-300 dark:text-white dark:bg-neutral-700' +
                                ' dark:border-neutral-600 dark:hover:enabled:bg-neutral-600 ' +
                                'hover:enabled:bg-neutral-50 dark:active:enabled:bg-neutral-700/70 ' +
                                'active:enabled:bg-neutral-100 rounded-md'
                            }>{showCell ? 'Hide tasks list' : 'Show tasks list'}
                        </button>
                    </div>
                    <div className="justify-end flex gap-2">
                        <button
                            type={'button'}
                            onClick={() => setViewMode(ViewMode.Day)}
                            className={
                                'font-sans font-normal text-sm inline-flex items-center justify-center leading-5 ' +
                                'no-underline h-8 px-3 py-2 space-x-1 border nui-focus transition-all duration-300 ' +
                                'disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:shadow-none' +
                                ' text-neutral-700 bg-white border-neutral-300 dark:text-white dark:bg-neutral-700' +
                                ' dark:border-neutral-600 dark:hover:enabled:bg-neutral-600 ' +
                                'hover:enabled:bg-neutral-50 dark:active:enabled:bg-neutral-700/70 ' +
                                'active:enabled:bg-neutral-100 rounded-md'
                            }>Day
                        </button>
                        <button
                            type={'button'}
                            onClick={() => setViewMode(ViewMode.Week)}
                            className={
                                'font-sans font-normal text-sm inline-flex items-center justify-center leading-5 ' +
                                'no-underline h-8 px-3 py-2 space-x-1 border nui-focus transition-all duration-300 ' +
                                'disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:shadow-none' +
                                ' text-neutral-700 bg-white border-neutral-300 dark:text-white dark:bg-neutral-700' +
                                ' dark:border-neutral-600 dark:hover:enabled:bg-neutral-600 ' +
                                'hover:enabled:bg-neutral-50 dark:active:enabled:bg-neutral-700/70 ' +
                                'active:enabled:bg-neutral-100 rounded-md'
                            }>Week
                        </button>
                        <button
                            type={'button'}
                            onClick={() => setViewMode(ViewMode.Month)}
                            className={
                                'font-sans font-normal text-sm inline-flex items-center justify-center leading-5 ' +
                                'no-underline h-8 px-3 py-2 space-x-1 border nui-focus transition-all duration-300 ' +
                                'disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:shadow-none' +
                                ' text-neutral-700 bg-white border-neutral-300 dark:text-white dark:bg-neutral-700' +
                                ' dark:border-neutral-600 dark:hover:enabled:bg-neutral-600 ' +
                                'hover:enabled:bg-neutral-50 dark:active:enabled:bg-neutral-700/70 ' +
                                'active:enabled:bg-neutral-100 rounded-md'
                            }>Month
                        </button>
                        <button
                            type={'button'}
                            onClick={() => setViewMode(ViewMode.Year)}
                            className={
                                'font-sans font-normal text-sm inline-flex items-center justify-center leading-5 ' +
                                'no-underline h-8 px-3 py-2 space-x-1 border nui-focus transition-all duration-300 ' +
                                'disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:shadow-none' +
                                ' text-neutral-700 bg-white border-neutral-300 dark:text-white dark:bg-neutral-700' +
                                ' dark:border-neutral-600 dark:hover:enabled:bg-neutral-600 ' +
                                'hover:enabled:bg-neutral-50 dark:active:enabled:bg-neutral-700/70 ' +
                                'active:enabled:bg-neutral-100 rounded-md'
                            }>Year
                        </button>
                    </div>
                </div>
                <div className={'w-full pt-4'}>
                    {currentMode === 'GROUP' && <MultipleSelect
                        placeholder={'Select one or multiple project'}
                        noOptionsMessage={EmptyProject}
                        isCustomOptions
                        creatable
                        id={'selectProject'}
                        onChange={(val) => handleSelectProject?.(val)}
                        opts={allFilterProject as {
                            label: string,
                            value: string,
                            project: {
                                name: string,
                                pathWithNameSpace: string,
                                nameWithNameSpace: string
                            }
                        }[]}
                        value={filterProject as {
                            label: string,
                            value: string,
                            project: {
                                name: string,
                                pathWithNameSpace: string
                                nameWithNameSpace: string
                            }
                        }[]}/>}
                </div>
            </div>
        </div>
    </div>
}

export default ProjectOverview;
