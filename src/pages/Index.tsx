
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import ImageCapture from "@/components/ImageCapture";
import PrescriptionResult, { ResumeAnalysisResult } from "@/components/PrescriptionResult";
import PrescriptionHistory from "@/components/PrescriptionHistory";
import { analyzeResume } from "@/services/openaiService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { X, Plus, Briefcase, Code, GraduationCap, Star, Award, KeyRound, LucideIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HistoryItem {
  id: string;
  timestamp: Date;
  image: string;
  prescriptionInfo: ResumeAnalysisResult;
}

interface ResumeCriteriaForm {
  keywords: string[];
  requiredExperience: string;
  techStack: string[];
  degree: string;
  additionalAttributes: string;
}

interface CriteriaSection {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}

const criteriaSections: CriteriaSection[] = [
  {
    icon: KeyRound,
    title: "Keywords",
    description: "Important terms and skills that should appear in the resume",
    badge: "Key Match",
    badgeColor: "criteria-badge-blue"
  },
  {
    icon: Briefcase,
    title: "Experience",
    description: "Required work experience for the position",
    badge: "Experience",
    badgeColor: "criteria-badge-purple"
  },
  {
    icon: Code,
    title: "Tech Stack",
    description: "Technical skills and technologies required for the role",
    badge: "Tech",
    badgeColor: "criteria-badge-green"
  },
  {
    icon: GraduationCap,
    title: "Education",
    description: "Academic qualifications needed for the position",
    badge: "Education",
    badgeColor: "criteria-badge-amber"
  }
];

