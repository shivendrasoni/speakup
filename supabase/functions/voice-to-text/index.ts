
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
    throw new Error('Failed to get Bhashini auth token');
  }

  const data = await response.json();
  return data.token;
}

async function transcribeWithBhashini(audioBase64: string, language: string) {
  try {
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
      throw new Error('Bhashini API error');
    }

    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('Bhashini API error:', error);
    throw error;
  }
}

async function transcribeWithOpenAI(audioBlob: Uint8Array, language: string) {
  const formData = new FormData();
  formData.append('file', new Blob([audioBlob], { type: 'audio/webm' }));
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${await response.text()}`);
  }

  const result = await response.json();
  return result.text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, language } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const langCode = LANGUAGE_CODES[language as keyof typeof LANGUAGE_CODES] || 'en';
    let text = '';

    // Use Bhashini for Indian languages and OpenAI for English
    if (langCode !== 'en') {
      text = await transcribeWithBhashini(audio, langCode);
    } else {
      const audioBlob = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
      text = await transcribeWithOpenAI(audioBlob, langCode);
    }

    return new Response(
      JSON.stringify({ text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
