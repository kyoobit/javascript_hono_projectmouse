import { Hono } from 'hono'
import { html, raw } from 'hono/html'
const app = new Hono()

app.get('/img/:key', async (c) => {
    const key = `img/${c.req.param("key")}`;
    const object = await c.env.R2_BUCKET.get(key);

    if (!object) return c.notFound();

    const data = await object.arrayBuffer();
    const contentType = object.httpMetadata?.contentType || '';

    return c.body(data, 200, {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
        'Cache-Control': 'max-age=31536000', // 1 year
        'Content-Type': contentType,
        'ETag': object.httpEtag,
    });
});

app.get('/', (c) => {
    // https://hono.dev/docs/helpers/html
    return c.html(html`<!doctype html>
<html lang="en">
<head>
    <title>Project Mouse</title>
    <link rel="canonical" href="https://www.projectmouse.net/" />
    <meta name="description" content="Project Mouse: A project to control the interwebs.">
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <div style="display: flex; align-items: center; justify-content: center;">
        <div style="margin: 18% 0; min-height: 384px; max-height: 568px;">
            <img src="/img/Mouse_ss120_1024x1024.gif"
                 alt="Project Mouse: A project to control the interwebs."
                 style="max-width: 100%; max-height: 384px;" 
                 />
        </div>
    </div>
</body>
</html>
`)
});

export default app