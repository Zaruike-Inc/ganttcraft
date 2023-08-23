import {cookies} from 'next/headers'
import clientProvider from "#utils/ClientProvider";
import {IGitlabUser} from "#types/gateway/IGitlabGateway";
import {ITopics} from "#types/gateway/ITransformer";

export async function fetchCurrentUser(): Promise<{ valid: boolean, user?: IGitlabUser }> {
    const cookieStore = cookies();
    // fetch the current cookie contains the JWT token of current user
    const oauthCookie = cookieStore.get('oauth');
    console.log(`${process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN}/api/v1/user/@me`)
    if (oauthCookie) {
        return clientProvider<{
            user: IGitlabUser,
            status: number,
            code: number
        }>(`${process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN}/api/v1/user/@me`, {
            headers: {
                Authorization: `Bearer ${oauthCookie.value}`
            }
        }, 'GET', true, true).then((rep) => {
            if (rep.parseBody !== undefined && rep.status === 200) {
                return {
                    valid: true,
                    user: {
                        ...rep.parseBody.user,
                        token: oauthCookie.value
                    }
                }
            }
            return {valid: false}
        }).catch(() => {
            return {valid: false}
        });
    } else {
        // Redirect the user to the login page again cause isn't connected
        return {valid: false};
    }
}

export async function fetchTopicsUser(): Promise<{ topics: ITopics[] }> {
    const cookieStore = cookies();
    // fetch the current cookie contains the JWT token of current user
    const oauthCookie = cookieStore.get('oauth');
    if (oauthCookie) {
        return clientProvider<{
            topics: [],
            status: number,
            code: number
        }>(`${process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN}/api/v1/topics`, {
            headers: {
                Authorization: `Bearer ${oauthCookie.value}`
            }
        }, 'GET', true).then((rep) => {
            if (rep.parseBody !== undefined && rep.status === 200) {
                return {topics: rep.parseBody.topics}
            }
            return {topics: []};
        }).catch(() => {
            return {topics: []};
        });
    } else {
        // Redirect the user to the login page again cause isn't connected
        return {topics: []};
    }
}
