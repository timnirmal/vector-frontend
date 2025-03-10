"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

// Import step components
import JDStep from "./jd";
import CVStep from "./cv";
import AnalysisStep from "./analysis";
import ChatStep from "./chat";

// Define interfaces that will be shared across components
export interface CompatibilityResponse {
    compatibility_score: number;
    strengths: string[];
    potential_concerns: string[];
    work_style_indicators: string[];
    culture_fit_aspects: string[];
    adaptability_signals: string[];
    salary_expectation: string[];
    questions: {
        situational: string[];
        cultural_fit: string[];
        adaptability: string[];
        collaboration: string[];
        growth: string[];
        salary_expectation: string[];
    };
    next_steps: string;
}

export interface ChatMessage {
    sender: "user" | "agent";
    content: string;
    timestamp: Date;
}

export default function JobWizardWorkflow() {
    const router = useRouter();

    // Wizard state
    const [currentStep, setCurrentStep] = useState(0);
    const steps = ["Job Description", "Upload CV", "Analysis", "Chat"];

    // Data states
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<CompatibilityResponse | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            sender: "agent",
            content:
                "Hello! I've analyzed your CV against the job description. What questions do you have about the position or how to improve your application?",
            timestamp: new Date(),
        },
    ]);

    // Step navigation
    const nextStep = async () => {
        try {
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
                    return;
                }
            }

            // Only advance to the next step if all async operations completed successfully
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        } catch (error) {
            // Handle the error here (e.g., keep the user on the same step)
            console.error("Next step not executed due to an error:", error);
            toast.error("Failed to proceed to next step. Please try again.");
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

    // Handler functions to be passed to child components
    const handleJDUpload = async () => {
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
            await toast.promise(
                fetch("https://api.know360.io/job_followup_agent/upload-jd", {
                    method: "POST",
                    body: formData,
                }).then(async (res) => {
                    if (!res.ok) {
                        throw new Error("Failed to upload JD");
                    }
                    return res.json();
                }),
                {
                    loading: "Uploading job description...",
                    success: (data) =>
                        data?.message || "Job description uploaded successfully",
                    error: "Failed to upload JD",
                }
            );
        } catch (error) {
            console.error("Error uploading JD:", error);
            toast.error("Error uploading job description");
            throw error; // Optionally rethrow to stop progression if needed
        }
    };

    const handleCVUpload = async () => {
        // If no file (or text) is provided, skip
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            await toast.promise(
                fetch("https://api.know360.io/job_followup_agent/upload-cv", {
                    method: "POST",
                    body: formData,
                }).then(async (res) => {
                    if (!res.ok) {
                        throw new Error("Failed to upload CV");
                    }
                    return res.json();
                }),
                {
                    loading: "Uploading CV...",
                    success: (data) => data?.message || "CV uploaded successfully",
                    error: "Failed to upload CV",
                }
            );
        } catch (error) {
            console.error("Error uploading CV:", error);
            toast.error("Error uploading CV");
            throw error; // Optionally rethrow to stop progression if needed
        }
    };

    const handleAnalyzeProfile = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch('https://api.know360.io/job_followup_agent/analyze-profile', {
                method: 'POST',
                // You can add headers if needed:
                // headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data: CompatibilityResponse = await response.json();
            setAnalysis(data);
            toast.success('Profile analyzed successfully');
            return data; // Return the data so we can confirm it's processed
        } catch (error) {
            console.error(error);
            toast.error('Failed to analyze profile');
            throw error; // Rethrow to prevent next step if analysis fails
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Render the appropriate step component based on currentStep
    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <JDStep 
                        jobDescription={jobDescription}
                        setJobDescription={setJobDescription}
                        jdFile={jdFile}
                        setJdFile={setJdFile}
                        handleJDFileSelect={(e) => {
                            if (e.target.files?.[0]) {
                                setJdFile(e.target.files[0]);
                                toast.success("Job description file selected");
                            }
                        }}
                        handleJDUpload={handleJDUpload}
                    />
                );
            case 1:
                return (
                    <CVStep 
                        file={file}
                        setFile={setFile}
                        handleCVFileSelect={(e) => {
                            if (e.target.files?.[0]) {
                                setFile(e.target.files[0]);
                                toast.success("CV file selected");
                            }
                        }}
                    />
                );
            case 2:
                return (
                    <AnalysisStep 
                        analysis={analysis}
                        isAnalyzing={isAnalyzing}
                        handleAnalyzeProfile={handleAnalyzeProfile}
                    />
                );
            case 3:
                return (
                    <ChatStep 
                        chatMessages={chatMessages}
                        setChatMessages={setChatMessages}
                        analysis={analysis}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/workflows")}
                    className="mr-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Job Application Assistant</h1>
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`text-sm font-medium ${index <= currentStep ? "text-primary" : "text-muted-foreground"}`}
                        >
                            {step}
                        </div>
                    ))}
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-primary h-full transition-all duration-300 ease-in-out"
                        style={{
                            width: `${((currentStep + 1) / steps.length) * 100}%`,
                        }}
                    ></div>
                </div>
            </div>

            {/* Main content */}
            <Card className="mb-6">
                <CardContent className="pt-6">{renderStep()}</CardContent>
            </Card>

            {/* Navigation buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {currentStep < steps.length - 1 ? (
                    <Button
                        onClick={nextStep}
                        disabled={!isStepComplete()}
                    >
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : null}
            </div>
        </div>
    );
}