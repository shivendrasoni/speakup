
import { NavHeader } from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Help = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">How to Report a Complaint</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Choose Your Reporting Method</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                You can report complaints either by creating an account or without logging in. 
                Creating an account gives you additional features like tracking your complaints and receiving updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Provide Clear Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Choose the relevant sector for your complaint</li>
                <li>Write a clear and concise title</li>
                <li>Provide detailed description of the issue</li>
                <li>Include specific dates and locations if applicable</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Submit and Track</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                After submission, you'll receive a unique complaint ID. Keep this ID safe to track your complaint's status. 
                Registered users can track their complaints directly from their dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Effective Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Be specific and factual in your description</li>
                <li>Avoid using all caps or excessive punctuation</li>
                <li>Include relevant documentation if available</li>
                <li>Keep your complaint professional and objective</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
