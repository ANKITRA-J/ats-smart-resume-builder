
# ATS Smart Resume Builder

## Project Overview

This is a web application designed to create ATS-optimized resumes. It uses AI to analyze your resume against job descriptions and provides suggestions for improvement.

## Features

- Upload and parse existing resumes
- Create new resumes with a structured form
- Analyze resume against job descriptions using AI
- Generate improved resumes optimized for ATS systems
- Export resumes in various formats

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- Cohere AI API for resume analysis

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

## How to Run Locally

```sh
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Building for Production

```sh
# Build the application
npm run build

# Preview the production build
npm run preview
```
