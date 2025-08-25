import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CorsErrorAlert = () => {
  return (
    <Alert className="border-warning bg-warning/10">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Direct API Access Not Available</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          IBM Quantum API blocks direct browser requests for security reasons (CORS policy). 
          Your credentials are correct, but this demo app can't connect directly.
        </p>
        <div className="space-y-2">
          <p className="font-semibold text-sm">To see your real quantum jobs, you need:</p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• A backend server or proxy to handle IBM API requests</li>
            <li>• Or use the IBM Quantum Platform directly</li>
          </ul>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://quantum.cloud.ibm.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Open IBM Quantum Platform
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};