const Index = () => {
  const [apiKey, setApiKey] = useState<string>(`${import.meta.env.VITE_OPENAI_API_KEY}`);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("scan");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>("english");
  
  // Form setup
  const form = useForm<ResumeCriteriaForm>({
    defaultValues: {
      keywords: [""],
      requiredExperience: "1 year",
      techStack: [""],
      degree: "Bachelor's degree",
      additionalAttributes: "",
    },
  });

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    // Load history from localStorage
    const savedHistory = localStorage.getItem("resume_history");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      } catch (error) {
        console.error("Failed to parse history from localStorage:", error);
      }
    }
    
    // Load language preference
    const savedLanguage = localStorage.getItem("preferred_language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    // Load criteria
    const savedCriteria = localStorage.getItem("resume_criteria");
    if (savedCriteria) {
      try {
        const parsedCriteria = JSON.parse(savedCriteria);
        // Update form with saved criteria
        Object.entries(parsedCriteria).forEach(([key, value]) => {
          form.setValue(key as keyof ResumeCriteriaForm, value as any);
        });
      } catch (error) {
        console.error("Failed to parse criteria from localStorage:", error);
      }
    }
  }, [form]);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
    }
  }, [apiKey]);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("resume_history", JSON.stringify(history));
  }, [history]);
  
  // Save language preference
  useEffect(() => {
    localStorage.setItem("preferred_language", language);
  }, [language]);
  
  // Save criteria
  useEffect(() => {
    const values = form.getValues();
    localStorage.setItem("resume_criteria", JSON.stringify(values));
  }, [form.watch()]);

  const handleImageCaptured = async (imageFile: File) => {
    setSelectedImage(imageFile);

    if (!apiKey) {
      toast.error("Please enter your OpenAI API key in settings");
      setActiveTab("settings");
      return;
    }
    
    // Get the form values
    const criteria = form.getValues();
    
    // Make sure arrays have at least one non-empty value
    const validKeywords = criteria.keywords.filter(k => k.trim() !== "");
    const validTechStack = criteria.techStack.filter(t => t.trim() !== "");
    
    if (validKeywords.length === 0 || validTechStack.length === 0) {
      toast.error("Please add at least one keyword and one technology in the criteria");
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeResume(
        imageFile, 
        {
          ...criteria,
          keywords: validKeywords,
          techStack: validTechStack
        }, 
        apiKey, 
        language
      );
      setCurrentAnalysis(result);

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date(),
        image: URL.createObjectURL(imageFile),
        prescriptionInfo: result,
      };
      
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentAnalysis(item.prescriptionInfo);
    setActiveTab("scan");
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("resume_history");
    toast.success("History cleared");
  };

  const handleApiKeyUpdate = () => {
    toast.success("API key saved");
  };
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    
    // If there's a selected image, re-analyze with the new language
    if (selectedImage && apiKey) {
      const criteria = form.getValues();
      const validKeywords = criteria.keywords.filter(k => k.trim() !== "");
      const validTechStack = criteria.techStack.filter(t => t.trim() !== "");
      
      if (validKeywords.length > 0 && validTechStack.length > 0) {
        setIsLoading(true);
        analyzeResume(
          selectedImage, 
          {
            ...criteria,
            keywords: validKeywords,
            techStack: validTechStack
          }, 
          apiKey, 
          newLanguage
        )
          .then(result => {
            setCurrentAnalysis(result);
            
            // Update history with new analysis
            if (history.length > 0) {
              const updatedHistory = [...history];
              updatedHistory[0].prescriptionInfo = result;
              setHistory(updatedHistory);
            }
          })
          .catch(error => {
            console.error("Error processing image with new language:", error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  };
  
  // Add and remove array fields
  const addKeyword = () => {
    const currentKeywords = form.getValues("keywords");
    form.setValue("keywords", [...currentKeywords, ""]);
  };
  
  const removeKeyword = (index: number) => {
    const currentKeywords = form.getValues("keywords");
    if (currentKeywords.length > 1) {
      form.setValue(
        "keywords",
        currentKeywords.filter((_, i) => i !== index)
      );
    }
  };
  
  const addTechStack = () => {
    const currentTechStack = form.getValues("techStack");
    form.setValue("techStack", [...currentTechStack, ""]);
  };
  
  const removeTechStack = (index: number) => {
    const currentTechStack = form.getValues("techStack");
    if (currentTechStack.length > 1) {
      form.setValue(
        "techStack",
        currentTechStack.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="scan" className="text-sm">
              {language === "hindi" ? "रिज्यूमे स्कैन" : "Scan Resume"}
            </TabsTrigger>
            <TabsTrigger value="criteria" className="text-sm">
              {language === "hindi" ? "मापदंड" : "Criteria"}
            </TabsTrigger>
            {/* <TabsTrigger value="settings" className="text-sm">
              {language === "hindi" ? "सेटिंग्स" : "Settings"}
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="scan" className="space-y-4">
            <ImageCapture 
              onImageCaptured={handleImageCaptured} 
              isLoading={isLoading} 
            />
            <PrescriptionResult 
              prescriptionInfo={currentAnalysis} 
              isLoading={isLoading} 
              language={language}
              onLanguageChange={handleLanguageChange}
            />
            <PrescriptionHistory 
              history={history}
              onSelectHistoryItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
            />
          </TabsContent>
          
          <TabsContent value="criteria" className="criteria-section">
            <div className="max-w-2xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="criteria-card"
              >
                <div className="criteria-header">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    {language === "hindi" ? "जॉब मापदंड" : "Job Criteria"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {language === "hindi" 
                      ? "इन मापदंडों के खिलाफ रिज्यूमे का विश्लेषण किया जाएगा" 
                      : "Resumes will be analyzed against these criteria"}
                  </p>
                </div>
                
                <div className="p-6 space-y-6">
                  <Form {...form}>
                    <form className="space-y-8">
                      {criteriaSections.map((section, idx) => (
                        <motion.div 
                          key={section.title}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                          className="space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-full bg-gray-100">
                                <section.icon className={`h-5 w-5 ${
                                  idx === 0 ? "text-blue-500" : 
                                  idx === 1 ? "text-purple-500" : 
                                  idx === 2 ? "text-green-500" : 
                                  "text-amber-500"
                                }`} />
                              </div>
                              <div>
                                <FormLabel className="text-base font-medium">
                                  {language === "hindi" 
                                    ? (idx === 0 ? "महत्वपूर्ण कीवर्ड" : 
                                       idx === 1 ? "अनुभव" : 
                                       idx === 2 ? "तकनीकी स्टैक" : 
                                       "शैक्षिक योग्यता")
                                    : section.title}
                                </FormLabel>
                                <p className="text-xs text-gray-500">{section.description}</p>
                              </div>
                            </div>
                            <span className={`criteria-badge ${section.badgeColor}`}>
                              {section.badge}
                            </span>
                          </div>

                          {idx === 0 && (
                            <div className="space-y-2 pl-9">
                              {form.getValues("keywords").map((_, index) => (
                                <div key={index} className="criteria-input-group keyword-item">
                                  <Input
                                    placeholder={language === "hindi" ? "कीवर्ड दर्ज करें" : "Enter keyword"}
                                    value={form.getValues(`keywords.${index}`)}
                                    onChange={(e) => form.setValue(`keywords.${index}`, e.target.value)}
                                    className="flex-1 border-gray-200 focus:border-blue-300"
                                  />
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => removeKeyword(index)}
                                    disabled={form.getValues("keywords").length <= 1}
                                    className="h-9 w-9 rounded-full border-gray-200"
                                  >
                                    <X className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addKeyword}
                                className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                {language === "hindi" ? "कीवर्ड जोड़ें" : "Add Keyword"}
                              </Button>
                            </div>
                          )}

                          {idx === 1 && (
                            <div className="pl-9">
                              <Input
                                placeholder={language === "hindi" ? "आवश्यक अनुभव" : "Required experience (e.g., 2 years)"}
                                value={form.getValues("requiredExperience")}
                                onChange={(e) => form.setValue("requiredExperience", e.target.value)}
                                className="w-full border-gray-200"
                              />
                            </div>
                          )}
                          
                          {idx === 2 && (
                            <div className="space-y-2 pl-9">
                              {form.getValues("techStack").map((_, index) => (
                                <div key={index} className="criteria-input-group keyword-item">
                                  <Input
                                    placeholder={language === "hindi" ? "तकनीक दर्ज करें" : "Enter technology"}
                                    value={form.getValues(`techStack.${index}`)}
                                    onChange={(e) => form.setValue(`techStack.${index}`, e.target.value)}
                                    className="flex-1 border-gray-200 focus:border-green-300"
                                  />
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => removeTechStack(index)}
                                    disabled={form.getValues("techStack").length <= 1}
                                    className="h-9 w-9 rounded-full border-gray-200"
                                  >
                                    <X className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTechStack}
                                className="mt-2 text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                {language === "hindi" ? "तकनीक जोड़ें" : "Add Technology"}
                              </Button>
                            </div>
                          )}
                          
                          {idx === 3 && (
                            <div className="pl-9">
                              <Input
                                placeholder={language === "hindi" ? "आवश्यक डिग्री" : "Required degree (e.g., Bachelor's in Computer Science)"}
                                value={form.getValues("degree")}
                                onChange={(e) => form.setValue("degree", e.target.value)}
                                className="w-full border-gray-200"
                              />
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-gray-100">
                            <Award className="h-5 w-5 text-indigo-500" />
                          </div>
                          <FormLabel>
                            {language === "hindi" ? "अतिरिक्त विशेषताएं" : "Additional Attributes"}
                          </FormLabel>
                        </div>
                        <div className="pl-9">
                          <Textarea
                            placeholder={language === "hindi" ? "अन्य महत्वपूर्ण विशेषताएं या कौशल" : "Other important attributes or skills"}
                            value={form.getValues("additionalAttributes")}
                            onChange={(e) => form.setValue("additionalAttributes", e.target.value)}
                            className="min-h-24 border-gray-200"
                          />
                        </div>
                      </motion.div>

                      <div className="flex justify-center pt-4">
                        <Button 
                          type="button" 
                          onClick={() => setActiveTab("scan")}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6"
                        >
                          {language === "hindi" ? "स्कैनिंग पर जाएं" : "Go to Scanning"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {language === "hindi" ? "API सेटिंग्स" : "API Settings"}
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">
                    {language === "hindi" ? "OpenAI API कुंजी" : "OpenAI API Key"}
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    {language === "hindi" 
                      ? "आपकी API कुंजी स्थानीय रूप से संग्रहीत है और कभी भी हमारे सर्वर पर नहीं भेजी जाती है।" 
                      : "Your API key is stored locally and never sent to our servers."}
                  </p>
                </div>
                
                <Button 
                  onClick={handleApiKeyUpdate} 
                  className="w-full"
                >
                  {language === "hindi" ? "सेटिंग्स सहेजें" : "Save Settings"}
                </Button>
                
                <div className="p-4 bg-gray-50 rounded-lg mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">
                    {language === "hindi" ? "OpenAI API कुंजी के बारे में" : "About OpenAI API Keys"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {language === "hindi" 
                      ? "इस ऐप का उपयोग करने के लिए, आपको GPT-4 Vision मॉडल तक पहुंच के साथ एक OpenAI API कुंजी की आवश्यकता होगी।" 
                      : "To use this app, you need an OpenAI API key with access to the GPT-4 Vision model."}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === "hindi" ? "आप" : "You can get an API key from the"}{" "}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      OpenAI platform
                    </a>
                    {language === "hindi" ? " से API कुंजी प्राप्त कर सकते हैं।" : "."}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-auto py-4 text-center text-sm text-gray-500 bg-white border-t">
        <p>
          TruDetect © {new Date().getFullYear()} | 
          {language === "hindi" 
            ? " अपने रिज्यूमे को स्मार्ट तरीके से विश्लेषण करें" 
            : " Analyze your resume smartly against job criteria"}
        </p>
      </footer>
    </div>
  );
};

export default Index;
