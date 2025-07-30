// This file defines a Genkit flow for suggesting secure fixes for detected vulnerabilities using AI.

'use server';

/**
 * @fileOverview A flow that suggests secure fixes for detected vulnerabilities.
 *
 * - suggestFix - A function that suggests secure fixes for a given code snippet and vulnerability description.
 * - SuggestFixInput - The input type for the suggestFix function.
 * - SuggestFixOutput - The return type for the suggestFix function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFixInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet containing the vulnerability.'),
  vulnerabilityDescription: z.string().describe('A description of the detected vulnerability.'),
});
export type SuggestFixInput = z.infer<typeof SuggestFixInputSchema>;

const SuggestFixOutputSchema = z.object({
  suggestedFix: z.string().describe('A secure alternative code snippet to fix the vulnerability.'),
  explanation: z.string().describe('An explanation of why the suggested fix is secure and how it addresses the vulnerability.'),
});
export type SuggestFixOutput = z.infer<typeof SuggestFixOutputSchema>;

export async function suggestFix(input: SuggestFixInput): Promise<SuggestFixOutput> {
  return suggestFixFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFixPrompt',
  input: {schema: SuggestFixInputSchema},
  output: {schema: SuggestFixOutputSchema},
  prompt: `You are a security expert specializing in identifying and fixing vulnerabilities in AI-generated code.

You will be provided with a code snippet and a description of a vulnerability. Your task is to:
1.  Generate a secure alternative code snippet that fixes the vulnerability.
2.  Explain why the suggested fix is secure and how it addresses the vulnerability, adhering to OWASP best practices.

Code Snippet:
'''
{{codeSnippet}}
'''

Vulnerability Description:
{{vulnerabilityDescription}}
`,
});

const suggestFixFlow = ai.defineFlow(
  {
    name: 'suggestFixFlow',
    inputSchema: SuggestFixInputSchema,
    outputSchema: SuggestFixOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
