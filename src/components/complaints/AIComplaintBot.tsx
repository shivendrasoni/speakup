
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

export function AIComplaintBot() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);

  const startConversation = async () => {
    try {
      if (isConnected) {
        if (wsRef.current) {
          wsRef.current.close();
        }
        if (audioRecorderRef.current) {
          audioRecorderRef.current.stop();
        }
        wsRef.current = null;
        audioRecorderRef.current = null;
        setIsConnected(false);
        return;
      }

      console.log('Getting token from realtime-chat-token function...');
      const response = await supabase.functions.invoke('realtime-chat-token', {
        body: { 
          model: "gpt-4o-realtime-preview-2024-10-01",
          voice: "alloy",
          instructions: SYSTEM_PROMPT
        }
      });

      if (response.error || !response.data?.token) {
        console.error('Token error:', response.error || 'No token received');
        throw new Error('Failed to get authentication token');
      }

      console.log('Creating WebSocket connection...');
      const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection opened');
        
        // Initialize session with token
        ws.send(JSON.stringify({
          type: "session.init",
          session: {
            token: response.data.token
          }
        }));
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        if (data.type === 'session.created') {
          console.log('Session created successfully');
          setIsConnected(true);

          // Set up audio recorder after session is created
          if (!audioQueueRef.current) {
            audioQueueRef.current = new AudioQueue();
          }

          audioRecorderRef.current = new AudioRecorder((audioData) => {
            if (ws.readyState === WebSocket.OPEN) {
              const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioData.buffer)));
              ws.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: base64Audio
              }));
            }
          });

          await audioRecorderRef.current.start();

          // Configure session
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

          // Start conversation
          ws.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'user',
              content: [{ type: 'input_text', text: 'Hello' }]
            }
          }));
          ws.send(JSON.stringify({ type: 'response.create' }));
        }

        // Handle audio responses
        if (data.type === 'response.audio.delta') {
          setIsSpeaking(true);
          const binaryString = atob(data.delta);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          await audioQueueRef.current?.addToQueue(bytes);
        }

        if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
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
        if (audioRecorderRef.current) {
          audioRecorderRef.current.stop();
          audioRecorderRef.current = null;
        }
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error starting conversation:', error);
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      audioRecorderRef.current = null;
      wsRef.current = null;
      setIsConnected(false);
      toast({
        title: "Error",
        description: error.message || "Failed to start AI conversation",
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
