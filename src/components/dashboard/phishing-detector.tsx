"use client";

import { useState } from 'react';
import { Mail, ShieldCheck, ShieldAlert, Loader, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { detectPhishing, type PhishingDetectionOutput } from '@/ai/flows/detect-phishing';
import { useToast } from "@/hooks/use-toast"

export function PhishingDetector() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PhishingDetectionOutput | null>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text to scan.",
      })
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const scanResult = await detectPhishing({ text });
      setResult(scanResult);
    } catch (error) {
      console.error('Phishing detection failed:', error);
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: "Could not complete the phishing scan. Please try again.",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="text-primary w-8 h-8" />
          <h1 className="text-3xl font-bold">Phishing Detector</h1>
        </div>
        <p className="text-muted-foreground">
          Scan emails and code comments for phishing indicators. Analyzes text for suspicious requests and security implications.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Text to Scan</CardTitle>
          <CardDescription>Paste an email, comment, or any text to check for phishing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[250px] text-sm"
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <Button onClick={handleScan} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Scan for Phishing'
              )}
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={isLoading || !text}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result.isPhishing ? (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Phishing Attempt Detected!</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div>
                    <p className="font-semibold">Confidence:</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={result.confidence * 100} className="w-[60%]" />
                      <span>{Math.round(result.confidence * 100)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">Reason:</p>
                    <p>{result.reason}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Looks Safe</AlertTitle>
                <AlertDescription className="space-y-2">
                    <div>
                        <p className="font-semibold">Confidence (Not Phishing):</p>
                        <div className="flex items-center gap-2 mt-1">
                        <Progress value={(1 - result.confidence) * 100} />
                        <span>{Math.round((1 - result.confidence) * 100)}%</span>
                        </div>
                    </div>
                    <p>{result.reason || "Our scan did not find any indicators of phishing."}</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
