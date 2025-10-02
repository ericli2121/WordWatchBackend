# YouTube Extractor API

A Node.js API server for extracting YouTube subtitles and video details with support for automatic translated subtitles.

## Features

- Extract YouTube video subtitles/captions
- Get video details (title, description, etc.)
- Support for multiple languages including automatic translations
- Dual extraction methods with automatic fallback
- RESTful API endpoints
- Error handling and validation
- CORS enabled

## Important Note

The `youtube-caption-extractor` package has limitations with YouTube's automatic translated subtitles. This server includes a fallback method using `@distube/ytdl-core` which provides better support for automatic translations.

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Start the server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` by default.

### API Endpoints

#### Extract Subtitles and Video Details

**GET** `/api/extract`

**Parameters:**
- `videoID` (required): YouTube video ID
- `lang` (optional): Language code (e.g., 'en', 'es', 'fr')
- `method` (optional): Extraction method ('ytdl' for ytdl-core, or omit for auto-fallback)

**Examples:**
```
# Auto-fallback (tries youtube-caption-extractor first, then ytdl-core)
GET http://localhost:3000/api/extract?videoID=dQw4w9WgXcQ&lang=en

# Force ytdl-core method (better for automatic translations)
GET http://localhost:3000/api/extract?videoID=dQw4w9WgXcQ&lang=en&method=ytdl

# Extract Spanish subtitles using ytdl-core
GET http://localhost:3000/api/extract?videoID=dQw4w9WgXcQ&lang=es&method=ytdl
```

**Response (youtube-caption-extractor method):**
```json
{
  "success": true,
  "method": "youtube-caption-extractor",
  "data": {
    "subtitles": [
      {
        "start": "0.0",
        "dur": "2.5",
        "text": "Never gonna give you up"
      }
    ],
    "videoDetails": {
      "title": "Rick Astley - Never Gonna Give You Up",
      "description": "...",
      "duration": "3:32"
    }
  }
}
```

**Response (ytdl-core method):**
```json
{
  "success": true,
  "method": "ytdl-core",
  "data": {
    "subtitles": [
      {
        "start": "0.0",
        "dur": "2.5",
        "text": "Never gonna give you up"
      }
    ],
    "availableLanguages": [
      {
        "code": "en",
        "name": "English"
      },
      {
        "code": "es",
        "name": "Spanish"
      }
    ]
  }
}
```

#### Health Check

**GET** `/health`

Returns server status.

#### Root Endpoint

**GET** `/`

Returns API information and available endpoints.

## Example Usage

### Using curl

```bash
# Extract subtitles for a video (auto-fallback)
curl "http://localhost:3000/api/extract?videoID=dQw4w9WgXcQ&lang=en"

# Extract subtitles using ytdl-core (better for automatic translations)
curl "http://localhost:3000/api/extract?videoID=dQw4w9WgXcQ&lang=en&method=ytdl"

# Extract Spanish subtitles using ytdl-core
curl "http://localhost:3000/api/extract?videoID=dQw4w9WgXcQ&lang=es&method=ytdl"
```

### Using JavaScript (fetch)

```javascript
// Auto-fallback method
const response = await fetch('http://localhost:3000/api/extract?videoID=dQw4w9WgXcQ&lang=en');
const data = await response.json();
console.log(data);

// Force ytdl-core method for better automatic translation support
const response2 = await fetch('http://localhost:3000/api/extract?videoID=dQw4w9WgXcQ&lang=es&method=ytdl');
const data2 = await response2.json();
console.log(data2);
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400`: Bad Request (missing required parameters)
- `500`: Internal Server Error (extraction failed)

Example error response:
```json
{
  "success": false,
  "error": "videoID parameter is required"
}
```

## Environment Variables

- `PORT`: Server port (default: 3000)

## Dependencies

- `express`: Web framework
- `youtube-caption-extractor`: YouTube subtitle extraction (limited automatic translation support)
- `@distube/ytdl-core`: Alternative YouTube subtitle extraction (better automatic translation support)
- `xml2js`: XML parsing for subtitle data
- `cors`: Cross-origin resource sharing
- `nodemon`: Development auto-restart (dev dependency)

## Extraction Methods

### Method 1: youtube-caption-extractor (Default)
- **Pros**: Simple API, includes video details
- **Cons**: Limited support for automatic translated subtitles
- **Use case**: When you need video details along with subtitles

### Method 2: @distube/ytdl-core (Fallback/Alternative)
- **Pros**: Better support for automatic translated subtitles, shows available languages
- **Cons**: More complex, doesn't include video details
- **Use case**: When you need automatic translated subtitles or want to see available languages

### Auto-Fallback Behavior
By default, the server tries `youtube-caption-extractor` first. If it fails, it automatically falls back to `@distube/ytdl-core`. You can force a specific method using the `method` parameter.

## License

MIT
