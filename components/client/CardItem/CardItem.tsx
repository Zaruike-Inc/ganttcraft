import React from "react";
import JdentIconSVG from "#/client/JdentIconSVG/JdentIconSVG";
import Link from "next/link";
import {IGroupOrProject} from "#types/gateway/ITransformer";

interface Props {
    item: IGroupOrProject
}
const CardItem = ({item}: Props): React.JSX.Element => {
    return <Link
        href={`/project?${item.type}=${encodeURI(item.pathWithNameSpace)}`}
        className={'border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 relative w-full border bg-white ' +
            'transition-all duration-300 rounded-md p-5 block hover:scale-105'}>
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
                        className={'max-h-full max-w-full object-cover shadow-sm dark:border-transparent h-10 w-10'}
                        value={item.pathWithNameSpace}/>
                </div>
            </div>
            <div>
                <h3
                    className={'font-heading text-sm font-medium leading-normal text-neutral-700 dark:text-neutral-100'}
                >{item.name}</h3>
                <p className={
                    'text-neutral-500 dark:text-neutral-300 font-sans text-xs font-normal leading-normal text-muted-400'
                }>{item.nameWithNameSpace}</p>
            </div>
            <div className="ms-auto">

            </div>
        </div>
    </Link>
}

export default CardItem
