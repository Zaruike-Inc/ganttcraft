import React from "react";

const FilterContentSkeleton = ({itemCount}: { itemCount: number }) => {
    const skeletonItems = Array.from({length: itemCount}, (_, index) => (
        <li className={'flex items-center justify-between'} key={index}>
            <div className={'relative inline-flex items-start gap-1 text-primary-500 w-full'}>
                <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"/>
                <div className={'font-heading font-medium leading-normal w-2/4 h-6 bg-gray-300 rounded-full' +
                    ' animate-pulse'}/>
            </div>
            <div className="inline-block w-7 h-6 bg-gray-300 rounded-full animate-pulse px-3 py-1"/>
        </li>
    ));

    return <div className={
        'border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 relative w-full bg-white transition-all' +
        ' duration-300 rounded-md p-6'
    }>
        <h3 className={
            'font-heading text-base font-medium leading-normal mb-4 dark:text-white' +
            ' w-24 h-6 bg-gray-300 rounded-full animate-pulse'
        }/>
        <ul className={'space-y-2'}>{skeletonItems}</ul>
    </div>
}

export default FilterContentSkeleton;
