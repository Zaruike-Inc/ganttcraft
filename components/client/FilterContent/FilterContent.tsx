'use client';

import React, {useEffect, useState} from "react";
import CardFilter from "#/client/CardFilter/CardFilter";
import FilterContentSkeleton from "../../Skeleton/FilterContentSkelton/FilterContentSkelton";
import {IFilterData, TCardTypeFilter} from "#types/components/shared/CardFilter";

interface Props {
    allVisibility: IFilterData[]
    itemsType: IFilterData[],
    handleSelectedUnselectItem(type: TCardTypeFilter, item: IFilterData, val: boolean): void
}


const FilterContent = ({itemsType, handleSelectedUnselectItem, allVisibility}: Props): React.JSX.Element => {
    const [isLoad, setLoaded] = useState<boolean>(false);
    useEffect(() => {
        setLoaded(true);
    }, []);

    return <div className={'flex flex-col gap-6'}>
        {isLoad ? <CardFilter
                type={'TYPE'} title="Search by Type(s)" items={itemsType}
                handleSelectedUnselectParent={handleSelectedUnselectItem}
            /> :
            <FilterContentSkeleton itemCount={2}/>}
        {isLoad ? <CardFilter
                type={'VISIBILITY'} title="Search by visibility" items={allVisibility}
                handleSelectedUnselectParent={handleSelectedUnselectItem}
            /> :
            <FilterContentSkeleton itemCount={3}/>}
    </div>
}

export default FilterContent;
