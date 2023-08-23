import React, {createContext, useEffect, useState} from "react";

type ContextType = {
    toggleDark(): void,
    isDark: boolean
}

const defaultContext: ContextType = {
    toggleDark: () => {
        // Should have been overridden
    },
    isDark: true,
};


const ThemeContext = createContext(defaultContext);

export const ThemeProviderContext = ({children}: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState<boolean>(true);

    useEffect(() => {
        const lsDark = localStorage.getItem('ThemeContext:isDark');
        if (lsDark !== undefined && lsDark !== null && lsDark === 'true' || lsDark === 'false') {
            setIsDark(lsDark === 'true');
            // détecte si l'utilisateur demande explicitement un thème clair.
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            setIsDark(false);
        }
    }, [typeof window !== "undefined", typeof localStorage !== "undefined"]);

    return (
        <ThemeContext.Provider value={{
            isDark: isDark,
            toggleDark: () => {
                localStorage.setItem('ThemeContext:isDark', String(!isDark));
                setIsDark(!isDark);
            }
        }}>{children}</ThemeContext.Provider>
    );
}
export default ThemeContext;
