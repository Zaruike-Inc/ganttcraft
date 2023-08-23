import GenericController from "#srv/core/Gateway/generic/GenericController";

/**
 * All road for custom GitHub provider
 * @extends GenericController
 */
class GithubController extends GenericController {
}

const githubInstance = new GithubController('GITHUB');
export default githubInstance;
