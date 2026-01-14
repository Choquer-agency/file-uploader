# AttachFlow

Add file upload capability to any Webflow form through a simple script embed.

## Features

- Drop-in JavaScript widget that works with any Webflow form
- No expensive Business plan required
- Email delivery of form submissions with files
- Simple dashboard to manage uploads
- Free tier available

## Quick Start

1. Install dependencies (if running locally):
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-jwt-secret-here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Installation on Webflow

Add this code to your Webflow site's custom code section:

```html
<script>
  window.ATTACHFLOW_SITE_KEY = 'your-site-key';
  window.ATTACHFLOW_API_URL = 'https://attachflow.com/api';
</script>
<script src="https://attachflow.com/widget.js"></script>
```

## How It Works

1. The widget automatically detects forms on your Webflow site
2. Adds file upload buttons to each form
3. When visitors upload files, they're temporarily stored on our servers
4. When the form submits, we combine form data with uploaded files
5. Everything is sent to your configured email address

## Pricing

- **Free Tier**: 1 site, 100MB storage
- **Pro Tier**: $9/mo for unlimited sites and storage

## Tech Stack

- Next.js 16 with TypeScript
- Local file storage (upgradeable to S3)
- Email delivery via nodemailer
- Tailwind CSS for styling