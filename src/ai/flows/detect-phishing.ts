// Detects phishing indicators in emails and code comments.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PhishingDetectionInputSchema = z.object({
  text: z
    .string()
    .describe("The text to scan for phishing indicators. This could be an email or a code comment."),
});
export type PhishingDetectionInput = z.infer<typeof PhishingDetectionInputSchema>;

const PhishingDetectionOutputSchema = z.object({
  isPhishing: z.boolean().describe('Whether or not the input text is likely a phishing attempt.'),
  confidence: z
    .number()
    .describe('A score between 0 and 1 indicating the confidence level of the phishing detection.'),
  reason: z
    .string()
    .describe('The reason why the input text is classified as phishing, if applicable.'),
});
export type PhishingDetectionOutput = z.infer<typeof PhishingDetectionOutputSchema>;

export async function detectPhishing(input: PhishingDetectionInput): Promise<PhishingDetectionOutput> {
  return detectPhishingFlow(input);
}

const phishingDetectionPrompt = ai.definePrompt({
  name: 'phishingDetectionPrompt',
  input: {schema: PhishingDetectionInputSchema},
  output: {schema: PhishingDetectionOutputSchema},
  prompt: `You are a security expert specializing in detecting phishing attempts.

  Analyze the following text and determine if it is a phishing attempt.

  Provide a confidence score between 0 and 1, where 0 indicates no chance of phishing and 1 indicates a very high chance of phishing.
  If the text is classified as phishing, explain the reasoning behind the classification.

  Text: {{{text}}}
  `,
});

const detectPhishingFlow = ai.defineFlow(
  {
    name: 'detectPhishingFlow',
    inputSchema: PhishingDetectionInputSchema,
    outputSchema: PhishingDetectionOutputSchema,
  },
  async input => {
    const {output} = await phishingDetectionPrompt(input);
    return output!;
  }
);
