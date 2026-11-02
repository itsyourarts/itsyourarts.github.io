# ShadowRespCheck

Bulk URL status checker. Paste paths or upload a TXT file, check final HTTP status and redirect destination, and download status-specific lists as TXT or results as CSV.

## Deploy on Vercel

1. Extract the ZIP, then create a new GitHub repository and upload **the files inside the extracted project folder** to the repository root. Include the `api` folder and `vercel.json`.
2. Sign in to Vercel and select **Add New → Project**. Connect GitHub if needed, then import the repository.
3. For Framework Preset choose **Other** if not detected automatically. Leave the build command and output directory at their defaults; no build is required.
4. Click **Deploy**. Vercel will serve `index.html` and deploy `api/check.js` as a Node.js Vercel Function. Open the supplied deployment URL.

The included `vercel.json` sets a 120-second function limit. This needs a Vercel plan and project settings that support it; see Vercel's current function duration and usage limits. Each URL is a separate function request. Large lists may consume significant quota, and some sites may block automated requests.

**Security:** the endpoint is publicly accessible and does not have authentication or rate limiting. It restricts private and local IP destinations, but production use should add authentication, abuse prevention and monitoring. Public access may incur usage charges.

## Run locally

Install Node.js 18 or later, then run:

```bash
npm start
```

Open `http://localhost:3000`. Set `PORT` to change the port. No third-party runtime packages are required.

## Usage notes

- Put one path per line; blank lines and lines starting with `#` are ignored. Full HTTP(S) URLs are also supported.
- Redirects are followed up to 10 hops and results are grouped by the final status. Both the original and final URL are displayed for redirected requests.
- Local and private network destinations are blocked. A request can fail due to timeout, DNS, TLS, server restrictions, or other network errors.
