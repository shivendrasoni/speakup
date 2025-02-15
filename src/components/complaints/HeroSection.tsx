
import { MegaphoneIcon } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 pt-16">
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-300 rounded-full opacity-20 translate-x-1/3 -translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 pt-12 pb-32 relative">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-8 relative">
            <MegaphoneIcon className="w-20 h-20 text-white mx-auto transform -rotate-12 transition-transform hover:rotate-0 hover:scale-110" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Welcome to Speak Up India</h1>
          <p className="text-xl text-white/90 mb-8">Your Platform for Change and Community Engagement</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 200L60 181.3C120 163 240 125 360 106.7C480 88 600 88 720 100C840 112 960 137 1080 143.3C1200 150 1320 137 1380 131.3L1440 125V200H1380C1320 200 1200 200 1080 200C960 200 840 200 720 200C600 200 480 200 360 200C240 200 120 200 60 200H0Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
}
