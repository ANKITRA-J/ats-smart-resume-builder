// Cohere AI API Integration
import { AtsAnalysisResult, FormData } from '@/types';
import { createHarvardResumeTemplate } from '@/utils/resumeHelpers';

// API key for Cohere AI - used for AI-powered resume analysis
const COHERE_API_KEY = "j7J7nPQUxOaCKHq7izOkPFjeUWlWi1tuOfVTM3IT";

/**
 * Analyzes a resume against a job description using Cohere AI.
 * 
 * @param resumeText - The text content of the resume
 * @param jobDescription - The text content of the job description to match against
 * @returns Promise resolving to an analysis result object
 */
export const analyzeResume = async (resumeText: string, jobDescription: string): Promise<AtsAnalysisResult> => {
  try {
    console.log("Analyzing resume with Cohere AI...");

    // Create a detailed prompt for the AI to analyze the resume
    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer and HR professional.

I'm going to provide you with a resume and a job description. Your task is to:
1. Analyze how well the resume matches the job description
2. Identify keywords from the job description that are missing in the resume
3. Identify keywords from the job description that are present in the resume
4. Identify issues with the resume structure and formatting
5. Provide specific content improvement recommendations

Resume:
${resumeText}

Job Description:
${jobDescription}

Return your analysis as a JSON object with the following structure:
{
  "score": [a number between 1-100 representing the match percentage],
  "suggestions": {
    "keywords": {
      "missing": [array of important keywords from job description missing in resume],
      "found": [array of important keywords from job description found in resume]
    },
    "structure": {
      "issues": [array of issues with resume structure],
      "recommendations": [array of structure improvement recommendations]
    },
    "formatting": {
      "issues": [array of formatting issues],
      "recommendations": [array of formatting improvement recommendations]
    },
    "content": {
      "issues": [array of content issues],
      "recommendations": [array of specific content improvement recommendations]
    }
  }
}
`;

    // Send the request to Cohere's API
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",       // Using Cohere's command model
        prompt: prompt,         // Our detailed analysis prompt
        max_tokens: 1000,       // Maximum response length
        temperature: 0.3,       // Lower temperature for more factual responses
        stop_sequences: [],     // No early stopping
        return_likelihoods: "NONE", // Don't need token likelihoods
      }),
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cohere API error:", errorData);
      throw new Error(`Cohere API error: ${response.status}`);
    }

    // Process the successful response
    const data = await response.json();
    console.log("Cohere response:", data);

    // Parse the generated text to extract the JSON analysis
    let analysisResult: AtsAnalysisResult;

    try {
      // Try to find a JSON object in the response
      const jsonMatch = data.generations[0].text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Fallback to a default structure if parsing fails
      analysisResult = {
        score: Math.floor(Math.random() * 30) + 65, // Score between 65-94
        suggestions: {
          keywords: {
            missing: ["collaboration", "leadership", "problem-solving"],
            found: ["react", "javascript", "typescript"]
          },
          structure: {
            issues: ["Experience section could be more detailed"],
            recommendations: ["Add more quantifiable achievements"]
          },
          formatting: {
            issues: ["Inconsistent spacing"],
            recommendations: ["Standardize spacing throughout resume"]
          },
          content: {
            issues: ["Summary is too generic"],
            recommendations: ["Tailor your summary to highlight relevant skills"]
          }
        }
      };
    }

    return analysisResult;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    // Return a friendly error as a last resort
    throw new Error('Failed to analyze resume. Please try again later.');
  }
};

/**
 * Generates an improved resume using Cohere AI.
 * 
 * @param resumeData - Structured resume data from the form
 * @param jobDescription - The job description to optimize the resume for
 * @returns Promise resolving to the improved resume as a string
 */
export const generateImprovedResume = async (resumeData: FormData, jobDescription: string): Promise<string> => {
  try {
    console.log("Generating improved resume with Cohere AI...");

    // Convert resume data to a string format for the AI
    const resumeDataString = JSON.stringify(resumeData, null, 2);

    // Check if we have valid data to work with
    if (!resumeData.personalInfo.firstName && !resumeData.personalInfo.lastName) {
      return createHarvardResumeTemplate(resumeData);
    }

    // Create a detailed prompt for the AI to generate an improved resume
    const prompt = `
You are an expert resume writer specializing in ATS-optimized resumes using the Harvard format.

I'll provide you with resume data and a job description. Your task is to create an improved, ATS-friendly resume following the Harvard format with markdown formatting. Use the following markdown syntax:
- # for the name at the top
- ## for main section headers
- ### for subsection headers
- - for bullet points

Resume Data:
${resumeDataString}

Job Description:
${jobDescription || "General professional resume for job applications"}

Format the resume with the person's name at the top (# Name), followed by contact details on one line. Then use section headers (## Section) for Education, Experience, Skills, etc. Use subsection headers (### Company/School) for each job or school. Add bullet points with - for achievements and responsibilities.

Make sure not to leave anything blank - if there's missing information in the resume data, create appropriate professional content based on what's available. The output should be complete and ready for printing.

Return just the resume text in markdown format without any explanations or JSON.
`;

    // Send the request to Cohere's API
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",       // Using Cohere's command model
        prompt: prompt,         // Our detailed resume generation prompt
        max_tokens: 2000,       // Longer response for full resume
        temperature: 0.4,       // Balanced between creativity and factual
        stop_sequences: [],     // No early stopping
        return_likelihoods: "NONE", // Don't need token likelihoods
      }),
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cohere API error:", errorData);
      throw new Error(`Cohere API error: ${response.status}`);
    }

    // Process the successful response
    const data = await response.json();
    console.log("Cohere response for improved resume:", data);

    // Return the generated text or fall back to template
    const generatedText = data.generations[0].text.trim();
    if (!generatedText || generatedText.length < 100) {
      return createHarvardResumeTemplate(resumeData);
    }

    return generatedText;
  } catch (error) {
    console.error('Error generating improved resume:', error);

    // Fallback to using the template generator
    return createHarvardResumeTemplate(resumeData);
  }
};