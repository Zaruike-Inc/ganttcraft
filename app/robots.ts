const baseUrl = process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN
    ? `${process.env.NEXT_PUBLIC_GIT_CALLBACK_DOMAIN}`
    : 'http://localhost:3081';

export default function robots() {
    return {
        // Allow all
        rules: [{userAgent: '*'}],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl
    };
}
