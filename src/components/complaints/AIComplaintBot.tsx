import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SYSTEM_PROMPT = `You are a helpful and empathetic grievance officer. Your goal is to collect all necessary details for filing a complaint. 

Follow these steps:
1. Greet the person warmly and ask them what brings them here today
2. Listen to their initial concern
3. Collect these essential details in a conversational manner:
   - Title of the complaint
   - Detailed description
   - Which department/sector it relates to
   - Any specific location or area details
4. Once you have all details, inform them that you'll help file the complaint
5. After filing, provide them with a complaint ID and next steps

Keep the conversation natural and show empathy throughout.`;

class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext({ sampleRate: 24000 });
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData.buffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }
}

function encodeAudioForAPI(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = int16Array.byteLength;
  const fileSize = 36 + dataSize;

  writeString(0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const wavBytes = new Uint8Array(wavHeader.byteLength + int16Array.byteLength);
  wavBytes.set(new Uint8Array(wavHeader), 0);
  wavBytes.set(new Uint8Array(int16Array.buffer), wavHeader.byteLength);

  let binary = '';
  const bytes = new Uint8Array(wavBytes.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function AIComplaintBot() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  
  const [complaintDetails, setComplaintDetails] = useState({
    title: '',
    description: '',
    sector_id: '',
  });

  const startConversation = async () => {
    try {
      if (isConnected) {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        if (audioRecorderRef.current) {
          audioRecorderRef.current.stop();
          audioRecorderRef.current = null;
        }
        setIsConnected(false);
        return;
      }

      console.log('Getting token from realtime-chat-token function...');
      const { data, error } = await supabase.functions.invoke('realtime-chat-token', {
        body: { 
          model: "gpt-4o-realtime-preview-2024-10-01",
          voice: "alloy",
          instructions: SYSTEM_PROMPT
        }
      });

      if (error) {
        console.error('Error getting token:', error);
        throw error;
      }

      if (!data?.client_secret?.value) {
        throw new Error('No token received from realtime-chat-token function');
      }

      console.log('Creating WebSocket connection...');
      const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01');
      wsRef.current = ws;
      
      if (!audioQueueRef.current) {
        audioQueueRef.current = new AudioQueue();
      }

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);

        // Set up audio recorder
        audioRecorderRef.current = new AudioRecorder((audioData) => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              const encodedAudio = encodeAudioForAPI(audioData);
              ws.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: encodedAudio
              }));
            } catch (error) {
              console.error('Error encoding audio:', error);
            }
          }
        });

        audioRecorderRef.current.start().catch(error => {
          console.error('Failed to start audio recorder:', error);
          toast({
            title: "Error",
            description: "Failed to access microphone",
            variant: "destructive"
          });
        });

        // Initialize session with our token
        ws.send(JSON.stringify({
          type: "session.init",
          session: {
            client_secret: data.client_secret.value,
            client_id: data.client_id
          }
        }));
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data);

        // Handle session created event
        if (data.type === 'session.created') {
          console.log('Session created, sending configuration...');
          ws.send(JSON.stringify({
            type: "session.update",
            session: {
              modalities: ["text", "audio"],
              input_audio_format: "wav",
              output_audio_format: "wav",
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              }
            }
          }));

          // Send initial message to start conversation
          ws.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: 'Hello'
                }
              ]
            }
          }));
          ws.send(JSON.stringify({ type: 'response.create' }));
        }

        switch (data.type) {
          case 'response.audio.delta': {
            setIsSpeaking(true);
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await audioQueueRef.current?.addToQueue(bytes);
            break;
          }
          case 'response.audio.done':
            setIsSpeaking(false);
            break;
          case 'function_call.arguments.done':
            handleComplaintSubmission(JSON.parse(data.arguments));
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to AI assistant",
          variant: "destructive"
        });
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        if (audioRecorderRef.current) {
          audioRecorderRef.current.stop();
          audioRecorderRef.current = null;
        }
      };

    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsConnected(false);
      toast({
        title: "Error",
        description: "Failed to start AI conversation",
        variant: "destructive"
      });
    }
  };

  const handleComplaintSubmission = async (details: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('complaints')
        .insert({
          title: details.title,
          description: details.description,
          sector_id: details.sector_id,
          user_id: user?.id,
          status: 'pending',
          submission_type: 'complaint'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your complaint has been submitted successfully",
      });

    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: "Error",
        description: "Failed to submit complaint",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          Talk to AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            <Button
              size="lg"
              className={`${isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              onClick={startConversation}
            >
              {isConnected ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Conversation
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Start Conversation
                </>
              )}
            </Button>
          </div>
          {isSpeaking && (
            <div className="text-center text-sm text-gray-500">
              AI is speaking...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
