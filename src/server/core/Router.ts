import {FastifyInstance} from "fastify";
import {IFastifyOptions} from "../../../types/IFastify";

export const Router = async (
    fastify: FastifyInstance,
    controller: (fastify: FastifyInstance, opt: IFastifyOptions) => Promise<void>,
    prefix: string,
    opt: IFastifyOptions
): Promise<void> => {
    fastify.register(controller, {prefix, ...opt});
}
