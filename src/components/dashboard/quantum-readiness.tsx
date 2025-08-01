"use client";

import { useState } from 'react';
import { Atom, ShieldCheck, ShieldAlert, Loader, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { detectQuantumVulnerabilities, type DetectQuantumVulnerabilitiesOutput } from '@/ai/flows/detect-quantum-vulnerabilities';
import { useToast } from "@/hooks/use-toast";

const sampleVulnerableQuantumCode = `
// Using a classical algorithm vulnerable to quantum attacks
import { createSign } from 'crypto';

const privateKey = '...'; // Your private RSA key
const data = 'some data to sign';

const sign = createSign('SHA256');
sign.update(data);
sign.end();
const signature = sign.sign(privateKey, 'hex');

console.log("Using RSA signature:", signature);
`;

export function QuantumReadiness() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectQuantumVulnerabilitiesOutput | null>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some code to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const analysisResult = await detectQuantumVulnerabilities({ code });
      setResult(analysisResult);
    } catch (error) {
      console.error('Quantum analysis failed:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not complete the quantum readiness analysis.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleCode = () => {
    setCode(sampleVulnerableQuantumCode);
    toast({
      title: "Sample Code Loaded",
      description: "Loaded an example of code using an algorithm vulnerable to quantum attacks.",
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Atom className="text-primary w-8 h-8" />
          <h1 className="text-3xl font-bold">Quantum Readiness</h1>
        </div>
        <p className="text-muted-foreground">
          Analyze code for quantum vulnerabilities and ensure compliance with post-quantum cryptography (PQC) standards.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Code to Analyze</CardTitle>
              <CardDescription>Enter code to check for quantum-related security risks.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadSampleCode}>Load Sample</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-[250px] font-code text-sm"
            disabled={isLoading}
          />
          <Button onClick={handleScan} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze for Quantum Risks'
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Quantum Readiness Report</CardTitle>
            <CardDescription>{result.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.isQuantumSafe ? (
              <Alert variant="default" className="border-green-500/50 bg-green-500/10">
                <ShieldCheck className="h-4 w-4 !text-green-500" />
                <AlertTitle>Quantum Safe</AlertTitle>
                <AlertDescription>
                  This code does not appear to use classical cryptography vulnerable to known quantum attacks.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Quantum Risks Identified</AlertTitle>
                <AlertDescription>
                  This code may be vulnerable to future quantum attacks. See details below.
                </AlertDescription>
              </Alert>
            )}

            {result.report && result.report.length > 0 && (
                 <div className="space-y-4">
                    {result.report.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-muted/50">
                            <p className="font-semibold text-foreground flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-yellow-500" />
                                {item.category}: {item.vulnerability}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2"><strong className="text-foreground">Recommendation:</strong> {item.recommendation}</p>
                            <pre className="mt-2 bg-background p-2 rounded-md font-code text-xs overflow-x-auto">
                                <code>{item.codeSnippet}</code>
                            </pre>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
