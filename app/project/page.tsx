import React from "react";
import ProjectPageClient from "#/client/ProjectPageClient";
import {fetchCurrentUser} from "#/srv/fetchData";

export default async function ProjectPage(): Promise<React.JSX.Element> {
    const dataUser = await fetchCurrentUser();
    return <ProjectPageClient data={dataUser}/>
}
