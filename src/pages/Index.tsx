
import React, { useState } from 'react';
import Header from '@/components/Header';
import ResumeUploader from '@/components/ResumeUploader';
import ResumeForm from '@/components/ResumeForm';
import AtsAnalysis from '@/components/AtsAnalysis';
import ResumePreview from '@/components/ResumePreview';
import { FormData } from '@/types';
import { createEmptyFormData, extractDataFromText } from '@/utils/resumeHelpers';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'create' | 'analyze' | 'preview'>('upload');
  const [resumeText, setResumeText] = useState<string>('');
  const [formData, setFormData] = useState<FormData>(createEmptyFormData());
  const [jobDescription, setJobDescription] = useState<string>('');

  const handleResumeExtracted = (text: string) => {
    setResumeText(text);
    
    // Extract structured data from resume text
    const extractedData = extractDataFromText(text);
    setFormData({
      ...formData,
      ...extractedData
    });
    
    // Move to the analyze tab
    setActiveTab('analyze');
  };

  const handleFormCompleted = () => {
    setActiveTab('analyze');
  };

  const handleImproveResume = () => {
    setActiveTab('preview');
  };

  const handleJobDescriptionChange = (description: string) => {
    setJobDescription(description);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'upload':
        return <ResumeUploader onResumeExtracted={handleResumeExtracted} />;
      case 'create':
        return <ResumeForm formData={formData} setFormData={setFormData} onCompleted={handleFormCompleted} />;
      case 'analyze':
        return (
          <AtsAnalysis 
            resumeText={resumeText} 
            onImproveResume={handleImproveResume} 
            onJobDescriptionChange={handleJobDescriptionChange}
          />
        );
      case 'preview':
        return (
          <ResumePreview 
            formData={formData} 
            jobDescription={jobDescription} 
            resumeText={resumeText} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="pt-24 pb-16">
        {renderActiveTab()}
      </main>
      
      <footer className="bg-muted/40 backdrop-blur-sm border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          Resume Architect — Build ATS-optimized resumes with ease
        </div>
      </footer>
    </div>
  );
};

export default Index;
