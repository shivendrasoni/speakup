
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900">
          Hello, Welcome!
        </h1>
        <p className="text-xl text-gray-600">How can I help you?</p>
        <Button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-full"
        >
          Click to Continue
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
