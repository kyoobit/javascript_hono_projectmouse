import { html } from 'hono/html';

export function homepage(data: {
    title: string;
    domain: string;
    description: string;
    image: string;
    image_integrity: string;
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
`;
}
