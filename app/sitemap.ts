import {MetadataRoute} from "next";

const baseUrl = process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN
    ? `${process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN}`
    : 'http://localhost:3081';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // no need more information into the sitemap
    return [''].map((r) => ({
        url: `${baseUrl}/${r}`,
        lastModified: new Date().toISOString()
    }));
}
