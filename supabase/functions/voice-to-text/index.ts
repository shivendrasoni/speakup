
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LANGUAGE_CODES = {
  english: 'en',
  hindi: 'hi',
  bengali: 'bn',
  telugu: 'te',
  marathi: 'mr',
  tamil: 'ta',
  gujarati: 'gu',
  kannada: 'kn',
  odia: 'or',
  punjabi: 'pa',
  malayalam: 'ml'
} as const;

async function getBhashiniToken() {
  console.log("Getting Bhashini token...");
  const BHASHINI_API_KEY = Deno.env.get('BHASHINI_API_KEY');
  const BHASHINI_USER_ID = Deno.env.get('BHASHINI_USER_ID');

  if (!BHASHINI_API_KEY || !BHASHINI_USER_ID) {
    throw new Error('Missing Bhashini credentials');
  }

  const response = await fetch('https://bhashini.gov.in/apis/v1/model/getModelKey', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': BHASHINI_API_KEY
    },
    body: JSON.stringify({
      "userId": BHASHINI_USER_ID,
      "modelId": "ai4bharat/whisper-multilingual-low",
      "task": "asr",
      "languages": [{
        "sourceLanguage": "en"
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bhashini token error:', errorText);
    throw new Error(`Failed to get Bhashini token: ${errorText}`);
  }

  const data = await response.json();
  console.log("Successfully got Bhashini token");
  return data.token;
}

async function transcribeWithBhashini(audioBase64: string, language: string) {
  try {
    console.log(`Transcribing with Bhashini for language: ${language}`);
    const BHASHINI_API_KEY = Deno.env.get('BHASHINI_API_KEY');

    if (!BHASHINI_API_KEY) {
      throw new Error('BHASHINI_API_KEY not configured');
    }

    const response = await fetch('https://bhashini.gov.in/apis/v1/inference/asr/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': BHASHINI_API_KEY
      },
      body: JSON.stringify({
        "modelId": "ai4bharat/whisper-multilingual-low",
        "task": "asr",
        "input": {
          "audio": [{
            "audioContent": audioBase64
          }],
          "language": {
            "sourceLanguage": language
          }
        },
        "config": {
          "transcriptionFormat": {
            "value": "transcript"
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bhashini API error:', errorText);
      throw new Error(`Bhashini API error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Successfully transcribed with Bhashini");
    return result.output[0].source;
  } catch (error) {
    console.error('Bhashini transcription error:', error);
    throw new Error(`Bhashini transcription failed: ${error.message}`);
  }
}

async function transcribeWithOpenAI(audioBase64: string, language: string) {
  console.log(`Transcribing with OpenAI for language: ${language}`);
  
  // Convert base64 to binary
  const binaryString = atob(audioBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create WAV header
  const wavHeader = new Uint8Array(44);
  const view = new DataView(wavHeader.buffer);
  
  // Write WAV header
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = bytes.length;
  const fileSize = 36 + dataSize;

  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Combine header and audio data
  const wavFile = new Uint8Array(wavHeader.length + bytes.length);
  wavFile.set(wavHeader);
  wavFile.set(bytes, wavHeader.length);

  // Create form data with WAV file
  const formData = new FormData();
  formData.append('file', new Blob([wavFile], { type: 'audio/wav' }), 'audio.wav');
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${errorData}`);
  }

  const result = await response.json();
  console.log("Successfully transcribed with OpenAI");
  return result.text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, language } = await req.json();
    
    if (!audio) {
      console.error('No audio data provided');
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing request for language: ${language}`);
    const langCode = LANGUAGE_CODES[language as keyof typeof LANGUAGE_CODES];
    if (!langCode) {
      console.error(`Unsupported language: ${language}`);
      return new Response(
        JSON.stringify({ error: `Unsupported language: ${language}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let text = '';

    try {
      // Use Bhashini for Indian languages and OpenAI for English
      if (langCode !== 'en') {
        console.log('Using Bhashini API');
        text = await transcribeWithBhashini(audio, langCode);
      } else {
        console.log('Using OpenAI API');
        text = await transcribeWithOpenAI(audio, langCode);
      }

      if (!text) {
        throw new Error('No transcription returned');
      }

      console.log('Transcription successful');
      return new Response(
        JSON.stringify({ text }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to transcribe audio',
          details: transcriptionError.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
