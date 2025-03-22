
/**
 * Resume Processing Utilities
 * This file contains helper functions for processing resume data
 */

import { v4 as uuidv4 } from 'uuid';
import { FormData, AtsAnalysisResult, FileFormat } from '../types';

/**
 * Parses a resume from an uploaded file
 * @param file - The uploaded file (PDF, DOCX, etc.)
 * @returns Promise resolving to the extracted text content
 */
export const parseResumeFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // This is a placeholder for actual PDF/DOCX parsing
    // In production, you would use pdfjs-dist for PDF and docx for DOCX
    const reader = new FileReader();
    
    reader.onload = () => {
      // Simulate extraction with a mock text
      setTimeout(() => {
        resolve(`
John Doe
Software Engineer

Experience:
Senior Developer at Tech Corp, 2019-Present
- Led development of cloud-based solutions
- Optimized database queries, improving performance by 40%

Education:
M.S. Computer Science, Stanford University, 2016-2018
B.S. Computer Science, MIT, 2012-2016

Skills:
JavaScript, TypeScript, React, Node.js, Python, AWS
        `);
      }, 1000);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Extracts structured data from resume text
 * @param text - Plain text content of the resume
 * @returns Partial FormData object with extracted information
 */
export const extractDataFromText = (text: string): Partial<FormData> => {
  // This is a placeholder for actual text parsing
  // In production, this would use AI to extract structured data
  
  // Mock implementation
  return {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(123) 456-7890',
      location: 'San Francisco, CA',
    },
    experience: [
      {
        id: uuidv4(),
        company: 'Tech Corp',
        title: 'Senior Developer',
        startDate: '2019',
        endDate: 'Present',
        description: 'Led development of cloud-based solutions',
        achievements: [
          'Optimized database queries, improving performance by 40%',
          'Collaborated with cross-functional teams to deliver projects on time',
        ],
      },
    ],
    education: [
      {
        id: uuidv4(),
        institution: 'Stanford University',
        degree: 'M.S.',
        fieldOfStudy: 'Computer Science',
        startDate: '2016',
        endDate: '2018',
        achievements: [],
      },
      {
        id: uuidv4(),
        institution: 'MIT',
        degree: 'B.S.',
        fieldOfStudy: 'Computer Science',
        startDate: '2012',
        endDate: '2016',
        achievements: [],
      },
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS'],
  };
};

/**
 * Creates an empty form data structure
 * @returns Empty FormData object with initial structure
 */
export const createEmptyFormData = (): FormData => {
  return {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
    },
    summary: '',
    experience: [
      {
        id: uuidv4(),
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        achievements: [''],
      },
    ],
    education: [
      {
        id: uuidv4(),
        institution: '',
        degree: '',
        fieldOfStudy: '',
        location: '',
        startDate: '',
        endDate: '',
        gpa: '',
        achievements: [],
      },
    ],
    skills: [],
    certifications: [],
    languages: [],
    projects: [],
  };
};

/**
 * Creates a Harvard format resume from form data
 * @param formData - The structured resume data
 * @returns String with formatted resume content in Markdown
 */
