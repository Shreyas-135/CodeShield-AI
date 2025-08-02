"use client";

import { useState } from 'react';
import { Bot, CheckCircle, AlertTriangle, Loader, Lightbulb, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzePromptForSecurity, type AnalyzePromptOutput } from '@/ai/flows/analyze-prompt';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '../ui/badge';

export function PromptGuardian() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzePromptOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const analysisResult = await analyzePromptForSecurity({ prompt });
      setResult(analysisResult);
    } catch (error) {
      console.error('Prompt analysis failed:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not complete the prompt analysis. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResult(null);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Bot className="text-primary w-8 h-8" />
          <h1 className="text-3xl font-bold">Prompt Guardian</h1>
        </div>
        <p className="text-muted-foreground">
          Analyze developer prompts in real-time to warn about security risks before AI generates any code.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Developer Prompt to Analyze</CardTitle>
          <CardDescription>Enter the natural language prompt you would give to an AI code assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., 'Create a function that takes a user ID and returns their profile page.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[150px] text-sm"
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <Button onClick={handleAnalyze} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Prompt'
              )}
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={isLoading || !prompt}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Prompt Analysis Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.isSecure ? (
              <Alert variant="default" className="border-green-500/50 bg-green-500/10">
                <ShieldCheck className="h-4 w-4 !text-green-500" />
                <AlertTitle>Prompt Appears Secure</AlertTitle>
                <AlertDescription>
                  This prompt is well-defined and includes security considerations.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Potential Risks Identified</AlertTitle>
                <AlertDescription>
                  This prompt is ambiguous and could lead to insecure code generation.
                </AlertDescription>
              </Alert>
            )}

            {result.concerns && result.concerns.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-500" />Security Concerns</h3>
                    {result.concerns.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-muted/50">
                            <p className="font-semibold text-foreground">{item.concern}</p>
                            <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" />Revised & Secured Prompt</h3>
                 <div className="p-4 border-dashed border-2 rounded-lg">
                    <p className="text-sm text-foreground leading-relaxed">{result.revisedPrompt}</p>
                </div>
                <p className="text-xs text-muted-foreground">Use this revised prompt to guide the AI towards generating more secure and robust code.</p>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
