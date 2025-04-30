import { html } from 'hono/html';

export function homepage(data: {
    title: string;
    domain: string;
    description: string;
    image: object;
    css: object;
    nonce: string;
}) {
    return html`<!doctype html>
<html lang="en">
<head>
    <title>${data.title}</title>
    <link rel="canonical" href="https://${data.domain}/" />
    <meta name="description" content="${data.description}">
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="${data.css.path}" 
        integrity="${data.css.integrity}" />
</head>
<body>
    <div id="container">
        <div id="article">
            <img id="main"
                src="${data.image.path}"
                alt="${data.description}"
                integrity="${data.image.integrity}"
                />
        </div>
    </div>
</body>
</html>
`;
}
