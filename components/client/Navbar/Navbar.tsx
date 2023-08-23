'use client';

import React, {LegacyRef, useContext, useRef, useState} from "react";
import Link from "next/link";
import Logo from "#/client/svg/Logo";
import ThemeContext from "../../../contexts/ThemeContext";
import {useAppSelector} from "../../../hook/hooks";
import {FaMoon, FaSun} from "react-icons/fa";
import Image from "next/image";
import {useOutsideClick} from "../../../hook/useOutsideClick";

const Navbar = (): React.JSX.Element => {
    const [isOpenMenu, setOpenMenu] = useState<boolean>(false);
    const {isDark, toggleDark} = useContext(ThemeContext);
    const ref = useRef<HTMLDivElement>();
    const user = useAppSelector((s) => s.user);
    const handleOpenCloseMenu = (): void => {
        setOpenMenu(!isOpenMenu);
    }

    useOutsideClick(ref.current, isOpenMenu, () => {
        handleOpenCloseMenu();
    }, [isOpenMenu]);

    return <div className="mx-auto w-full max-w-7xl relative z-50 mb-5 flex h-16 items-center gap-2">
        <h1
            className={'font-heading text-2xl font-light leading-normal text-muted-800 dark:text-white'}
        >
            <Link
                href={'/'}
                className={`flex header-logo w-full items-end justify-end py-5 lg:py-2`}
            >
                <Logo width={30} height={30} fillColor={isDark ? 'white' : 'black'}/>
                <span className={"px-2 font-bold text-dark dark:text-white"}>GanttCraft</span>
            </Link>
        </h1>
        <div className="ms-auto"/>
        <div className="flex items-center gap-2 h-16">
            <button
                className={'relative block h-9 w-9 shrink-0 overflow-hidden rounded-full transition-all duration-300' +
                    'focus-visible:outline-2 dark:ring-offset-neutral-900'}
                onClick={toggleDark}
                aria-label={isDark ? `Switch to light theme` : `Switch to dark theme`}
            >
                <span
                    className={'flex items-center justify-center h-9 w-9 rounded-full bg-white' +
                        ' dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700'}>
                    {isDark ?
                        <FaSun className={'text-yellow-400 pointer-events-none h-5 w-5 transition-all duration-300'}/> :
                        <FaMoon className={'text-yellow-400 pointer-events-none h-5 w-5 transition-all duration-300'}/>
                    }
                </span>
            </button>
            <div className="group inline-flex items-center justify-center">
                <div className="relative h-9 w-9">
                    <button
                        onClick={handleOpenCloseMenu}
                        className={"inline-flex h-9 w-9" +
                            " items-center justify-center rounded-full ring-1 ring-transparent transition-all" +
                            " duration-300 hover:opacity-70"}
                    >
                        <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
                            {user?.avatar && user?.username && <Image
                                height={36} width={36} src={user.avatar} alt={`logo of ${user.username}`}
                                className={"max-w-full rounded-full object-cover shadow-sm dark:border-transparent"}
                            />}
                        </div>
                    </button>
                    <div id={'right-menu'} ref={ref as LegacyRef<HTMLDivElement>}
                         role={"menu"}
                         className={`${isOpenMenu ? 'block' : 'hidden'} divide-neutral-100 border-neutral-200` +
                             ` dark:divide-neutral-700` +
                             ' dark:border-neutral-700 dark:bg-neutral-800 absolute end-0 mt-2 w-64 ' +
                             'origin-top-right divide-y rounded-md border bg-white shadow-lg focus:outline-none'}>
                        <div className="p-3 text-center" role={'none'}>
                            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                                {user?.avatar && user?.username && <Image
                                    height={80}
                                    width={80}
                                    src={user.avatar} alt={`logo of ${user.username}`}
                                    className={"max-w-full rounded-full object-cover shadow-sm dark:border-transparent"}
                                />}
                            </div>
                            <div className="mt-3">
                                <h6 className="font-heading text-neutral-800 text-sm font-medium dark:text-white">
                                    {user.username}
                                </h6>
                                <p className="text-neutral-400 mb-4 font-sans text-xs">{user.email}</p>
                            </div>
                        </div>
                        <div className="p-3">
                            <button
                                type={'button'}
                                className={'bg-white text-neutral-700 dark:text-white dark:bg-neutral-700 border' +
                                    ' border-neutral-200 px-2 py-2 text-sm transition-all duration-300' +
                                    ' dark:border-neutral-600 inline-flex items-center justify-center' +
                                    ' rounded-xl is-button-default w-full hover:bg-neutral-200' +
                                    ' dark:hover:bg-neutral-600'}>Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default Navbar;
