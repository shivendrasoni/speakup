
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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

export function AIComplaintBot() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  
  // Store collected complaint details
  const [complaintDetails, setComplaintDetails] = useState({
    title: '',
    description: '',
    sector_id: '',
  });

  const startConversation = async () => {
    try {
      // Get ephemeral token from our edge function
      const { data, error } = await supabase.functions.invoke('realtime-chat-token', {
        body: { 
          model: "gpt-4o-realtime-preview-2024-10-01",
          voice: "alloy",
          instructions: SYSTEM_PROMPT
        }
      });

      if (error) throw error;

      // Initialize WebSocket connection
      const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        // Send session configuration
        ws.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            }
          }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data);

        switch (data.type) {
          case 'response.audio.delta':
            setIsSpeaking(true);
            // Handle audio playback
            break;
          case 'response.audio.done':
            setIsSpeaking(false);
            break;
          case 'response.text.delta':
            // Update UI with bot's response
            break;
          case 'function_call.arguments.done':
            // Handle complaint submission if the AI decides to submit
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

    } catch (error) {
      console.error('Error starting conversation:', error);
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
