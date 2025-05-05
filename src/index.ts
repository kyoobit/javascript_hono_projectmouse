import { Hono } from 'hono';
import { html, raw } from 'hono/html';

import { homepage } from '@templates/homepage';
import { getSecureHeaders } from '@helpers/headers';

const app = new Hono();

function generateNonce() {
    return btoa(Math.random().toString(36).substring(2, 15));
}

// Middleware to log requests to an API
app.use('*', async (c, next) => {
    await next()

    const logging_endpoint = c.env.LOGGING_ENDPOINT;

    // Log this information
    const log_payload = {
        domain: c.req.header('host'),
        path: c.req.path,
        method: c.req.method,
        ip: c.req.header('cf-connecting-ip'),
        user_agent: c.req.header('user-agent'),
        timestamp: new Date().toISOString(),
    }

    // Log the request to an external API location
    if (logging_endpoint) {
        const log_promise = fetch(logging_endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': `cf-worker-${c.req.header('host')}`,
            },
            body: JSON.stringify(log_payload),
        })
        .then(async res => {
            console.log('Logging API POST status:', res.status);
            if (!res.ok) {
                console.error('Logging API failed response:', await res.text());
            }
        })
        .catch((err) => {
            console.error('Logging API POST fetch error:', err);
        });

        c.executionCtx?.waitUntil(log_promise);
    }
})

// Handle generic directory level mapping to object storage
app.get('/:dir{(css|img)}/:key', async (c) => {
    const key = `${c.req.param("dir")}/${c.req.param("key")}`;
    const object = await c.env.R2_BUCKET.get(key);

    if (!object) return c.notFound();

    const data = await object.arrayBuffer();

    // HTTP response headers
    let headers = {};

    // Cache Control HTTP response header
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
    headers['Cache-Control'] = (c.req.param("dir") == 'img') ? 'max-age=31536000' : 'max-age=900';

    // Content Type HTTP response header
    https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
    headers['Content-Type'] = object.httpMetadata?.contentType || '';

    // ETag HTTP response header
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
    headers['ETag'] = object.httpEtag;

    // https://hono.dev/docs/helpers/html
    return c.body(data, 200, headers);
});

// Handle specific file mappings to object storage
app.on('GET', [
    '/favicon.ico',
    '/robots.txt',
], async (c) => {
    const path = c.req.path.slice(1);
    const object = await c.env.R2_BUCKET.get(path);

    if (!object) return c.notFound();

    const data = await object.arrayBuffer();

    // HTTP response headers
    let headers = {};

    // Cache Control HTTP response header
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
    headers['Cache-Control'] = 'max-age=900';

    // Content Type HTTP response header
    https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
    headers['Content-Type'] = object.httpMetadata?.contentType || 'text/plain';

    // ETag HTTP response header
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
    headers['ETag'] = object.httpEtag;

    // https://hono.dev/docs/helpers/html
    return c.body(data, 200, headers);
});

// Handle the root index
app.get('/', (c) => {

    // Data used in the HTML content template
    const nonce = generateNonce();
    const data = {
        title: "Project Mouse",
        domain: "www.projectmouse.net",
        description: "Project Mouse: A project to control the interwebs.",
        image: {
            path: "/img/Mouse_ss120_1024x1024.gif",
            integrity: "sha384-KdfQ/mZRH/a/x0mcuGQ0mD1Qoohu8N0IW+uClm4vxYGgPoZhaqabmQuCXfD4RYKy",
        },
        css: {
          path: '/css/main.css',
          // echo "sha384-$(shasum -b -a 384 public/css/main.css | awk '{ print $1 }' | xxd -r -p | base64)"
          integrity: 'sha384-4NUWB6CfrGJR3WLnImEHFfhxbWQtSRwCF5a5ivg3z6rBvaVokGuVwhu8r/xCCo67',
        },
        nonce: nonce,
    };

    // HTML content template
    const content = homepage(data);

    // HTTP headers helper
    const headers = getSecureHeaders({
        // Subresource Integrity
        // https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
        // hash=$(cat FILENAME.js | openssl dgst -sha384 -binary | openssl base64 -A)
        // hash=$(shasum -b -a 384 FILENAME.js | awk '{ print $1 }' | xxd -r -p | base64)
        // echo "sha384-${hash}"
        script_hashes: [
            `'nonce-${nonce}'`,
            // 'sha384-<HASH VALUE>',
        ],
    });

    // Cross-Origin Resource Sharing (CORS) HTTP response headers
    // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CORS
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
    headers['Access-Control-Allow-Origin'] = `https://${c.req.header('host')}/`;

    // https://hono.dev/docs/helpers/html
    return c.html(content, 200, headers);
});

export default app