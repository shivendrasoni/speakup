
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

  console.log('Making request to Bhashini API with credentials');
  
  // First get the API token
  const response = await fetch('https://inference.bhashini.gov.in/asr/v1/recognize', {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': BHASHINI_API_KEY
    },
    body: JSON.stringify({
      "config": {
        "language": {
          "sourceLanguage": "en"
        }
      },
      "audio": [
        {
          "audioContent": ""
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bhashini API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Failed to get Bhashini token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Successfully got Bhashini response");
  return data.requestId; // Use requestId as the token
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
