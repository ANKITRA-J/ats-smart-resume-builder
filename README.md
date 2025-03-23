
# ATS Smart Resume Builder

## Project Overview

This is a web application designed to create ATS-optimized resumes. It uses AI to analyze your resume against job descriptions and provides suggestions for improvement.

## Features

- Upload and parse existing resumes
- Create new resumes with a structured form
- Analyze resume against job descriptions using AI
- Generate improved resumes optimized for ATS systems
- Export resumes in DOCX format

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- Cohere AI API for resume analysis and generation

## Code Structure

- `src/components/`: UI components for the application
- `src/pages/`: Page components like Index and NotFound
- `src/lib/`: Utility functions and API integrations
- `src/utils/`: Helper functions for resume processing
- `src/types/`: TypeScript type definitions

## API Integration

The application uses Cohere AI for resume analysis. The AI analyzes the resume against job descriptions and provides feedback on:
- Keyword matches and gaps
- Structure recommendations
- Formatting suggestions
- Content improvements

## Resume Templates

Currently supports:
- Harvard format template (standard professional format)

## How It Works

1. **Upload Resume**: Users can upload their existing resume (DOCX format) or create a new one using the form.
2. **Add Job Description**: Users paste the job description they're applying for.
3. **AI Analysis**: The system analyzes the resume against the job description using Cohere AI.
4. **Optimization**: Based on the analysis, the system suggests improvements and can generate an optimized version.
5. **Export**: Users can download their improved resume in DOCX format.

## Technical Implementation Details

- **Resume Parsing**: Uses `mammoth` to extract text from DOCX files
- **DOCX Generation**: Uses `docx` library to create formatted documents
- **AI Integration**: Connects to Cohere AI API for intelligent analysis and content generation
- **Responsive Design**: Built with mobile-first approach using Tailwind CSS

## Building and Running

```sh
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```
