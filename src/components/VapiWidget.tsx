import { useEffect } from 'react';

declare global {
  interface Window {
    vapiSDK: {
      run: (config: {
        apiKey: string;
        assistant: string;
        config?: Record<string, any>;
      }) => any;
    };
    vapiInstance: any;
  }
}

export const VapiWidget = () => {
  useEffect(() => {
    const assistant = "ba6896dd-b79c-4699-8c49-b9cafc3ffb0a"; // Your assistant ID this is the assistant id for the vapi assistant
    const apiKey = "342176cf-058b-4c46-b74d-53ba02cf4a12"; // Your Public key
    
    // Button configuration for styling and positioning
    const buttonConfig = {
      position: "bottom-right",
      offset: "40px",
      width: "180px",
      height: "48px",
      style: {
        cursor: 'pointer',
        borderRadius: '24px', // Half of height for perfect pill shape
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '0 16px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      idle: {
        color: "#4F46E5", // Indigo color
        type: "pill", // Changed to pill shape
        icon: "https://unpkg.com/lucide-static@0.321.0/icons/message-circle.svg",
        label: "Start Voice Chat" // Added label
      },
      loading: {
        color: "#4F46E5",
        type: "pill",
        icon: "https://unpkg.com/lucide-static@0.321.0/icons/loader-2.svg",
        label: "Connecting..."
      },
      active: {
        color: "#DC2626", // Red color for active state
        type: "pill",
        icon: "https://unpkg.com/lucide-static@0.321.0/icons/phone-off.svg",
        label: "End Call"
      },
      webhookUrl: '/api/vapi-webhook',
      data: {
        // Additional webhook data if needed
      }
    };

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.defer = true;
    script.async = true;
    
    script.onload = () => {
      window.vapiInstance = window.vapiSDK.run({
        apiKey,
        assistant,
        config: buttonConfig,
      });

      // Add event listeners for better interaction handling
      window.vapiInstance.on('call-start', () => {
        console.log('Call started');
      });

      window.vapiInstance.on('call-end', () => {
        console.log('Call ended');
      });

      window.vapiInstance.on('error', (error: any) => {
        console.error('Vapi error:', error);
      });
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (window.vapiInstance) {
        // Cleanup any event listeners if needed
        window.vapiInstance = null;
      }
    };
  }, []);

  return null;
}; 