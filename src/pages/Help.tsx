
import { NavHeader } from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { TRANSLATIONS } from "@/pages/NewComplaint";

const Help = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {TRANSLATIONS[language].helpTitle}
        </h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{TRANSLATIONS[language].helpStep1Title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {TRANSLATIONS[language].helpStep1Content}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{TRANSLATIONS[language].helpStep2Title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {TRANSLATIONS[language].helpStep2Items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{TRANSLATIONS[language].helpStep3Title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {TRANSLATIONS[language].helpStep3Content}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{TRANSLATIONS[language].helpTipsTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {TRANSLATIONS[language].helpTipsItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
