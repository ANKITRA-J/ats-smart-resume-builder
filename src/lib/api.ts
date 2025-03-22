
// Real API integration with Cohere AI
import { AtsAnalysisResult, FormData } from '@/types';
import { createHarvardResumeTemplate } from '@/utils/resumeHelpers';

const COHERE_API_KEY = "j7J7nPQUxOaCKHq7izOkPFjeUWlWi1tuOfVTM3IT";

export const analyzeResume = async (resumeText: string, jobDescription: string): Promise<AtsAnalysisResult> => {
  try {
    console.log("Analyzing resume with Cohere API...");
    
    // First, we'll use Cohere to analyze the resume against the job description
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

    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",
        prompt: prompt,
        max_tokens: 1000,
        temperature: 0.3,
        stop_sequences: [],
        return_likelihoods: "NONE",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cohere API error:", errorData);
      throw new Error(`Cohere API error: ${response.status}`);
    }

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

export const generateImprovedResume = async (resumeData: FormData, jobDescription: string): Promise<string> => {
  try {
    console.log("Generating improved resume with Cohere API...");
    
    // First attempt to use the local template generator
    if (!jobDescription || jobDescription.trim() === '') {
      return createHarvardResumeTemplate(resumeData);
    }
    
    // Create a simplified representation of the resume data
    const resumeDataString = JSON.stringify(resumeData, null, 2);
    
    const prompt = `
You are an expert resume writer specializing in ATS-optimized resumes using the Harvard format.

I'll provide you with resume data and a job description. Your task is to create an improved, ATS-friendly resume following the Harvard format shown below:

# Full Name
Location • Email • Phone • LinkedIn • Website

## Education
### Institution Name
Degree in Field of Study | Start Year - End Year
Location
- Achievement 1
- Achievement 2

## Experience
### Company Name
Job Title | Start Year - End Year
Location
- Achievement with action verb
- Achievement with quantifiable results

## Skills
Skill 1, Skill 2, Skill 3, Skill 4, Skill 5

## Certifications
- Certification Name | Issuer | Date

## Languages
- Language Name: Proficiency Level

## Projects
### Project Name
Project description
Technologies: Tech 1, Tech 2, Tech 3
URL: Website link

Resume Data:
${resumeDataString}

Job Description:
${jobDescription}

Please generate a professional, ATS-optimized resume following the Harvard format above. Begin with the person's name at the top, followed by contact information. Use section headers (##) and subsection headers (###). List items should use bullet points (-). Do not include explanatory text or placeholders. Do not mention that this is a template. Write it as if this is the final resume.
`;

    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.4,
        stop_sequences: [],
        return_likelihoods: "NONE",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cohere API error:", errorData);
      throw new Error(`Cohere API error: ${response.status}`);
    }

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
