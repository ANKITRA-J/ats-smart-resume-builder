
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  CheckCircle2,
  FileOutput
} from 'lucide-react';
import { FormData, FileFormat } from '@/types';
import { exportResume } from '@/utils/resumeHelpers';
import { generateImprovedResume } from '@/lib/api';

interface ResumePreviewProps {
  formData: FormData;
  jobDescription?: string;
  resumeText?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  formData, 
  jobDescription = '',
  resumeText = ''
}) => {
  const [fileFormat, setFileFormat] = useState<FileFormat>('pdf');
  const [template, setTemplate] = useState<string>('harvard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [improvedContent, setImprovedContent] = useState<string>('');

  const handleGenerateImprovedResume = async () => {
    setIsGenerating(true);
    
    try {
      const content = await generateImprovedResume(formData, jobDescription);
      setImprovedContent(content);
    } catch (error) {
      console.error('Error generating improved resume:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportResume = async () => {
    setIsExporting(true);
    
    try {
      const fileUrl = await exportResume(formData, fileFormat, template);
      
      // Create an anchor and trigger download
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = `${formData.personalInfo.firstName}_${formData.personalInfo.lastName}_Resume.${fileFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting resume:', error);
    } finally {
      setIsExporting(false);
    }
  };

  React.useEffect(() => {
    if (formData && !improvedContent) {
      handleGenerateImprovedResume();
    }
  }, [formData]);

  return (
    <div className="w-full animate-fade-in">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 animate-slide-up">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Your Resume</h2>
          <p className="text-muted-foreground">
            Preview and download your ATS-optimized resume
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Format & Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Choose Template</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant={template === 'harvard' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTemplate('harvard')}
                      className="justify-start"
                    >
                      <CheckCircle2 className={`h-4 w-4 mr-2 ${
                        template === 'harvard' ? 'opacity-100' : 'opacity-0'
                      }`} />
                      Harvard Template
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">File Format</h4>
                  <div className="flex gap-2">
                    <Button
                      variant={fileFormat === 'pdf' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFileFormat('pdf')}
                      className="flex-1"
                    >
                      PDF
                    </Button>
                    <Button
                      variant={fileFormat === 'docx' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFileFormat('docx')}
                      className="flex-1"
                    >
                      DOCX
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={handleExportResume} 
                  disabled={isExporting}
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Resume
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleGenerateImprovedResume}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <FileOutput className="mr-2 h-4 w-4" />
                      Regenerate Resume
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                    Resume Preview
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white text-black border rounded-md p-6 shadow-sm min-h-[70vh] overflow-y-auto prose prose-sm max-w-none">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full mb-4" />
                        <p>Generating your resume...</p>
                      </div>
                    </div>
                  ) : improvedContent ? (
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: improvedContent.replace(/\n/g, '<br>').replace(/^#+\s*(.*)/gm, '<h3>$1</h3>').replace(/^###\s*(.*)/gm, '<h4>$1</h4>').replace(/^\*\s*(.*)/gm, '<li>$1</li>').replace(/^-\s*(.*)/gm, '<li>$1</li>') }} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>No content to preview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
