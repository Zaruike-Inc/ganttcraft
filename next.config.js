/**
 * Security headers used in the app
 * @see https://infosec.mozilla.org/guidelines/web_security
 */
const headers = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
        key: 'Server',
        value: 'STUDIT', // phony server value
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'X-Frame-Options',
        value: 'sameorigin',
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
    },
    {
        key: 'Referrer-Policy',
        value: 'same-origin',
    }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true
    },
    swcMinify: true,
    reactStrictMode: true,
    // Remove the powerBy header (no need here)
    poweredByHeader: false,
    images: {
        remotePatterns:  [{
            protocol: 'https',
            hostname: 'secure.gravatar.com',
            port: '',
            pathname: '/avatar/**'
        },{
            protocol: 'https',
            hostname: 'gitlab.com',
            pathname: '/uploads/**'
        },{
            protocol: 'https',
            hostname: 'avatars.githubusercontent.com',
            pathname: '/u/**'
        }, {
            protocol: 'http',
            hostname: '127.0.0.1',
            pathname: '/api/v1/image'
        }]
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers
            }
        ]
    }
}

module.exports = nextConfig
