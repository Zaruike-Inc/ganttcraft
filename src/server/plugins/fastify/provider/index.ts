import gitlabProvider from "#srv/plugins/fastify/provider/gitlab/gitlabProvider";
import githubProvider from "#srv/plugins/fastify/provider/github/githubProvider";

const gitProvider = {
    GITEA: gitlabProvider,
    GITHUB: githubProvider,
    GITLAB: gitlabProvider,
    BITBUCKET: gitlabProvider
}
export default gitProvider
