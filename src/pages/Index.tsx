
import React, { useState } from 'react';
import Header from '@/components/Header';
import ResumeUploader from '@/components/ResumeUploader';
import ResumeForm from '@/components/ResumeForm';
import AtsAnalysis from '@/components/AtsAnalysis';
import ResumePreview from '@/components/ResumePreview';
import { FormData } from '@/types';
import { createEmptyFormData, extractDataFromText } from '@/utils/resumeHelpers';
import { Github, Heart } from 'lucide-react';

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
        <div className="container mx-auto mb-8 flex justify-center">
          <div className="w-24 h-24">
            <img src="/lovable-uploads/a9f48c99-3bed-4161-8976-0f4ce4dbafb7.png" alt="AI Resume Logo" className="w-full h-full" />
          </div>
        </div>
        {renderActiveTab()}
      </main>
      
      <footer className="bg-muted/40 backdrop-blur-sm border-t py-4 text-center text-sm text-muted-foreground fixed bottom-0 w-full">
        <div className="container mx-auto flex items-center justify-center space-x-2">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500 animate-pulse" />
          <span>by Lakshay</span>
          <a 
            href="https://github.com/isthatlak" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center ml-2 hover:text-primary transition-colors"
          >
            <Github className="h-4 w-4 mr-1" />
            <span>GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
