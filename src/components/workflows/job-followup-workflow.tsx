"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {Progress} from "@/components/ui/progress";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
import {
    ArrowLeft,
    Upload,
    Calendar,
    FileText,
    ChevronRight,
    ChevronLeft,
    MessageSquare,
    CheckCircle,
} from "lucide-react";
import {toast} from "sonner";

// Import step components
import JDStep from "./job-followup/jd";
import CVStep from "./job-followup/cv";
import AnalysisStep from "./job-followup/analysis";
import ChatStep from "./job-followup/chat";

// Import interfaces from the job-followup components
import { CompatibilityResponse, ChatMessage } from "./job-followup/index";

export default function JobWizardWorkflow() {
    const router = useRouter();

    // Wizard state
    const [currentStep, setCurrentStep] = useState(0);
    const steps = ["Job Description", "Upload CV", "Analysis", "Chat"];

    // Data states
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            sender: "agent",
            content:
                "Hello! I've analyzed your CV against the job description. What questions do you have about the position or how to improve your application?",
            timestamp: new Date(),
        },
    ]);
    const [newMessage, setNewMessage] = useState("");

    const [analysis, setAnalysis] = useState<CompatibilityResponse | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Add loading state for step transitions
    const [isLoading, setIsLoading] = useState(false);

    // Step navigation
    const nextStep = async () => {
        console.log("nextStep");
        try {
            // Set loading state to prevent multiple clicks
            setIsLoading(true);
            console.log("loading", isLoading);
            console.log("current step", currentStep);

            // If we're moving from Step 0 -> Step 1, upload JD if provided
            if (currentStep === 0) {
                await handleJDUpload();
            }
            // If we're moving from Step 1 -> Step 2, upload CV if provided
            else if (currentStep === 1) {
                await handleCVUpload();
            }
            // If we're moving to Step 3 (Analysis step complete), call the analyze endpoint
            else if (currentStep === 2 && !analysis) {
                // Wait for analysis to complete before proceeding
                const analysisResult = await handleAnalyzeProfile();
                if (!analysisResult) {
                    // If analysis failed or returned no data, don't proceed
                    setIsLoading(false);
                    return;
                }
            }

            // Only advance to the next step if all async operations completed successfully
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        } catch (error) {
            // Handle the error here (e.g., keep the user on the same step)
            console.error("Next step not executed due to an error:", error);
            toast.error("Failed to proceed to next step. Please try again.");
        } finally {
            // Always reset loading state when done
            setIsLoading(false);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    // Check if current step is complete and next button can be enabled
    const isStepComplete = () => {
        switch (currentStep) {
            case 0: // Job Description
                return !!jobDescription || !!jdFile;
            case 1: // CV Upload
                return !!file;
            case 2: // Analysis
                return !!analysis;
            default:
                return true;
        }
    };

    // ----------------------------
    // 1) Upload JD (File or Text)
    // ----------------------------
    const handleJDFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setJdFile(event.target.files[0]);
            toast.success("Job description file selected");
        }
    };

    const handleJDUpload = async () => {
        console.log("JD upload")
        // If neither a file nor text is provided, skip
        if (!jdFile && !jobDescription.trim()) return;

        const formData = new FormData();
        if (jdFile) {
            formData.append("file", jdFile);
        } else {
            // If user only pasted text
            formData.append("text", jobDescription);
        }

        try {
            // Create a variable to hold the fetch promise so we can properly await it
            const response = await fetch("https://api.know360.io/job_followup_agent/upload-jd", {
                method: "POST",
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error("Failed to upload JD");
            }
            
            const result = await response.json();
            toast.success(result?.message || "Job description uploaded successfully");
            
            // This will only execute after the fetch is complete
            console.log("JD uploaded", result);
            return result;
        } catch (error) {
            console.error("Error uploading JD:", error);
            toast.error("Error uploading job description");
            throw error; // Optionally rethrow to stop progression if needed
        }
    };


    // ----------------------------
    // 2) Upload CV (File or Text)
    // ----------------------------
    const handleCVFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setFile(event.target.files[0]);
            toast.success("CV file selected");
        }
    };

    const handleCVUpload = async () => {
        // If no file (or text) is provided, skip
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Create a variable to hold the fetch promise so we can properly await it
            const response = await fetch("https://api.know360.io/job_followup_agent/upload-cv", {
                method: "POST",
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error("Failed to upload CV");
            }
            
            const result = await response.json();
            toast.success(result?.message || "CV uploaded successfully");
            
            // Log completion with result
            console.log("CV uploaded", result);
            return result;
        } catch (error) {
            console.error("Error uploading CV:", error);
            toast.error("Error uploading CV");
            throw error; // Optionally rethrow to stop progression if needed
        }
    };

    // ----------------------------
    // 3) Analyze CV vs JD
    // ----------------------------
    const handleAnalyzeProfile = async () => {
        setIsAnalyzing(true);
        try {
            console.log("Starting profile analysis...");
            
            // Create a fetch promise that we can await and track
            const response = await fetch('https://api.know360.io/job_followup_agent/analyze-profile', {
                method: 'POST',
                // You can add headers if needed:
                // headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) {
                throw new Error('Analysis failed with status: ' + response.status);
            }
            
            const responseData = await response.json();
            toast.success("Profile analyzed successfully");
            
            console.log("Analysis complete", responseData);
            
            // Ensure the response data matches the CompatibilityResponse interface
            // If the API returns a nested structure, extract the relevant data
            const data: CompatibilityResponse = responseData.result || responseData;
            
            // Validate that the data conforms to the expected interface
            if (!data.compatibility_score && typeof data.compatibility_score !== 'number') {
                console.warn("API response missing compatibility_score", data);
                // Provide default values if needed
                data.compatibility_score = data.compatibility_score || 0;
            }
            
            setAnalysis(data);
            return data; // Return the data so we can confirm it's processed
        } catch (error) {
            console.error(error);
            toast.error('Failed to analyze profile');
            throw error; // Rethrow to prevent next step if analysis fails
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ----------------------------
    // 4) Chat
    // ----------------------------
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        // Add user message
        const userMessage: ChatMessage = {
            sender: "user",
            content: newMessage,
            timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, userMessage]);
        setNewMessage("");

        try {
            // In a real implementation, you would make an API call here
            // For example:
            // const response = await fetch('https://api.know360.io/job_followup_agent/chat', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ message: newMessage }),
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Failed to get response');
            // }
            // 
            // const data = await response.json();
            // const responseMessage = data.message;
            
            // For now, simulate agent response with a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const agentResponses = [
                "Based on your CV, I'd recommend highlighting your React experience more prominently...",
                "I noticed the job requires experience with TypeScript, which isn’t mentioned in your CV...",
                "Your problem-solving skills are a great match for this role...",
                "The company culture values collaboration and teamwork...",
            ];
            const randomResponse =
                agentResponses[Math.floor(Math.random() * agentResponses.length)];

            const agentMessage: ChatMessage = {
                sender: "agent",
                content: randomResponse,
                timestamp: new Date(),
            };
            setChatMessages((prev) => [...prev, agentMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to get response');
        }
    };

    // ----------------------------
    // Render
    // ----------------------------
    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-bold">Job Application Wizard</h1>
                    <p
                        className="flex items-center cursor-pointer"
                        onClick={() => router.push("/workflows")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Back to Workflows
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="mb-8 bg-white p-4">
                    <div className="relative flex items-center gap-10 justify-between">
                        {/* Horizontal line behind the steps */}
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10"></div>

                        {steps.map((step, index) => {
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <div key={index} className="relative gap-3 flex w-full z-0">
                                    {/* Step circle */}
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                      ${
                                            isActive
                                                ? "bg-[#121a28] text-white border-2 border-[#121a28]"
                                                : isCompleted
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-400 border border-gray-300"
                                        }
                    `}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="h-6 w-6"/>
                                        ) : (
                                            <>
                                                {index === 0 && <FileText className="h-6 w-6"/>}
                                                {index === 1 && <Upload className="h-6 w-6"/>}
                                                {index === 2 && <FileText className="h-6 w-6"/>}
                                                {index === 3 && <MessageSquare className="h-6 w-6"/>}
                                            </>
                                        )}
                                    </div>

                                    {/* Step label */}
                                    <div className="flex flex-col ">
                                        <div
                                            className={`font-bold text-xl ${
                                                isActive
                                                    ? "text-[#121a28]"
                                                    : isCompleted
                                                        ? "text-gray-500"
                                                        : "text-gray-400"
                                            }`}
                                        >
                                            {isCompleted ? "" : `0${index + 1}`}
                                        </div>
                                        <div
                                            className={`text-sm ${
                                                isActive
                                                    ? "text-[#121a28] font-medium"
                                                    : isCompleted
                                                        ? "text-gray-500"
                                                        : "text-gray-400"
                                            }`}
                                        >
                                            {step}
                                        </div>
                                    </div>

                                    {/* Active step line */}
                                    {isActive && (
                                        <div
                                            className="absolute -bottom-4 left-0 right-0 h-1 bg-[#121a28] rounded-full"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Card for step content */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        {/* Render the appropriate step component based on currentStep */}
                        {currentStep === 0 && (
                            <JDStep 
                                jobDescription={jobDescription}
                                setJobDescription={setJobDescription}
                                jdFile={jdFile}
                                setJdFile={setJdFile}
                                handleJDFileSelect={handleJDFileSelect}
                                handleJDUpload={handleJDUpload}
                            />
                        )}

                        {/* Step 1: CV Upload */}
                        {currentStep === 1 && (
                            <CVStep 
                                file={file}
                                setFile={setFile}
                                handleCVFileSelect={handleCVFileSelect}
                            />
                        )}

                        {/* Step 2: Analysis Results */}
                        {currentStep === 2 && (
                            <AnalysisStep 
                                analysis={analysis}
                                isAnalyzing={isAnalyzing}
                                handleAnalyzeProfile={handleAnalyzeProfile}
                            />
                        )}

                        {/* Step 3: Chat */}
                        {currentStep === 3 && (
                            <ChatStep 
                                chatMessages={chatMessages}
                                setChatMessages={setChatMessages}
                                analysis={analysis}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Navigation buttons */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="border-gray-300 hover:bg-gray-100"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2"/>
                        Previous Step
                    </Button>

                    {currentStep < steps.length - 1 ? (
                        <Button
                            onClick={nextStep}
                            disabled={!isStepComplete() || isLoading}
                            className={`${
                                isStepComplete() && !isLoading
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-400"
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="mr-2">Loading...</span>
                                    <span className="animate-spin">⟳</span>
                                </>
                            ) : (
                                <>
                                    {currentStep === 0 && "Upload JD"}
                                    {currentStep === 1 && "Upload CV"}
                                    {currentStep === 2 && "Chat"}
                                    <ChevronRight className="h-4 w-4 ml-2"/>
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => router.push("/workflows")}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="h-4 w-4 mr-2"/>
                            Finish
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
