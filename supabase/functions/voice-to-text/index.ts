
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
  const response = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelKey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'userID': Deno.env.get('BHASHINI_USER_ID') || '',
      'ulcaApiKey': Deno.env.get('BHASHINI_API_KEY') || '',
    },
    body: JSON.stringify({
      "task": "asr",
      "serviceProvider": "ai4bharat",
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bhashini token error:', errorText);
    throw new Error(`Failed to get Bhashini auth token: ${errorText}`);
  }

  const data = await response.json();
  console.log("Successfully got Bhashini token");
  return data.token;
}

async function transcribeWithBhashini(audioBase64: string, language: string) {
  try {
    console.log(`Transcribing with Bhashini for language: ${language}`);
    const token = await getBhashiniToken();
    
    const response = await fetch('https://inference.bhashini.gov.in/services/inference/asr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        "source_language": language,
        "audio": [{
          "audioContent": audioBase64
        }],
        "config": {
          "serviceId": "ai4bharat/conformer-hi-gpu",
          "language": {
            "sourceLanguage": language
          },
          "transcriptionFormat": {
            "value": "transcript"
          },
          "postProcessors": null
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
    return result.text || '';
  } catch (error) {
    console.error('Bhashini transcription error:', error);
    throw new Error(`Bhashini transcription failed: ${error.message}`);
  }
}

async function transcribeWithOpenAI(audioBlob: Uint8Array, language: string) {
  console.log(`Transcribing with OpenAI for language: ${language}`);
  const formData = new FormData();
  formData.append('file', new Blob([audioBlob], { type: 'audio/webm' }));
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
        const audioBlob = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
        text = await transcribeWithOpenAI(audioBlob, langCode);
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
