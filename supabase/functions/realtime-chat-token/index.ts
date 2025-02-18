
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getBhashiniToken() {
  console.log("Getting Bhashini token...");
  
  const BHASHINI_API_KEY = Deno.env.get('BHASHINI_API_KEY');
  const BHASHINI_USER_ID = Deno.env.get('BHASHINI_USER_ID');

  if (!BHASHINI_API_KEY || !BHASHINI_USER_ID) {
    throw new Error('Missing Bhashini credentials');
  }

  console.log('Getting auth token from Bhashini...');
  
  // First authenticate and get the auth token
  const authResponse = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelKey', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'userID': BHASHINI_USER_ID,
      'ulcaApiKey': BHASHINI_API_KEY
    },
    body: JSON.stringify({
      "modelId": "ai4bharat/whisper-multilingual",
      "task": "asr",
      "language": {
        "sourceLanguage": "en"
      }
    })
  });

  if (!authResponse.ok) {
    const errorText = await authResponse.text();
    console.error('Bhashini Auth error:', {
      status: authResponse.status,
      statusText: authResponse.statusText,
      error: errorText
    });
    throw new Error(`Failed to authenticate with Bhashini: ${authResponse.status} ${authResponse.statusText}`);
  }

  const authData = await authResponse.json();
  console.log("Successfully got Bhashini auth response:", authData);

  if (!authData.modelKey) {
    throw new Error('No model key received from Bhashini');
  }

  return authData.modelKey;
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
      console.error('Missing required environment variables');
      throw new Error('Missing required Bhashini credentials');
    }

    console.log('Requesting Bhashini token...');

    const bhashiniToken = await getBhashiniToken();

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
    console.error("Error in edge function:", error);
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
