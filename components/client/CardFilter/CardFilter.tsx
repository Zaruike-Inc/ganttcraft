import React, {useEffect, useState} from "react";
import Checkbox from "#/client/Checkbox/Checkbox";
import {IFilterData, IFilterOptionSelected, TCardTypeFilter} from "#types/components/shared/CardFilter";


interface Props {
    title: string,
    items: IFilterOptionSelected[],
    type: TCardTypeFilter,

    handleSelectedUnselectParent?(type: TCardTypeFilter, item: IFilterData, val: boolean): void
}

const CardFilter = ({title, items, type, handleSelectedUnselectParent}: Props): React.JSX.Element => {
    const [currentData, setCurrentData] = useState<IFilterData[]>([]);

    useEffect(() => {
        // Parse data for better output and implement the selected field
        setCurrentData(items.map((e) => ({...e, selected: e.selected ?? false})));
    }, [items]);

    const handleCheck = (type: TCardTypeFilter, item: IFilterData, val: boolean): void => {
        setCurrentData([...JSON.parse(JSON.stringify(currentData))].map((e) => {
            if (e.id === item.id) {
                return {...e, selected: val}
            } else {
                return e;
            }
        }));
        handleSelectedUnselectParent?.(type, item, val);
    }
    return <div
        className={'border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 relative w-full bg-white' +
            ' transition-all duration-300 rounded-md p-6'}>
        <h3 className={'font-heading text-base font-medium leading-normal mb-4 dark:text-white'}>{title}</h3>
        <ul className={'space-y-2'}>
            {currentData.map((item) => {
                return <li className={'flex items-center justify-between'} key={item.id}>
                    <div className={'relative inline-flex items-start gap-1 text-primary-500'}>
                        <Checkbox
                            id={`label-${item.name}-${item.id}`} label={item.name} checked={item.selected}
                            handleCheck={(val) => handleCheck(type, item, val)}/>
                    </div>
                    {item.totalProjectsCount !== undefined && <span
                        className={'inline-block px-3 font-sans transition-shadow duration-300 py-1 text-[0.65rem]' +
                            ' rounded-full border-neutral-300 text-neutral-600 dark:bg-neutral-800' +
                            ' dark:border-neutral-700 dark:text-neutral-300 border bg-white'}
                    >{item.totalProjectsCount}</span>}
                </li>
            })}
        </ul>
    </div>
}

export default CardFilter;
