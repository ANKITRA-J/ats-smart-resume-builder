
import { v4 as uuidv4 } from 'uuid';
import { FormData, AtsAnalysisResult, FileFormat } from '../types';

// Parse resume from uploaded file
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

// Extract structured data from resume text
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

// Create empty form data
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

// Export resume to specified format
export const exportResume = async (
  resumeData: FormData, 
  format: FileFormat,
  template: string
): Promise<string> => {
  // This is a placeholder for actual PDF/DOCX generation
  // In production, you would use jsPDF for PDF and docx for DOCX
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(URL.createObjectURL(new Blob(['Mocked resume file content'], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })));
    }, 1000);
  });
};

// Get ATS score color
export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

// Check if form data is complete
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

// Format date range for display
export const formatDateRange = (startDate: string, endDate: string | 'Present'): string => {
  return `${startDate} - ${endDate}`;
};
