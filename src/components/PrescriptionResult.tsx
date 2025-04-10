import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Check, X, FileText, Briefcase, Code, GraduationCap, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  context?: string;
}

export interface ExperienceAnalysis {
  years: string;
  relevance: string;
  score: number;
}

export interface TechStackAnalysis {
  tech: string;
  found: boolean;
  expertise?: string;
}

export interface EducationAnalysis {
  degreeFound: boolean;
  relevance: string;
  score: number;
}

export interface ResumeAnalysisResult {
  overallScore: number;
  keywordMatches: KeywordMatch[];
  experienceAnalysis: ExperienceAnalysis;
  techStackAnalysis: TechStackAnalysis[];
  educationAnalysis: EducationAnalysis;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  summaryFeedback: string;
}

// Keep backward compatibility for prescription data
export interface PrescriptionInfo extends Partial<ResumeAnalysisResult> {
  medications?: string[];
  dosage?: string;
  frequency?: string;
  duration?: string;
  specialInstructions?: string;
  doctorName?: string;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  patientDisease?: string;
  diagnosisExplanation?: string;
  medicationInstructions?: string;
  date?: string;
  rawText?: string;
}

interface PrescriptionResultProps {
  prescriptionInfo: PrescriptionInfo | null;
  isLoading: boolean;
  language: string;
  onLanguageChange: (language: string) => void;
}

