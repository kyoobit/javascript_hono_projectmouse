import { Hono } from 'hono';
import { html, raw } from 'hono/html';

const app = new Hono();

app.get('/:dir{(css|img)}/:key', async (c) => {
    const key = `${c.req.param("dir")}/${c.req.param("key")}`;
    const object = await c.env.R2_BUCKET.get(key);

    if (!object) return c.notFound();

    const data = await object.arrayBuffer();
    const contentType = object.httpMetadata?.contentType || '';

    const cacheControl = (c.req.param("dir") == 'img') ? 'max-age=31536000' : 'max-age=900';

    return c.body(data, 200, {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
        'Cache-Control': cacheControl,
        'Content-Type': contentType,
        'ETag': object.httpEtag,
    });
});

app.get('/', async (c) => {

    // Data used in the HTML content template
    const data = {
        title: "Project Mouse",
        domain: "www.projectmouse.net",
        description: "Project Mouse: A project to control the interwebs.",
        image: "/img/Mouse_ss120_1024x1024.gif",
        image_integrity: "sha384-KdfQ/mZRH/a/x0mcuGQ0mD1Qoohu8N0IW+uClm4vxYGgPoZhaqabmQuCXfD4RYKy",
    };

    // HTML content template
    const content = html`<!doctype html>
<html lang="en">
<head>
    <title>${data.title}</title>
    <link rel="canonical" href="https://${data.domain}/" />
    <meta name="description" content="${data.description}">
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="/css/main.css" 
        integrity="sha384-4NUWB6CfrGJR3WLnImEHFfhxbWQtSRwCF5a5ivg3z6rBvaVokGuVwhu8r/xCCo67" />
</head>
<body>
    <div id="container">
        <div id="article">
            <img id="main"
                src="${data.image}"
                alt="${data.description}"
                integrity="${data.image_integrity}"
                />
        </div>
    </div>
</body>
</html>
`

    // HTTP response headers
    let headers = {}

    // Cross-Origin Resource Sharing (CORS) HTTP response headers
    // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CORS
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
    //headers['Access-Control-Allow-Origin'] = `https://${data.domain}/`;

    // https://developer.mozilla.org/en-US/observatory/analyze

    // Subresource Integrity
    // https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
    // hash=$(cat FILENAME.js | openssl dgst -sha384 -binary | openssl base64 -A)
    // hash=$(shasum -b -a 384 FILENAME.js | awk '{ print $1 }' | xxd -r -p | base64)
    // echo "sha384-${hash}"
    let script_integrity_hashes = [
        // 'sha384-<HASH VALUE>',
    ].join(' ')

    // Content Security Policy (CSP) HTTP response header
    // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSP
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
    // https://csp-evaluator.withgoogle.com
    headers['Content-Security-Policy'] = [
        "default-src 'self' https:", // load resources that are from the same-origin as the document using https only
        //`image-src 'self' ${data.domain}`,
        //`style-src 'self' ${data.domain}`,
        `script-src 'strict-dynamic' https: ${script_integrity_hashes}`, // 'strict-dynamic': Allow trusted scripts to load additional scripts
        "object-src 'none'", // block all <object> and <embed> resources
        "base-uri 'none'", // block all uses of the <base> element to set a base URI
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for
        "require-trusted-types-for 'script'",
    ].join('; ')

    // MIME types HTTP response header
    // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/MIME_types
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
    headers['X-Content-Type-Options'] = 'nosniff';

    // Clickjacking HTTP response header
    // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Clickjacking
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
    headers['X-Frame-Options'] = 'DENY';

    // Referrer policy HTTP response header
    // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Referrer_policy
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
    headers['Referrer-Policy'] = 'same-origin'; // send the Referrer header, but only on same-origin requests

    // Cross-Origin Resource Policy (CORP) HTTP response header
    // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CORP
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy
    headers['Cross-Origin-Resource-Policy'] = 'same-origin'; // limits resource access to requests coming from the same origin

    // https://hono.dev/docs/helpers/html
    return c.html(content, 200, headers);
});

export default app