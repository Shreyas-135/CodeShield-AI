# **App Name**: CodeShield AI

## Core Features:

- AI Vulnerability Detection: Uses an LLM-powered tool to detect vulnerabilities specific to AI-generated code.
- Plain English Explanation: Generates human-readable descriptions of each vulnerability, including potential risks and the location in the code using the LLM tool.
- AI-Suggested Fix: The LLM generates secure alternative code, adhering to best practices, to fix detected vulnerabilities. It will also use reasoning to determine when insecure defaults have been added.
- Vulnerability Report Dashboard: Web dashboard providing vulnerability reports and fix suggestions, sortable by file or issue type.
- GitHub PR Integration: Automates scanning of GitHub PRs, posting findings as comments for immediate feedback. Integration uses the Github API.
- Malware Detection: Using a tool which relies on a fine-tuned LLM to detect potential trojan horses and viruses in the codebase, scanning for patterns indicative of malicious intent. The tool will focus on file uploads and new dependencies.
- Phishing Detection: LLM scans emails and code comments in repo looking for indicators of phishing such as requests to disable security features, or for credentials. The tool analyzes text for sentiment and potential security implications.

## Style Guidelines:

- Primary color: Deep sky blue (#00BFFF), a bright and confident blue that aligns with technological innovation.
- Background color: Light cyan (#E0FFFF), a desaturated tone that provides a calm, clean backdrop.
- Accent color: Electric indigo (#6F00FF), offers contrast to highlight interactive elements.
- Body and headline font: 'Inter', a sans-serif font with a modern, machined look suitable for headlines or body text.
- Code font: 'Source Code Pro', a monospaced font for displaying code snippets.
- Icons: Clean, geometric icons that visually represent each vulnerability type. 
- Dashboard: A dashboard layout to present findings, featuring sortable tables and visual summaries of detected vulnerabilities.