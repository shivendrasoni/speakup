
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { NavHeader } from "@/components/NavHeader";
import { useLanguage } from "@/contexts/LanguageContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/complaints");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {t("common.login")}
          </h2>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t("common.email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t("common.password")}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : t("common.login")}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/signup"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {t("common.signup")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
