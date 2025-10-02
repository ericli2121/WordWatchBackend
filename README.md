# YouTube Extractor API

A robust API server for extracting YouTube subtitles and video details with auto-translation support.

## Features

- **Multiple extraction methods**: youtubei.js library, youtube-caption-extractor, and ytdl-core
- **Auto-translation**: Automatically translates subtitles to requested languages
- **Fallback system**: Automatically tries different methods if one fails
- **Rate limiting protection**: Built-in retry logic and user-agent rotation
- **CORS support**: Ready for web applications

## API Endpoints

### Extract Subtitles
```
GET /api/extract?videoID=VIDEO_ID&lang=LANGUAGE_CODE&method=METHOD
```

**Parameters:**
- `videoID` (required): YouTube video ID
- `lang` (optional): Language code (default: 'en')
- `method` (optional): Force specific method ('youtubei', 'caption-extractor', 'ytdl')

**Example:**
```bash
curl "https://your-app.onrender.com/api/extract?videoID=dQw4w9WgXcQ&lang=ko"
```

### Health Check
```
GET /health
```

### Root
```
GET /
```

## Response Format

```json
{
  "success": true,
  "method": "youtubei library",
  "data": {
    "subtitles": [
      {
        "start": "0.0",
        "dur": "2.5",
        "text": "Hello world"
      }
    ],
    "language": "ko",
    "isAutoTranslated": true
  }
}
```

## Deployment on Render

This API is configured for easy deployment on Render:

1. **Connect your GitHub repository** to Render
2. **Create a new Web Service**
3. **Use the following settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node.js

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Rate Limiting

The API includes built-in protection against YouTube's rate limiting:
- Automatic retry with exponential backoff
- User-agent rotation
- Request throttling

## Supported Languages

Supports all languages available on YouTube, including:
- Native captions
- Auto-generated captions
- Auto-translated captions

## License

MIT