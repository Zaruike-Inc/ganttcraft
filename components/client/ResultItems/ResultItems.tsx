'use client'
import React, {useEffect, useState} from "react";
import {useAppSelector} from "../../../hook/hooks";
import CardItem from "#/client/CardItem/CardItem";
import {IGroupOrProject} from "#types/gateway/ITransformer";
import {TTypeSelected} from "#types/components/shared/TTypeSelected";

interface Props {
    allVisibility: string[]
    currentSelected: TTypeSelected,
    isProjectDisabled: boolean;
    isGroupDisabled: boolean;

    setCurrentSelected(val: TTypeSelected): void,
}

const ResultItems = (
    {
        currentSelected,
        setCurrentSelected,
        allVisibility,
        isProjectDisabled,
        isGroupDisabled
    }: Props
): React.JSX.Element => {
    const [projectsParsed, setProjectsParsed] = useState<IGroupOrProject[]>([]);
    const [countItems, setCountItems] = useState<{ project: number, group: number, total: number }>({
        project: 0,
        total: 0,
        group: 0
    })
    const projects = useAppSelector((s) => s.projects);

    const handleFilterProjectsByFilter = (filterType: 'ALL' | 'PROJECTS' | 'GROUP') => {
        setCurrentSelected(filterType);
        const cloneItems = [...JSON.parse(JSON.stringify(projects))];
        if (filterType === 'ALL') {
            setProjectsParsed(cloneItems.filter((p) => allVisibility.includes(p.visibility)));
        } else if (filterType === 'PROJECTS') {
            setProjectsParsed(cloneItems.filter((p) => p.type === 'project' && allVisibility.includes(p.visibility)));
        } else {
            setProjectsParsed(cloneItems.filter((p) => p.type === 'group' && allVisibility.includes(p.visibility)));
        }
    }
    useEffect(() => {
        setProjectsParsed(projects);
        console.log(projects)
        if (projects !== undefined) {
            setCountItems({
                project: projects.filter((e) => e.type === 'project' && allVisibility.includes(e.visibility)).length,
                total: projects.filter((e) => allVisibility.includes(e.visibility)).length,
                group: projects.filter((e) => e.type === 'group' && allVisibility.includes(e.visibility)).length
            })
        }
        handleFilterProjectsByFilter(currentSelected);
    }, [projects, currentSelected, allVisibility]);
    return <>
        <div className="border-neutral-200 dark:border-neutral-800 flex items-center gap-4 border-b font-sans">
            <button
                onClick={() => handleFilterProjectsByFilter('ALL')}
                className={`text-neutral-700 dark:text-neutral-100 border-b-2 px-3 py-4 flex text-sm ${
                    currentSelected === 'ALL' ? 'border-primary-500' : 'border-transparent'
                }`}>
                <span className={'pr-2'}>All</span>
                <span
                    className={'mr-2 bg-red-500 rounded-full w-5 h-5 block text-sm text-neutral-100'}
                >{countItems.total}</span>
            </button>
            <button
                onClick={() => handleFilterProjectsByFilter('PROJECTS')}
                className={`text-neutral-700 dark:text-neutral-100 border-b-2 flex px-3 py-4 text-sm ${
                    currentSelected === 'PROJECTS' ? 'border-primary-500' : 'border-transparent'
                }`}><span className={'pr-2'}>Projects</span>
                <span
                    className={'mr-2 bg-red-500 rounded-full w-5 h-5 block text-sm text-neutral-100'}
                >{countItems.project}</span>
            </button>
            <button
                onClick={() => handleFilterProjectsByFilter('GROUP')}
                className={`text-neutral-700 dark:text-neutral-100 border-b-2 flex px-3 py-4 text-sm ${
                    currentSelected === 'GROUP' ? 'border-primary-500' : 'border-transparent'
                }`}>
                <span className="pr-2">Group</span>
                <span
                    className={'mr-2 bg-red-500 rounded-full w-5 h-5 block text-sm text-neutral-100'}
                >{countItems.group}</span>
            </button>
        </div>
        <div>
            <div className={'space-y-4 py-4'}>
                {currentSelected === 'PROJECTS' && isProjectDisabled && <div
                    className={
                        'border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 relative w-full border' +
                        ' bg-white transition-all duration-300 rounded-md p-5 block dark:text-neutral-100'
                    }>
                    You need enable the project search for access here
                </div>}
                {currentSelected === 'GROUP' && isGroupDisabled && <div
                    className={
                        'border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 relative w-full border' +
                        ' bg-white transition-all duration-300 rounded-md p-5 block dark:text-neutral-100'
                    }>
                    You need enable the group search for access here
                </div>}
                {isGroupDisabled && isProjectDisabled && currentSelected === 'ALL' && <div
                    className={
                        'border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 relative w-full border' +
                        ' bg-white transition-all duration-300 rounded-md p-5 block dark:text-neutral-100'
                    }>
                    You must activate one or more search types to access it here
                </div>}
                {projectsParsed !== undefined &&
                    projectsParsed !== null &&
                    projectsParsed.length > 0 &&
                    projectsParsed.map((p) => {
                        // prevent déduplicate with this key
                        return <CardItem key={`${p.type}-${p.id}-${p.nameWithNameSpace}`} item={p}/>
                    })
                }
            </div>
        </div>
    </>
}
export default ResultItems;
