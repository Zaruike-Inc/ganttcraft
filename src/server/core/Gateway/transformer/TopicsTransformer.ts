import {TProvider} from "#types/IPluginManager";
import {IGitlabTopicsRaw} from "#types/gateway/IGitlabGateway";
import {ITopics} from "#types/gateway/ITransformer";

export default class TopicsTransformer {
    private readonly datas;
    private readonly provider: TProvider;
    constructor(provider: TProvider, topicsDatas: IGitlabTopicsRaw[]) {
        this.datas = topicsDatas;
        this.provider = provider;
    }

    toString(): ITopics[] {
        if(this.provider === 'GITLAB'){
            return this.datas.map((e) => ({
                id: e.id,
                name: e.name,
                slug: e.title,
                totalProjectsCount: e.total_projects_count
            }));
        }else{
            return [];
        }
    }
}
