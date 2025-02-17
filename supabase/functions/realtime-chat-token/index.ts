
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getBhashiniToken() {
  console.log("Getting Bhashini token...");
  
  // Updated API endpoint
  const response = await fetch('https://bhashini.gov.in/apis/v1/model/getModelKey', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': Deno.env.get('BHASHINI_API_KEY') || '',
    },
    body: JSON.stringify({
      "userId": Deno.env.get('BHASHINI_USER_ID') || '',
      "modelId": "ai4bharat/whisper-multilingual-low",
      "task": "asr",
      "languages": [{
        "sourceLanguage": "en",
        "targetLanguage": "hi"
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bhashini token error:', errorText);
    throw new Error(`Failed to get Bhashini auth token: ${errorText}`);
  }

  const data = await response.json();
  console.log("Successfully got Bhashini token:", data);
  return data.token;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instructions } = await req.json();
    
    const BHASHINI_API_KEY = Deno.env.get('BHASHINI_API_KEY');
    const BHASHINI_USER_ID = Deno.env.get('BHASHINI_USER_ID');

    if (!BHASHINI_API_KEY || !BHASHINI_USER_ID) {
      console.error('Bhashini credentials are not set:', {
        apiKey: !!BHASHINI_API_KEY,
        userId: !!BHASHINI_USER_ID
      });
      throw new Error('Bhashini credentials are not configured');
    }

    console.log('Requesting Bhashini token with credentials:', {
      userId: BHASHINI_USER_ID,
      hasApiKey: !!BHASHINI_API_KEY
    });

    const bhashiniToken = await getBhashiniToken();

    if (!bhashiniToken) {
      console.error('No token received from Bhashini');
      throw new Error('Failed to get Bhashini token');
    }

    const responseData = {
      token: bhashiniToken,
      client_secret: { 
        value: BHASHINI_API_KEY,
        userId: BHASHINI_USER_ID
      },
      client_id: "default-client"
    };

    return new Response(JSON.stringify(responseData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
