
import { ResumeAnalysisResult } from "@/components/PrescriptionResult";
import { toast } from "sonner";

export async function analyzeResume(
  resumeFile: File,
  criteria: {
    keywords: string[];
    requiredExperience: string;
    techStack: string[];
    degree: string;
    additionalAttributes: string;
  },
  apiKey: string,
  language: string = "english"
): Promise<ResumeAnalysisResult> {
  try {
    // Convert the resume to base64
    const base64Resume = await fileToBase64(resumeFile);
    
    // Extract base64 data from the Data URL
    const base64Data = base64Resume.split(',')[1];

    // Prepare criteria string
    const criteriaString = `
      Keywords: ${criteria.keywords.join(', ')}
      Required Experience: ${criteria.requiredExperience}
      Tech Stack: ${criteria.techStack.join(', ')}
      Required Degree: ${criteria.degree}
      Additional Requirements: ${criteria.additionalAttributes}
    `;

    // Get current date for experience calculation
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed

    // Prepare the API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              `You are an expert resume analyzer and ATS specialist. Your task is to analyze a resume against specific job criteria and provide a detailed evaluation with a percentage score. Be honest but constructive in your feedback.

              IMPORTANT INSTRUCTIONS FOR DATE PARSING AND EXPERIENCE CALCULATION:
              - When analyzing work experience, treat "present", "current", "now", "ongoing" or similar terms as the current date (${currentMonth}/${currentYear}).
              - For experiences like "Aug 2023 - Present", calculate the duration as from August 2023 to today's date (${currentMonth}/${currentYear}).
              - Be accurate with experience calculations - if someone has been working from Aug 2023 to present (${currentMonth}/${currentYear}), that's approximately ${((currentDate.getTime() - new Date(2023, 7, 1).getTime()) / (1000 * 60 * 60 * 24 * 30)).toFixed(1)} months or ${((currentDate.getTime() - new Date(2023, 7, 1).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)} years.
              - For current date reference, today is ${currentDate.toLocaleDateString()}.
              - Pay attention to overlapping experiences and cumulative experience.
              - Avoid underestimating experience - be fair and accurate in your calculations.
              
              ${language === "hindi" ? "Provide all text output in Hindi language." : "Provide all text output in English language."}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this resume PDF against the following job criteria and provide a detailed evaluation:
                
                ${criteriaString}
                
                Return your analysis in JSON format with the following structure:
                {
                  "overallScore": number (1-100),
                  "keywordMatches": [{"keyword": string, "found": boolean, "context": string}],
                  "experienceAnalysis": {"years": string, "relevance": string, "score": number},
                  "techStackAnalysis": [{"tech": string, "found": boolean, "expertise": string}],
                  "educationAnalysis": {"degreeFound": boolean, "relevance": string, "score": number},
                  "strengths": [string],
                  "weaknesses": [string],
                  "improvementSuggestions": [string],
                  "summaryFeedback": string
                }
                
                Be precise in your scoring. The overall score should reflect how well the resume matches the job criteria. ${language === "hindi" ? "Provide all text fields in Hindi language." : "Provide all text fields in English language."}`
              },
              {
                type: "file",
                file: {
                  filename: `${resumeFile.name}`,
                  file_data: `data:application/pdf;base64,${base64Data}`
                }
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message ||
          `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    
    // Parse the response content which should be JSON
    let parsedContent: ResumeAnalysisResult;
    try {
      // The API response contains the assistant's message with JSON content
      const content = data.choices[0].message.content;
      
      // Try to extract JSON if it's wrapped in backticks
      let jsonContent = content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1];
      }
      
      parsedContent = JSON.parse(jsonContent);
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      // If JSON parsing fails, provide a fallback using the raw text
      parsedContent = {
        overallScore: 0,
        keywordMatches: [],
        experienceAnalysis: { years: "Unknown", relevance: "Unknown", score: 0 },
        techStackAnalysis: [],
        educationAnalysis: { degreeFound: false, relevance: "Unknown", score: 0 },
        strengths: [],
        weaknesses: [],
        improvementSuggestions: [],
        summaryFeedback: data.choices[0].message.content,
      };
    }

    return parsedContent;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    toast.error("Failed to analyze resume. Please try again.");
    throw error;
  }
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}
