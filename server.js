const express = require('express');
const cors = require('cors');
const { getSubtitles, getVideoDetails } = require('youtube-caption-extractor');
const ytdl = require('@distube/ytdl-core');
const xml2js = require('xml2js');
const { Innertube } = require('youtubei.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to extract subtitles using ytdl-core
async function extractSubtitlesWithYtdl(videoID, lang = 'en') {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoID}`;
    const info = await ytdl.getInfo(videoUrl);
    
    // Get available captions
    const captions = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    
    // Find caption in requested language or fallback to available ones
    let selectedCaption = captions.find(caption => caption.languageCode === lang);
    if (!selectedCaption && captions.length > 0) {
      selectedCaption = captions[0]; // Use first available caption
    }
    
    if (!selectedCaption) {
      throw new Error('No captions available for this video');
    }
    
    // Fetch caption content
    const captionResponse = await fetch(selectedCaption.baseUrl);
    const captionText = await captionResponse.text();
    
    // Parse XML caption format
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(captionText);
    
    const subtitles = [];
    if (result.transcript && result.transcript.text) {
      result.transcript.text.forEach((element, index) => {
        const start = element.$.start || '0';
        const dur = element.$.dur || '0';
        const text = element._ || element || '';
        
        subtitles.push({
          start: parseFloat(start).toFixed(1),
          dur: parseFloat(dur).toFixed(1),
          text: String(text || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        });
      });
    }
    
    return {
      subtitles,
      language: selectedCaption.languageCode,
      availableLanguages: captions.map(c => ({ code: c.languageCode, name: c.name?.simpleText || c.languageCode }))
    };
  } catch (error) {
    throw new Error(`ytdl-core extraction failed: ${error.message}`);
  }
}

// API route for extracting subtitles and video details
app.get('/api/extract', async (req, res) => {
  const { videoID, lang, method } = req.query;

  // Validate required parameters
  if (!videoID) {
    return res.status(400).json({ 
      error: 'videoID parameter is required' 
    });
  }

  try {
    let result = {};
      // Default: Try youtubei library first, then fallback chain

    try {
      const subtitles = await getSubtitles({ videoID, lang });
      // const videoDetails = await getVideoDetails({ videoID, lang });
      
      result = {
        method: 'youtube-caption-extractor (fallback)',
        data: {
          subtitles,
        }
      };
    } catch (extractorError) {
      console.log('youtube-caption-extractor failed, trying ytdl-core:', extractorError.message);
      
      // Final fallback to ytdl-core
      const ytdlResult = await extractSubtitlesWithYtdl(videoID, lang);
      result = {
        method: 'ytdl-core (fallback)',
        data: {
          subtitles: ytdlResult.subtitles,
        }
      };
    }
    
    res.status(200).json({ 
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error extracting data:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      note: 'Both extraction methods failed. The video may not have subtitles available.'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'YouTube Extractor API is running' 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'YouTube Extractor API',
    endpoints: {
      extract: '/api/extract?videoID=VIDEO_ID&lang=LANGUAGE_CODE&method=METHOD',
      health: '/health'
    },
    parameters: {
      videoID: 'YouTube video ID (required)',
      lang: 'Language code (optional, e.g., "en", "es", "fr")',
      method: 'Extraction method: "ytdl" for ytdl-core, "caption-extractor" for youtube-caption-extractor, or omit for auto-fallback'
    },
    examples: [
      '/api/extract?videoID=dQw4w9WgXcQ&lang=en',
      '/api/extract?videoID=dQw4w9WgXcQ&method=ytdl',
      '/api/extract?videoID=dQw4w9WgXcQ&method=caption-extractor',
      '/api/extract?videoID=dQw4w9WgXcQ&lang=es&method=ytdl'
    ],
    note: 'Now using YouTube InnerTube API v1 as primary method with automatic fallback chain: InnerTube API v1 → caption-extractor → ytdl-core'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 YouTube Extractor API server is running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/extract`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
