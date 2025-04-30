# JavaScript Hono Projectmouse

A simple single page site, build on the JavaScript Hono framework to create an endpoint using Cloudflare's serverless Workers and R2 object storage platform services.

See Also:

* https://hono.dev/docs/getting-started/cloudflare-workers
* https://developers.cloudflare.com/workers/wrangler/


Create the project root directory:

```shell
npm create hono@latest javascript_hono_projectmouse
* Ok to proceed? (y) y
* ? Which template do you want to use? cloudflare-workers
* ? Do you want to install project dependencies? yes
* ? Which package manager do you want to use? npm
```

Install the dependencies:

```shell
cd javascript_hono_projectmouse
npm install
npm update --dry-run
```

Create and use a local R2 storage bucket named "public" (.wrangler/state/v3/r2/public):

```shell
npx wrangler r2 object put public/img/Mouse_ss120_1024x1024.gif --file public/img/Mouse_ss120_1024x1024.gif --local
npx wrangler r2 object put projectmouse-r2-production/img/Mouse_ss120_1024x1024.gif --file public/img/Mouse_ss120_1024x1024.gif --remote
```
```shell
npx wrangler r2 object put public/css/main.css --file public/css/main.css --local
npx wrangler r2 object put projectmouse-r2-production/css/main.css --file public/css/main.css --remote
```

Run the development server:

```shell
npm run dev
```

Test requests:

```shell
curl -i http://localhost:8787/
curl -vso /dev/null http://localhost:8787/img/Mouse_ss120_1024x1024.gif
curl -vso /dev/null http://localhost:8787/css/main.css
```

Deploy the service to Cloudflare:

```shell
npm run deploy
```
