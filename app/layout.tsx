import React, {ReactNode} from "react";
import {Providers} from "./providers";
import Footer from "#/client/Footer/Footer";
import Navbar from "#/client/Navbar/Navbar";
import '../styles/index.css';

const {SITE_NAME} = process.env;

export const metadata = {
    title: {
        default: `${SITE_NAME}`,
        template: `%s | ${SITE_NAME}`
    }
}

export default async function RootLayout({children}: { children: ReactNode }) {
    return <Providers>
        <div
            className={'relative min-h-screen w-full overflow-x-hidden transition-all duration-300 px-4 xl:px-10 pb-20'}
        >
            <div className="mx-auto w-full">
                <Navbar/>
                {children}
                <Footer/>
            </div>
        </div>
    </Providers>
}
