import {
    IFastifyReply,
    IFastifyRequestExtend,
    IFastifyRequestExtendGitea,
    IFastifyRequestExtendGithub,
    IFastifyRequestExtendGitlab,
    IFastifyRequestExtendBitbucket
} from "#types/IFastify";


type TBadData = {
    result: false,
    req: IFastifyReply
}
export type TCheckData<T, P> = { result: true, req: IFastifyRequestExtend<T, P> } | TBadData;
export type TCheckDataWithGitlab<T, P> = { result: true, req: IFastifyRequestExtendGitlab<T, P> } | TBadData;
export type TCheckDataWithGithub<T, P> = { result: true, req: IFastifyRequestExtendGithub<T, P> } | TBadData;
export type TCheckDataWithBitbucket<T, P> = { result: true, req: IFastifyRequestExtendBitbucket<T, P> } | TBadData;
export type TCheckDataWithGitea<T, P> = { result: true, req: IFastifyRequestExtendGitea<T, P> } | TBadData;


/**
 * JWT Token decode
 * @return {IDecodedToken}
 */
export interface IDecodedToken {
    access_token: string,
    exp?: string,
    iat?: string
}
