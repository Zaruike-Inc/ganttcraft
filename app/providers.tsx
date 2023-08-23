"use client"

import {store} from '../store/store';
import {Provider} from 'react-redux';
import React, {useContext, useEffect} from "react";
import ThemeContext, {ThemeProviderContext} from "../contexts/ThemeContext";

const WrappedApp = ({children}: { children: React.ReactNode }) => {
    const {isDark} = useContext(ThemeContext);
    useEffect(() => {
        if (typeof document !== "undefined" && document !== null) {
            // Fetch the base of information here
            const item = document.querySelector('html');
            if (item !== null) {
                // défini en amont notre thème
                item.className = isDark ? 'dark' : 'light';
            }
        }
    }, [isDark]);

    return <html lang={'en'} className={isDark ? 'dark' : 'light'}>
    <body className={`${isDark ? 'dark:bg-neutral-900' : 'bg-neutral-100'}`}>
    <Provider store={store}>
        {children}
    </Provider>
    </body>
    </html>
}

export function Providers({children}: { children: React.ReactNode }): React.JSX.Element {
    /**
     * Warn you need to pass the theme provider and the rest in subcomponent or this will be not update theme context
     */
    return <ThemeProviderContext>
        <WrappedApp>{children}</WrappedApp>
    </ThemeProviderContext>
}