const PrescriptionResult: React.FC<PrescriptionResultProps> = ({ 
  prescriptionInfo, 
  isLoading,
  language,
  onLanguageChange
}) => {
  const analysisResult = prescriptionInfo as ResumeAnalysisResult;
  
  const handleCopyToClipboard = () => {
    if (!prescriptionInfo) return;
    
    let textToCopy = "";
    
    if (analysisResult.overallScore !== undefined) {
      // Resume analysis result
      textToCopy = `Resume Analysis Score: ${analysisResult.overallScore}%\n\n`;
      textToCopy += `Strengths:\n${analysisResult.strengths?.join('\n')}\n\n`;
      textToCopy += `Areas for Improvement:\n${analysisResult.weaknesses?.join('\n')}\n\n`;
      textToCopy += `Suggestions:\n${analysisResult.improvementSuggestions?.join('\n')}\n\n`;
      textToCopy += `Summary:\n${analysisResult.summaryFeedback}`;
    } else {
      // Handle old prescription format for backward compatibility
      textToCopy = `Date: ${prescriptionInfo.date || 'Not specified'}\n`;
      textToCopy += `Doctor: ${prescriptionInfo.doctorName || 'Not specified'}\n`;
      textToCopy += `Patient: ${prescriptionInfo.patientName || 'Not specified'}\n`;
      textToCopy += `Age: ${prescriptionInfo.patientAge || 'Not specified'}\n`;
      textToCopy += `Gender: ${prescriptionInfo.patientGender || 'Not specified'}\n`;
      textToCopy += `Diagnosis: ${prescriptionInfo.patientDisease || 'Not specified'}\n\n`;
      
      textToCopy += "Medications:\n";
      if (prescriptionInfo.medications && prescriptionInfo.medications.length > 0) {
        prescriptionInfo.medications.forEach((medication, index) => {
          textToCopy += `${index + 1}. ${medication}\n`;
        });
      } else {
        textToCopy += "None specified\n";
      }
      
      textToCopy += `\nDosage: ${prescriptionInfo.dosage || 'Not specified'}\n`;
      textToCopy += `Frequency: ${prescriptionInfo.frequency || 'Not specified'}\n`;
      textToCopy += `Duration: ${prescriptionInfo.duration || 'Not specified'}\n`;
      textToCopy += `Special Instructions: ${prescriptionInfo.specialInstructions || 'None'}\n`;
    }
    
    navigator.clipboard.writeText(textToCopy);
  };
  
  if (isLoading) {
    return (
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-8 w-24" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-full" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!prescriptionInfo) return null;

  // Check if we have resume analysis data
  const isResumeAnalysis = analysisResult.overallScore !== undefined;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLanguageChange("english")}
            className={language === "english" ? "bg-gray-200" : ""}
          >
            English
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLanguageChange("hindi")}
            className={language === "hindi" ? "bg-gray-200" : ""}
          >
            हिंदी
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
          {language === "hindi" ? "कॉपी करें" : "Copy Results"}
        </Button>
      </div>

      {isResumeAnalysis ? (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                {language === "hindi" ? "रिज्यूमे स्कोर" : "Resume Score"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{analysisResult.overallScore}%</span>
                <Badge 
                  variant={analysisResult.overallScore >= 70 ? "default" : 
                          analysisResult.overallScore >= 50 ? "outline" : "destructive"}
                >
                  {analysisResult.overallScore >= 70 ? (language === "hindi" ? "उत्कृष्ट" : "Excellent") : 
                   analysisResult.overallScore >= 50 ? (language === "hindi" ? "अच्छा" : "Good") : 
                   (language === "hindi" ? "सुधार की आवश्यकता" : "Needs Improvement")}
                </Badge>
              </div>
            </div>
            <CardDescription>
              {language === "hindi" 
                ? "आपके रिज्यूमे का विस्तृत विश्लेषण"
                : "Comprehensive analysis of your resume"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="overview">
                  {language === "hindi" ? "अवलोकन" : "Overview"}
                </TabsTrigger>
                <TabsTrigger value="keywords">
                  {language === "hindi" ? "कीवर्ड" : "Keywords"}
                </TabsTrigger>
                <TabsTrigger value="details">
                  {language === "hindi" ? "विस्तृत विश्लेषण" : "Details"}
                </TabsTrigger>
                <TabsTrigger value="recommendations">
                  {language === "hindi" ? "सुझाव" : "Recommendations"}
                </TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="p-4 space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      {language === "hindi" ? "कुल स्कोर" : "Overall Score"}
                    </h3>
                    <div className="mt-2">
                      <Progress value={analysisResult.overallScore} className="h-3" />
                      <div className="flex justify-between text-xs mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        {language === "hindi" ? "अनुभव" : "Experience"}
                      </h4>
                      <Progress value={analysisResult.experienceAnalysis.score} className="h-2 mt-2" />
                      <p className="text-sm mt-2">{analysisResult.experienceAnalysis.relevance}</p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Code className="h-4 w-4 text-green-500" />
                        {language === "hindi" ? "तकनीकी कौशल" : "Technical Skills"}
                      </h4>
                      <Progress 
                        value={analysisResult.techStackAnalysis.filter(t => t.found).length / 
                              Math.max(1, analysisResult.techStackAnalysis.length) * 100} 
                        className="h-2 mt-2" 
                      />
                      <p className="text-sm mt-2">
                        {analysisResult.techStackAnalysis.filter(t => t.found).length} / {analysisResult.techStackAnalysis.length} {language === "hindi" ? "तकनीकी कौशल मिले" : "technologies matched"}
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        {language === "hindi" ? "शिक्षा" : "Education"}
                      </h4>
                      <Progress value={analysisResult.educationAnalysis.score} className="h-2 mt-2" />
                      <p className="text-sm mt-2">{analysisResult.educationAnalysis.relevance}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="font-medium">
                      {language === "hindi" ? "सारांश" : "Summary"}
                    </h3>
                    <p className="text-sm mt-2">{analysisResult.summaryFeedback}</p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Keywords Tab */}
              <TabsContent value="keywords" className="p-4">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {language === "hindi" ? "कीवर्ड मिलान" : "Keyword Matches"}
                  </h3>
                  
                  <div className="space-y-2">
                    {analysisResult.keywordMatches.map((match, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 border-b">
                        {match.found ? (
                          <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium">{match.keyword}</div>
                          {match.context && <p className="text-sm text-gray-600">{match.context}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Details Tab */}
              <TabsContent value="details" className="p-4 space-y-6">
                {/* Experience Section */}
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    {language === "hindi" ? "अनुभव विश्लेषण" : "Experience Analysis"}
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {language === "hindi" ? "वर्ष अनुभव" : "Years of Experience"}
                      </span>
                      <span>{analysisResult.experienceAnalysis.years}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-medium">
                        {language === "hindi" ? "प्रासंगिकता" : "Relevance"}
                      </span>
                      <p className="text-sm mt-1">{analysisResult.experienceAnalysis.relevance}</p>
                    </div>
                  </div>
                </div>
                
                {/* Tech Stack Section */}
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Code className="h-4 w-4 text-green-500" />
                    {language === "hindi" ? "तकनीकी कौशल विश्लेषण" : "Technical Skills Analysis"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysisResult.techStackAnalysis.map((tech, index) => (
                      <div key={index} className="p-2 border rounded-lg flex items-start gap-2">
                        {tech.found ? (
                          <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium">{tech.tech}</div>
                          {tech.expertise && <p className="text-xs">{tech.expertise}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Education Section */}
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    {language === "hindi" ? "शिक्षा विश्लेषण" : "Education Analysis"}
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {language === "hindi" ? "आवश्यक डिग्री" : "Required Degree"}
                      </span>
                      <Badge variant={analysisResult.educationAnalysis.degreeFound ? "default" : "destructive"}>
                        {analysisResult.educationAnalysis.degreeFound ? 
                          (language === "hindi" ? "मिला" : "Found") : 
                          (language === "hindi" ? "नहीं मिला" : "Not Found")}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-medium">
                        {language === "hindi" ? "प्रासंगिकता" : "Relevance"}
                      </span>
                      <p className="text-sm mt-1">{analysisResult.educationAnalysis.relevance}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium text-green-600">
                    {language === "hindi" ? "ताकत" : "Strengths"}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-amber-600">
                    {language === "hindi" ? "सुधार क्षेत्र" : "Areas for Improvement"}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {analysisResult.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <X className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-blue-600">
                    {language === "hindi" ? "सुझाव" : "Suggestions"}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {analysisResult.improvementSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Star className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        // Render the original prescription format for backward compatibility
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "hindi" ? "प्रिस्क्रिप्शन विश्लेषण" : "Prescription Analysis"}
            </CardTitle>
            <CardDescription>
              {prescriptionInfo.date ? 
                `${language === "hindi" ? "दिनांक" : "Date"}: ${prescriptionInfo.date}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescriptionInfo.medications && prescriptionInfo.medications.length > 0 && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "दवाइयाँ" : "Medications"}
                </h3>
                <ul>
                  {prescriptionInfo.medications.map((medication, index) => (
                    <li key={index}>{medication}</li>
                  ))}
                </ul>
              </div>
            )}
            {prescriptionInfo.dosage && (
              <div>
                <h3 className="font-medium">{language === "hindi" ? "खुराक" : "Dosage"}</h3>
                <p>{prescriptionInfo.dosage}</p>
              </div>
            )}
            {prescriptionInfo.frequency && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "बारंबारता" : "Frequency"}
                </h3>
                <p>{prescriptionInfo.frequency}</p>
              </div>
            )}
            {prescriptionInfo.duration && (
              <div>
                <h3 className="font-medium">{language === "hindi" ? "अवधि" : "Duration"}</h3>
                <p>{prescriptionInfo.duration}</p>
              </div>
            )}
            {prescriptionInfo.specialInstructions && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "विशेष निर्देश" : "Special Instructions"}
                </h3>
                <p>{prescriptionInfo.specialInstructions}</p>
              </div>
            )}
            {prescriptionInfo.doctorName && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "डॉक्टर का नाम" : "Doctor's Name"}
                </h3>
                <p>{prescriptionInfo.doctorName}</p>
              </div>
            )}
            {prescriptionInfo.patientName && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "मरीज का नाम" : "Patient's Name"}
                </h3>
                <p>{prescriptionInfo.patientName}</p>
              </div>
            )}
            {prescriptionInfo.patientAge && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "मरीज की उम्र" : "Patient's Age"}
                </h3>
                <p>{prescriptionInfo.patientAge}</p>
              </div>
            )}
            {prescriptionInfo.patientGender && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "मरीज का लिंग" : "Patient's Gender"}
                </h3>
                <p>{prescriptionInfo.patientGender}</p>
              </div>
            )}
             {prescriptionInfo.patientDisease && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "मरीज की बीमारी" : "Patient's Disease"}
                </h3>
                <p>{prescriptionInfo.patientDisease}</p>
              </div>
            )}
            {prescriptionInfo.diagnosisExplanation && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "निदान स्पष्टीकरण" : "Diagnosis Explanation"}
                </h3>
                <p>{prescriptionInfo.diagnosisExplanation}</p>
              </div>
            )}
            {prescriptionInfo.medicationInstructions && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "दवा निर्देश" : "Medication Instructions"}
                </h3>
                <p>{prescriptionInfo.medicationInstructions}</p>
              </div>
            )}
            {prescriptionInfo.rawText && (
              <div>
                <h3 className="font-medium">
                  {language === "hindi" ? "कच्चा पाठ" : "Raw Text"}
                </h3>
                <Textarea
                  readOnly
                  value={prescriptionInfo.rawText}
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionResult;
