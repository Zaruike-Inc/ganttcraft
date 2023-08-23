import React from "react";
import HomePageClient from "#/client/HomePageClient";
import {fetchCurrentUser} from "#/srv/fetchData";

export default async function HomePage(): Promise<React.JSX.Element> {
    const dataUser = await fetchCurrentUser();
    return <HomePageClient data={dataUser} />
}
