// Analyzes a developer's natural language prompt for security risks before code generation.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePromptInputSchema = z.object({
  prompt: z
    .string()
    .describe("The developer's natural language prompt for an AI code assistant."),
});
export type AnalyzePromptInput = z.infer<typeof AnalyzePromptInputSchema>;

const SecurityConcernSchema = z.object({
    concern: z.string().describe("A specific security concern identified in the prompt (e.g., 'Risk of SQL Injection')."),
    reason: z.string().describe("A brief explanation of why this part of the prompt is a risk."),
});

const AnalyzePromptOutputSchema = z.object({
  isSecure: z.boolean().describe('Whether the prompt is free of obvious security risks.'),
  concerns: z
    .array(SecurityConcernSchema)
    .describe('A list of potential security concerns identified in the prompt.'),
  revisedPrompt: z
    .string()
    .describe('A revised, more secure version of the prompt that mitigates the identified risks.'),
});
export type AnalyzePromptOutput = z.infer<typeof AnalyzePromptOutputSchema>;

export async function analyzePromptForSecurity(input: AnalyzePromptInput): Promise<AnalyzePromptOutput> {
  return analyzePromptFlow(input);
}

const promptAnalysisPrompt = ai.definePrompt({
  name: 'promptAnalysisPrompt',
  input: {schema: AnalyzePromptInputSchema},
  output: {schema: AnalyzePromptOutputSchema},
  prompt: `You are a Senior Principal Security Engineer acting as a "Prompt Guardian."
  Your mission is to analyze a developer's natural language prompt intended for an AI code generation assistant.
  Your goal is to identify potential security vulnerabilities that could arise from how the prompt is phrased BEFORE any code is generated.

  Analyze the following prompt:
  "{{{prompt}}}"

  Look for ambiguities or omissions that could lead to common vulnerabilities, such as:
  - Vague data handling (e.g., "save user data" without mentioning validation or sanitization).
  - Unspecified authentication/authorization (e.g., "create an endpoint to get user details" without mentioning who can access it).
  - Implicit trust in user input (e.g., "build a search function based on user query" without mentioning parameterized queries or escaping).
  - Not specifying secure defaults (e.g., "create a file upload function" without mentioning file type/size limits or virus scanning).
  - Mentioning outdated or insecure practices (e.g., "use MD5 for passwords").

  Based on your analysis:
  1. Determine if the prompt is secure. A prompt is insecure if it has any identified concerns.
  2. List the specific security concerns and explain the reasoning for each. If there are no concerns, return an empty array.
  3. Rewrite the prompt to be more specific and security-conscious, guiding the AI to generate safer code. The revised prompt should be a direct instruction to an AI.

  Return your analysis in the specified JSON format.
  `,
});

const analyzePromptFlow = ai.defineFlow(
  {
    name: 'analyzePromptFlow',
    inputSchema: AnalyzePromptInputSchema,
    outputSchema: AnalyzePromptOutputSchema,
  },
  async input => {
    const {output} = await promptAnalysisPrompt(input);
    return output!;
  }
);