export const createHarvardResumeTemplate = (formData: FormData): string => {
  const { personalInfo, summary, experience, education, skills, certifications, languages, projects } = formData;
  
  // Format full name
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || 'Your Name';
  
  // Format contact line
  const contactParts = [];
  if (personalInfo.location) contactParts.push(personalInfo.location);
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin);
  if (personalInfo.website) contactParts.push(personalInfo.website);
  
  const contactLine = contactParts.length > 0 ? contactParts.join(' • ') : 'Location • Email • Phone';
  
  // Build resume content
  let resumeContent = `# ${fullName}\n${contactLine}\n\n`;

  if (summary) {
    resumeContent += `## Summary\n${summary}\n\n`;
  }

  // Education section
  if (education && education.length > 0) {
    resumeContent += `## Education\n`;
    education.forEach(edu => {
      if (edu.institution) {
        resumeContent += `### ${edu.institution}\n`;
        const degreeInfo = [];
        if (edu.degree) degreeInfo.push(edu.degree);
        if (edu.fieldOfStudy) degreeInfo.push(`in ${edu.fieldOfStudy}`);
        
        const dateRange = [];
        if (edu.startDate) dateRange.push(edu.startDate);
        if (edu.endDate) dateRange.push(edu.endDate);
        
        if (degreeInfo.length > 0) {
          resumeContent += `${degreeInfo.join(' ')}`;
          if (dateRange.length > 0) {
            resumeContent += ` | ${dateRange.join(' - ')}`;
          }
          resumeContent += '\n';
        }
        
        if (edu.location) resumeContent += `${edu.location}\n`;
        if (edu.gpa) resumeContent += `GPA: ${edu.gpa}\n`;
        
        if (edu.achievements && edu.achievements.length > 0 && edu.achievements[0] !== '') {
          edu.achievements.forEach(achievement => {
            if (achievement) resumeContent += `- ${achievement}\n`;
          });
        }
        resumeContent += '\n';
      }
    });
  }

  // Experience section
  if (experience && experience.length > 0) {
    resumeContent += `## Experience\n`;
    experience.forEach(exp => {
      if (exp.company) {
        resumeContent += `### ${exp.company}\n`;
        if (exp.title) {
          resumeContent += `${exp.title}`;
          if (exp.startDate || exp.endDate) {
            resumeContent += ` | ${exp.startDate || ''} - ${exp.endDate || ''}`;
          }
          resumeContent += '\n';
        }
        
        if (exp.location) resumeContent += `${exp.location}\n`;
        if (exp.description) resumeContent += `${exp.description}\n`;
        
        if (exp.achievements && exp.achievements.length > 0 && exp.achievements[0] !== '') {
          exp.achievements.forEach(achievement => {
            if (achievement) resumeContent += `- ${achievement}\n`;
          });
        }
        resumeContent += '\n';
      }
    });
  }

  // Skills section
  if (skills && skills.length > 0) {
    resumeContent += `## Skills\n${skills.join(', ')}\n\n`;
  }

  // Certifications section
  if (certifications && certifications.length > 0) {
    resumeContent += `## Certifications\n`;
    certifications.forEach(cert => {
      if (cert.name) {
        resumeContent += `- ${cert.name}`;
        if (cert.issuer) resumeContent += ` | ${cert.issuer}`;
        if (cert.date) resumeContent += ` | ${cert.date}`;
        resumeContent += '\n';
      }
    });
    resumeContent += '\n';
  }

  // Languages section
  if (languages && languages.length > 0) {
    resumeContent += `## Languages\n`;
    languages.forEach(lang => {
      if (lang.name) {
        resumeContent += `- ${lang.name}`;
        if (lang.proficiency) resumeContent += `: ${lang.proficiency}`;
        resumeContent += '\n';
      }
    });
    resumeContent += '\n';
  }

  // Projects section
  if (projects && projects.length > 0) {
    resumeContent += `## Projects\n`;
    projects.forEach(proj => {
      if (proj.name) {
        resumeContent += `### ${proj.name}\n`;
        if (proj.description) resumeContent += `${proj.description}\n`;
        if (proj.technologies && proj.technologies.length > 0) {
          resumeContent += `Technologies: ${proj.technologies.join(', ')}\n`;
        }
        if (proj.url) resumeContent += `URL: ${proj.url}\n`;
        resumeContent += '\n';
      }
    });
  }

  return resumeContent.trim();
};

/**
 * Exports resume to specified format (PDF/DOCX)
 * @param resumeData - The structured resume data
 * @param format - Output format (pdf/docx)
 * @param template - Optional template string to use instead of generating
 * @returns Promise resolving to URL for downloading
 */
export const exportResume = async (
  resumeData: FormData, 
  format: FileFormat,
  template: string
): Promise<string> => {
  // Use the template string if provided, otherwise generate from the form data
  const resumeContent = template && template.trim() !== '' ? template : createHarvardResumeTemplate(resumeData);
  
  // Convert the markdown content to HTML
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName} Resume</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 1in;
        color: #333;
      }
      h1 {
        font-size: 24pt;
        margin-bottom: 4pt;
        color: #000;
      }
      h2 {
        font-size: 14pt;
        margin-top: 12pt;
        margin-bottom: 4pt;
        border-bottom: 1pt solid #999;
        color: #333;
      }
      h3 {
        font-size: 12pt;
        margin-top: 10pt;
        margin-bottom: 2pt;
        color: #444;
      }
      p {
        margin: 2pt 0;
      }
      ul {
        margin-top: 4pt;
        margin-bottom: 8pt;
      }
      li {
        margin-bottom: 2pt;
      }
      .contact-info {
        margin-bottom: 12pt;
        font-size: 10pt;
      }
    </style>
  </head>
  <body>
    ${resumeContent
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/<li>/g, '<ul><li>')
      .replace(/<\/li>\n/g, '</li></ul>\n')
      .replace(/<h1>(.+)<\/h1>\n(.+)/, '<h1>$1</h1><div class="contact-info">$2</div>')}
  </body>
  </html>
  `;
  
  // For now, create a HTML blob with proper styling
  return new Promise((resolve) => {
    const blob = new Blob([htmlContent], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Return a URL to the blob
    resolve(URL.createObjectURL(blob));
  });
};

/**
 * Gets appropriate color for ATS score display
 * @param score - Numeric score (0-100)
 * @returns CSS color class
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

/**
 * Checks if form data is complete enough to generate a resume
 * @param data - The form data to check
 * @returns Boolean indicating if minimum required fields are filled
 */
export const isFormDataComplete = (data: FormData): boolean => {
  const { personalInfo, experience, education, skills } = data;
  
  if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email || !personalInfo.phone) {
    return false;
  }
  
  if (experience.length === 0 || !experience[0].company || !experience[0].title) {
    return false;
  }
  
  if (education.length === 0 || !education[0].institution || !education[0].degree) {
    return false;
  }
  
  if (skills.length === 0) {
    return false;
  }
  
  return true;
};

/**
 * Formats date range for display
 * @param startDate - Start date string
 * @param endDate - End date string (or 'Present')
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: string, endDate: string | 'Present'): string => {
  return `${startDate} - ${endDate}`;
};
