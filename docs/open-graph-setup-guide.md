# Open Graph Image Setup Guide

This guide explains how to add custom Open Graph (OG) images for document links to show large preview images in iMessage, Slack, Twitter, etc.

## Overview

When sharing links in messaging apps like iMessage, the app fetches Open Graph metadata to show a preview. By default, sites show a small bar with a logo. To get a large, professional preview image (like CNN or other news sites), you need to:

1. Add the preview image file to your site
2. Create an HTML viewer page with proper OG metadata
3. Ensure the files are in the correct location for deployment

## File Structure

For a document called "heading-north", you need these files:

```
public/
├── heading-north.png              # The OG preview image (1200x630px recommended)
└── docs/
    ├── heading-north.pdf          # The actual PDF document
    └── heading-north.html         # HTML viewer with OG metadata
```

Optional duplicate for static-site deployments:
```
static-site/
└── documents/
    └── heading-north.html         # Same HTML viewer (if using static-site deployment)
```

## Step 1: Add the Preview Image

1. Place your preview image in `public/` directory
2. Recommended size: **1200x630 pixels** (optimal for all platforms)
3. Format: PNG or JPG
4. Naming: Use lowercase with hyphens (e.g., `heading-north.png`)

```bash
cp /path/to/your/image.png public/heading-north.png
```

## Step 2: Add the PDF Document

Place your PDF in the `public/docs/` directory:

```bash
cp /path/to/your/document.pdf public/docs/heading-north.pdf
```

## Step 3: Create the HTML Viewer with OG Metadata

Create `public/docs/heading-north.html` with this template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heading North - Your Site Name</title>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://your-domain.com/docs/heading-north">
    <meta property="og:title" content="Heading North - Your Site Name">
    <meta property="og:description" content="View and download the Heading North PDF document">
    <meta property="og:image" content="https://your-domain.com/heading-north.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://your-domain.com/docs/heading-north">
    <meta property="twitter:title" content="Heading North - Your Site Name">
    <meta property="twitter:description" content="View and download the Heading North PDF document">
    <meta property="twitter:image" content="https://your-domain.com/heading-north.png">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            background: #f5f5f5;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            background: white;
            border-bottom: 1px solid #e0e0e0;
            padding: 16px 24px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 18px;
            font-weight: 500;
            color: #333;
        }

        .download-btn {
            background: #0066cc;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            text-decoration: none;
            display: inline-block;
        }

        .download-btn:hover {
            background: #0052a3;
        }

        .pdf-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }

        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Heading North</h1>
        <a href="/docs/heading-north.pdf" download class="download-btn">Download PDF</a>
    </div>
    <div class="pdf-container">
        <iframe src="/docs/heading-north.pdf" type="application/pdf"></iframe>
    </div>
</body>
</html>
```

### Important Notes:

1. **Replace all instances of:**
   - `your-domain.com` → your actual production domain
   - `Heading North` → your document title
   - `Your Site Name` → your site/company name
   - `heading-north` → your document slug (URL-friendly name)

2. **OG Image URLs must be absolute URLs** (include `https://your-domain.com`)
   - ❌ Wrong: `content="/heading-north.png"`
   - ✅ Correct: `content="https://your-domain.com/heading-north.png"`

3. **Use `summary_large_image` for Twitter card** to get the large preview

## Step 4: Commit and Deploy

```bash
git add public/heading-north.png public/docs/heading-north.pdf public/docs/heading-north.html
git commit -m "Add Heading North document with custom OG image"
git push
```

Vercel will automatically deploy the changes.

## Step 5: Test the Preview

After deployment, test your Open Graph image:

1. **iMessage Test**: Send the link to yourself in iMessage
2. **Online Validators**:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

3. **Clear Cache**: If the preview doesn't update:
   - Add `?v=2` to your URL when testing
   - Use the validator tools above to refresh the cache

## Accessing Your Document

After deployment, your document will be available at:

- **Viewer page**: `https://your-domain.com/docs/heading-north`
- **Direct PDF**: `https://your-domain.com/docs/heading-north.pdf`
- **OG Image**: `https://your-domain.com/heading-north.png`

## Multiple Documents with Different OG Images

For each document, repeat the process:

```
public/
├── document-one.png
├── document-two.png
└── docs/
    ├── document-one.pdf
    ├── document-one.html
    ├── document-two.pdf
    └── document-two.html
```

Each HTML file should have its own unique OG metadata pointing to its specific image.

## Troubleshooting

### Preview not showing:
- Verify all URLs are absolute (include `https://`)
- Check image dimensions (1200x630 recommended)
- Ensure files are actually deployed (check URLs in browser)
- Clear cache using validator tools

### Image too small in preview:
- Use `summary_large_image` for Twitter card
- Ensure image is at least 1200x630px
- Check `og:image:width` and `og:image:height` are set

### 404 errors:
- Verify files are in `public/` directory
- Check file names match exactly (case-sensitive)
- Ensure deployment completed successfully

## Example: Real Implementation

Here's the actual setup for the "Heading North" document on friggs-gate-static-test:

**Files created:**
- `public/heading-north.png` (1656119 bytes, 1200x630px)
- `public/docs/heading-north.pdf` (3310306 bytes)
- `public/docs/heading-north.html` (with OG metadata)

**Accessible at:**
- https://friggs-gate-static-test.vercel.app/docs/heading-north
- https://friggs-gate-static-test.vercel.app/docs/heading-north.pdf

**Result:** When shared in iMessage, shows large preview image instead of small logo bar.
