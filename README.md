# Chaperone

A landing page for collecting phone numbers, deployed on Cloudflare Pages.

## Local Development

1. Install Wrangler (Cloudflare CLI):
```bash
npm install -g wrangler
```

2. Set up environment variables in `wrangler.toml`:
```
AIRTABLE_BASE_ID = "your_base_id"
AIRTABLE_API_KEY = "your_api_key"
```

3. Run local development server:
```bash
npx wrangler pages dev .
```

The site will be available at `http://localhost:8788`

## Deployment to Cloudflare Pages via Wrangler

```bash
npx wrangler pages deploy . --project-name=chaperone
```


## Project Structure

```
/
├── index.html           # Main landing page
├── privacy.html         # Privacy policy
├── terms.html           # Terms of service
├── _routes.json         # Specify paths
├── functions/           # Cloudflare Pages Functions
│   └── submit.js        # Phone number submission handler
│   └── [[path]].js      # Redirect unknown paths to homepage
└── wrangler.toml        # Cloudflare configuration
```

## How It Works

- **Static files** (`index.html`, etc.) are served directly by Cloudflare Pages
- **Functions** in the `/functions` directory automatically become API endpoints
- `functions/submit.js` handles POST requests to `/submit`
- Phone numbers are saved to Airtable via the API

## Important Notes

- The `template/` folder is for reference only and should be deleted before deployment
- Never commit `.dev.vars` to version control (already in `.gitignore`)
- Environment variables must be set in Cloudflare Pages dashboard for production
- Functions automatically get CORS headers for cross-origin requests