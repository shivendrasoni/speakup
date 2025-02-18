// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio, messages } = await req.json()
    // @ts-ignore
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key')
    }

    if (!audio) {
      throw new Error('No audio provided')
    }

    console.log('Processing audio input...')
    
    // Convert base64 to blob
    const audioBytes = Uint8Array.from(atob(audio), c => c.charCodeAt(0))
    const audioBlob = new Blob([audioBytes], { type: 'audio/webm' })

    // Transcribe audio
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')
    
    console.log('Transcribing with Whisper...')
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!transcriptionResponse.ok) {
      const error = await transcriptionResponse.text()
      console.error('Whisper API error:', error)
      throw new Error(`Whisper API error: ${error}`)
    }

    const transcription = await transcriptionResponse.json()
    console.log('Transcription:', transcription.text)

    // Get chat completion
    console.log('Getting chat completion...')
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          ...messages,
          { role: 'user', content: transcription.text }
        ]
      })
    })

    if (!chatResponse.ok) {
      const error = await chatResponse.text()
      console.error('Chat API error:', error)
      throw new Error(`Chat API error: ${error}`)
    }

    const completion = await chatResponse.json()
    const responseText = completion.choices[0].message.content
    console.log('AI Response:', responseText)

    // Convert to speech
    console.log('Converting to speech...')
    const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: responseText,
        voice: 'alloy',
        response_format: 'mp3'
      })
    })

    if (!speechResponse.ok) {
      const error = await speechResponse.text()
      console.error('Speech API error:', error)
      throw new Error(`Speech API error: ${error}`)
    }

    const audioBuffer = await speechResponse.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))

    return new Response(JSON.stringify({
      text: responseText,
      audio: base64Audio
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in edge function:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 