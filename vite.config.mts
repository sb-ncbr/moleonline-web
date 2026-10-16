import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';

const envDir = fileURLToPath(new URL('.', import.meta.url));
const page = (path: string) => fileURLToPath(new URL(`./sources/${path}`, import.meta.url));

// The same /online/... rewrites as docker/nginx.*.conf, for the dev and preview servers
const rewriteOnline: Connect.NextHandleFunction = (req, _res, next) => {
    if (req.url?.startsWith('/online/')) {
        const rest = req.url.slice('/online/'.length);
        req.url = rest.startsWith('templates/') ? `/html/${rest}` : '/html/detail.html';
    }
    next();
};

const onlineRoutes: Plugin = {
    name: 'moleonline-online-routes',
    configureServer(server) {
        server.middlewares.use(rewriteOnline);
    },
    configurePreviewServer(server) {
        server.middlewares.use(rewriteOnline);
    },
};

export default defineConfig(({ mode, isPreview }) => {
    // The app has no built-in API URL; fail early instead of producing a site that calls nowhere
    if (!isPreview && !loadEnv(mode, envDir, 'VITE_').VITE_API_URL) {
        throw new Error('VITE_API_URL is not set. Set it in the environment, e.g. VITE_API_URL=https://... npm run build');
    }

    return {
        root: 'sources',
        // Served as-is at the site root: images, PDF report templates, example data and legacy global scripts
        publicDir: '../public',
        // .env files live next to package.json, not in sources/
        envDir,
        plugins: [onlineRoutes],
        build: {
            outDir: '../dist',
            emptyOutDir: true,
            rolldownOptions: {
                input: {
                    index: page('index.html'),
                    detail: page('html/detail.html'),
                    about: page('html/about.html'),
                    news: page('html/news.html'),
                },
            },
        },
    };
});
