# Chaperone

A landing page for collecting phone numbers, deployed on Cloudflare Pages.

## Local Development

1. Install Wrangler (Cloudflare CLI):
```bash
npm install -g wrangler
```

2. Set up environment variables in `.dev.vars`:
```
AIRTABLE_BASE_ID = "your_base_id"
AIRTABLE_API_KEY = "your_api_key"
```

3. Run local development server:
```bash
wrangler pages dev .
```

The site will be available at `http://localhost:8788`

## Deployment to Cloudflare Pages

### Option 1: Deploy via GitHub (Recommended)

1. Push your code to GitHub (excluding `.dev.vars` and `template/` folder)

2. In Cloudflare Dashboard:
   - Go to **Pages** > **Create a project**
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command**: Leave empty (no build needed)
     - **Build output directory**: `/`
   - Click **Save and Deploy**

3. Set environment variables:
   - Go to your Pages project > **Settings** > **Environment variables**
   - Add both for Production and Preview:
     - `AIRTABLE_BASE_ID` = your Airtable base ID
     - `AIRTABLE_API_KEY` = your Airtable API key

4. Redeploy to apply environment variables

### Option 2: Direct Deploy via Wrangler

1. Deploy:
```bash
wrangler pages deploy . --project-name=chaperone
```

2. Set environment variables (run once):
```bash
wrangler pages secret put AIRTABLE_BASE_ID --project-name=chaperone
wrangler pages secret put AIRTABLE_API_KEY --project-name=chaperone
```

## Project Structure

```
/
├── index.html              # Main landing page
├── privacy.html           # Privacy policy
├── terms.html            # Terms of service
├── functions/            # Cloudflare Pages Functions
│   └── submit.js        # Phone number submission handler
├── wrangler.toml        # Cloudflare configuration
└── .dev.vars           # Local environment variables (not committed)
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