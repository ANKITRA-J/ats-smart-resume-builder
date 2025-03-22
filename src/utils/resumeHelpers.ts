/**
 * Resume Processing Utilities
 * This file contains helper functions for processing resume data
 */

import { v4 as uuidv4 } from 'uuid';
import { FormData, AtsAnalysisResult, FileFormat } from '../types';
import mammoth from 'mammoth';
import docx from 'docx';
import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import { Packer } from 'docx';

export const parseResumeFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ 
          arrayBuffer,
          includeDefaultStyleMap: true,
          preserveEmpty: true
        });
        
        if (!result.value) {
          throw new Error('No content extracted from file');
        }

        console.log('Extracted resume content:', result.value);
        resolve(result.value);
      } catch (error) {
        console.error('DOCX parsing error:', error);
        reject(new Error(`Failed to parse DOCX file: ${error.message}`));
      }
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
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

export const createDocxDocument = (formData: FormData) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun(`${formData.personalInfo.email} | ${formData.personalInfo.phone} | ${formData.personalInfo.location}`),
          ],
        }),
        new Paragraph({
          text: "Professional Summary",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: formData.summary,
        }),
        new Paragraph({
          text: "Experience",
          heading: HeadingLevel.HEADING_2,
        }),
        ...formData.experience.map(exp => [
          new Paragraph({
            children: [
              new TextRun({
                text: exp.title,
                bold: true,
              }),
              new TextRun(" at "),
              new TextRun({
                text: exp.company,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            text: `${exp.startDate} - ${exp.endDate}`,
            style: "italic",
          }),
          new Paragraph({
            text: exp.description,
          }),
        ]).flat(),
        new Paragraph({
          text: "Education",
          heading: HeadingLevel.HEADING_2,
        }),
        ...formData.education.map(edu => [
          new Paragraph({
            children: [
              new TextRun({
                text: edu.degree,
                bold: true,
              }),
              new TextRun(" - "),
              new TextRun({
                text: edu.institution,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            text: `${edu.startDate} - ${edu.endDate}`,
            style: "italic",
          }),
        ]).flat(),
        new Paragraph({
          text: "Skills",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: formData.skills.join(", "),
        }),
      ],
    }],
  });

  return doc;
};

export const exportResume = async (formData: FormData): Promise<Blob> => {
  const doc = createDocxDocument(formData);
  const blob = await Packer.toBlob(doc);
  return blob;
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