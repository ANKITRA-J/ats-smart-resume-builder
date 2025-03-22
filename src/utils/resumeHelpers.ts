/**
 * Resume Processing Utilities
 * This file contains helper functions for processing resume data
 */

import { v4 as uuidv4 } from 'uuid';
import { FormData, AtsAnalysisResult, FileFormat } from '../types';
import mammoth from 'mammoth';

export const parseResumeFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        reject(new Error('Failed to parse DOCX file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const extractDataFromText = (text: string): Partial<FormData> => {
  // Enhanced text parsing logic
  const sections = text.split('\n\n');
  const data: Partial<FormData> = {
    personalInfo: { firstName: '', lastName: '', email: '', phone: '', location: '' },
    experience: [],
    education: [],
    skills: [],
    summary: ''
  };

  let currentSection = '';
  sections.forEach(section => {
    const lowerSection = section.toLowerCase();
    if (lowerSection.includes('@') && lowerSection.includes('.')) {
      // Parse email and contact info
      const emailMatch = section.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
      const phoneMatch = section.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
      if (emailMatch) data.personalInfo.email = emailMatch[0];
      if (phoneMatch) data.personalInfo.phone = phoneMatch[0];
    } else if (lowerSection.includes('experience') || lowerSection.includes('work')) {
      currentSection = 'experience';
    } else if (lowerSection.includes('education')) {
      currentSection = 'education';
    } else if (lowerSection.includes('skills')) {
      currentSection = 'skills';
      const skillsList = section.replace(/skills:?/i, '').trim();
      data.skills = skillsList.split(/[,;]/).map(skill => skill.trim());
    } else if (currentSection === 'experience' && section.trim()) {
      data.experience.push({
        id: uuidv4(),
        company: section.split('\n')[0] || 'Company Name',
        title: section.split('\n')[1] || 'Position',
        startDate: '',
        endDate: 'Present',
        description: section,
        achievements: section.split('\n').filter(line => line.startsWith('-')).map(line => line.replace('-', '').trim())
      });
    } else if (currentSection === 'education' && section.trim()) {
      data.education.push({
        id: uuidv4(),
        institution: section.split('\n')[0] || 'Institution',
        degree: section.includes('M.S.') ? 'M.S.' : section.includes('B.S.') ? 'B.S.' : 'Degree',
        fieldOfStudy: section.includes('Computer Science') ? 'Computer Science' : 'Field of Study',
        startDate: '',
        endDate: '',
        achievements: []
      });
    }
  });

  return data;
};

export const generateResumeFromJobDescription = (formData: FormData, jobDescription: string): FormData => {
  // Enhanced resume generation based on job description
  const updatedFormData = { ...formData };

  // Customize summary based on job description
  const keywords = jobDescription.toLowerCase().split(' ');
  const relevantSkills = formData.skills.filter(skill => 
    keywords.some(keyword => skill.toLowerCase().includes(keyword))
  );

  updatedFormData.summary = `Experienced professional with expertise in ${relevantSkills.join(', ')}. `;

  // Prioritize relevant experience
  updatedFormData.experience = formData.experience.map(exp => ({
    ...exp,
    achievements: exp.achievements.filter(achievement =>
      keywords.some(keyword => 
        achievement.toLowerCase().includes(keyword)
      )
    )
  }));

  return updatedFormData;
};

export const createEmptyFormData = (): FormData => ({
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  achievements: []
});

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