# 📁 File System Guide

## How File Import, Preview & Download Works

### The Simple Flow
1. **User types command** → `/pdf`, `/spreadsheet`, or `/png`
2. **File loads** → App fetches file from `/public` directory
3. **Chat displays link** → Clickable filename appears in chat
4. **User clicks** → Preview modal opens with file content
5. **Download works** → Download button saves file to user's computer

### Code Architecture

#### 1. Commands (`/app/config/commands.ts`)
```typescript
special: {
  "/pdf": "GENERATE_PDF_COMMAND",
  "/spreadsheet": "GENERATE_SPREADSHEET_COMMAND", 
  "/png": "GENERATE_PNG_COMMAND"
}
```

#### 2. Command Processing (`ChatWindow.tsx`)
- Detects special commands
- Fetches file from `/public` directory
- Creates blob URL for preview/download
- Adds file message to chat

#### 3. File Display (`ChatMessageBubble.tsx`)
- Shows clickable filename in chat
- Detects file type (PDF, Excel, image)
- Opens preview modal when clicked

#### 4. Preview Modal (`PDFPreviewOverlay.tsx`)
- **PDF**: Uses `react-pdf` library
- **Spreadsheet**: Parses with `xlsx`, displays as HTML table
- **Image**: Simple `<img>` tag
- All types get download button + close button

### Current File Storage (Development)
```
/public/
├── Life Product Model Manual v1.0.pdf
├── North American_Distributor_Scorecards.xlsx
├── ChatGPT Image Aug 10, 2025, 03_36_33 PM.png
└── workers/
    └── pdf.worker.min.js
```

### Production File Storage (When Launched)

#### Best Practice: Cloud Storage + CDN
```
Cloud Storage (AWS S3/Google Cloud):
├── user-uploads/
│   ├── pdfs/
│   ├── spreadsheets/
│   └── images/
├── system-files/
│   └── templates/
└── workers/
    └── pdf.worker.min.js
```

#### Why Cloud Storage?
- **Scalable** - Handle millions of files
- **Fast** - CDN delivers files globally
- **Secure** - Access controls & encryption
- **Reliable** - 99.9% uptime guarantees

#### Implementation Changes Needed:
1. **Upload API** - Users can upload their own files
2. **Database** - Track file metadata (owner, type, size)
3. **Authentication** - Secure file access per user
4. **CDN URLs** - Replace `/public` paths with cloud URLs

### File Types Supported
- **PDF** → `react-pdf` rendering
- **Excel/Spreadsheet** → `xlsx` parsing + table display  
- **Images** → Native `<img>` display
- **Easily Extensible** → Same pattern for Word docs, videos, etc.

### Key Features
✅ **Unified Preview** - One modal handles all file types  
✅ **Download Support** - All files downloadable  
✅ **Theme Support** - Dark/light mode compatible  
✅ **Mobile Friendly** - Responsive design  
✅ **Error Handling** - Graceful failures with user messages