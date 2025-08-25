import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Settings, Key, Globe } from 'lucide-react';

interface ApiKeyDialogProps {
  onCredentialsSet: (apiKey: string, serviceCrn: string) => void;
  hasCredentials: boolean;
}

export const ApiKeyDialog = ({ onCredentialsSet, hasCredentials }: ApiKeyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [serviceCrn, setServiceCrn] = useState('');

  const handleSave = () => {
    if (apiKey.trim() && serviceCrn.trim()) {
      onCredentialsSet(apiKey.trim(), serviceCrn.trim());
      setOpen(false);
      setApiKey('');
      setServiceCrn('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={hasCredentials ? "outline" : "default"} 
          size="sm"
          className="font-mono"
        >
          <Settings className="w-4 h-4 mr-2" />
          {hasCredentials ? 'Update API' : 'Connect API'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">IBM Quantum API Configuration</DialogTitle>
          <DialogDescription>
            Enter your IBM Quantum API credentials to connect to live data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="p-4 bg-muted">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">How to get your credentials:</h4>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://quantum.cloud.ibm.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">IBM Quantum Platform</a></li>
                  <li>Click on your profile → "Account settings"</li>
                  <li>Copy your API Token</li>
                  <li>Go to "Instances" and copy your Service CRN</li>
                </ol>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <div>
              <Label htmlFor="apiKey" className="font-mono">API Token</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your IBM Quantum API token"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
            </div>
            
            <div>
              <Label htmlFor="serviceCrn" className="font-mono">Service CRN</Label>
              <Input
                id="serviceCrn"
                placeholder="crn:v1:bluemix:public:quantum-computing:..."
                value={serviceCrn}
                onChange={(e) => setServiceCrn(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!apiKey.trim() || !serviceCrn.trim()}>
              <Globe className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};