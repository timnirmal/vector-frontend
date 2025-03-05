// src/components/workflows/job-followup-wizard.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Upload, Calendar, FileText, ChevronRight, ChevronLeft, MessageSquare, CheckCircle, XCircle, Star, StarHalf, Award, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface Analysis {
  compatibilityScore: number;
  strengths: string[];
  weaknesses: string[];
  cultureFit: number;
  workStyle: string[];
}

interface ChatMessage {
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export default function JobWizardWorkflow() {
  const router = useRouter();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Job Description", "Upload CV", "Analysis", "Chat"];
  
  // Data states
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'agent',
      content: 'Hello! I\'ve analyzed your CV against the job description. What questions do you have about the position or how to improve your application?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle file selection for CV
  const handleCVFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
      toast.success("CV uploaded successfully");
    }
  };

  // Handle file selection for job description
  const handleJDFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setJdFile(event.target.files[0]);
      toast.success("Job description file uploaded successfully");
    }
  };

  // Analyze CV against job description
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    toast.promise(
      // Simulating analysis
      new Promise((resolve) => {
        setTimeout(() => {
          setAnalysis({
            compatibilityScore: 85,
            strengths: ['Technical expertise', 'Communication skills', 'Problem solving'],
            weaknesses: ['Limited management experience', 'Remote work experience'],
            cultureFit: 90,
            workStyle: ['Collaborative', 'Self-motivated', 'Detail-oriented']
          });
          setIsAnalyzing(false);
          resolve(true);
        }, 1500);
      }),
      {
        loading: 'Analyzing CV...',
        success: 'Analysis completed',
        error: 'Failed to analyze CV',
      }
    );
  };

  // Send a message in chat
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      sender: 'user',
      content: newMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate agent response after a delay
    setTimeout(() => {
      const agentResponses = [
        "Based on your CV, I'd recommend highlighting your React experience more prominently. The job specifically mentions 3+ years of experience with React, and your CV only mentions it briefly.",
        "I noticed the job requires experience with TypeScript, which isn't mentioned in your CV. Do you have any experience with TypeScript you could add?",
        "Your problem-solving skills are a great match for this role. The job description emphasizes a need for someone who can troubleshoot complex issues.",
        "The company culture seems to value collaboration and teamwork. Your experience leading small teams at your previous position aligns well with this."
      ];
      
      const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
      
      const agentMessage: ChatMessage = {
        sender: 'agent',
        content: randomResponse,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep === 2 && !analysis) {
      handleAnalyze();
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
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

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">Job Application Wizard</h1>
          <p
            className="flex items-center cursor-pointer"
            onClick={() => router.push("/workflows")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </p>
        </div>

        {/* Progress indicator - horizontal steps with connecting lines */}
        <div className="mb-8 bg-white p-4">
          <div className="relative flex items-center gap-10 justify-between">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10"></div>
            
            {/* Step indicators */}
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isPending = index > currentStep;
              
              return (
                <div key={index} className="relative gap-3 flex w-full  z-0">
                  {/* Circle indicator */}
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                      ${isActive ? 'bg-[#121a28] text-white border-2 border-[#121a28]' : 
                        isCompleted ? 'bg-blue-600 text-white' : 
                        'bg-gray-100 text-gray-400 border border-gray-300'}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <>
                        {index === 0 && <FileText className="h-6 w-6" />}
                        {index === 1 && <Upload className="h-6 w-6" />}
                        {index === 2 && <FileText className="h-6 w-6" />}
                        {index === 3 && <MessageSquare className="h-6 w-6" />}
                      </>
                    )}
                  </div>
                  
                  {/* Step number and label */}
                  <div className="flex flex-col ">
                    <div className={`font-bold text-xl ${isActive ? 'text-[#121a28]' : isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>
                      {isCompleted ? '' : `0${index + 1}`}
                    </div>
                    <div className={`text-sm  ${isActive ? 'text-[#121a28] font-medium' : isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>
                      {step}
                    </div>
                  </div>
                  
                  {/* Active step indicator line */}
                  {isActive && (
                    <div className="absolute -bottom-4 left-0 right-0 h-1 bg-[#121a28] rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Step 1: Job Description */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-[#121a28]" />
                  Job Description
                </h2>
                
                <div className="border-2 border-dashed rounded-lg p-8 text-center mb-4 bg-[#DEE6E5] transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    id="jd-upload"
                    onChange={handleJDFileSelect}
                  />
                  <label htmlFor="jd-upload" className="cursor-pointer">
                    <FileText className="h-8 w-8 mx-auto mb-4 text-[#121a28]" />
                    <p className="font-medium text-[#121a28]">Upload Job Description</p>
                    <p className="text-sm text-[#121a28] mt-1">(PDF, DOC, DOCX, TXT)</p>
                  </label>
                </div>
                {jdFile && (
                  <div className="flex items-center p-2 bg-blue-50 rounded-md">
                    <FileText className="h-5 w-5 mr-2 text-[#121a28]" />
                    <p className="text-sm text-gray-700">{jdFile.name}</p>
                  </div>
                )}
                
                <div className="mt-6">
                  <p className="text-sm font-medium flex items-center mb-3">
                    <ChevronRight className="h-4 w-4 mr-1 text-[#121a28]" />
                    Or paste the job description below:
                  </p>
                  <Textarea
                    placeholder="Enter the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </div>
            )}

            {/* Step 2: CV Upload */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Upload className="h-6 w-6 mr-2 text-green-600" />
                  Upload Your CV
                </h2>
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-green-50 hover:bg-green-100 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="cv-upload"
                    onChange={handleCVFileSelect}
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-green-600" />
                    <p className="font-medium text-green-700">Drop your resume here or click to browse</p>
                    <p className="text-sm text-green-600 mt-1">(PDF, DOC, DOCX)</p>
                  </label>
                </div>
                {file && (
                  <div className="flex items-center p-2 bg-green-50 rounded-md">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    <p className="text-sm text-gray-700">{file.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Analysis Results */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-purple-600" />
                  Analysis Results
                </h2>
                
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-6">
                      <FileText className="h-12 w-12 text-purple-400 animate-pulse" />
                    </div>
                    <p className="mb-4 text-lg font-medium">Analyzing your CV against the job description...</p>
                    <Progress value={undefined} className="h-2 animate-pulse" />
                  </div>
                ) : analysis ? (
                  <div className="space-y-6">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                        Compatibility Score
                      </p>
                      <Progress value={analysis.compatibilityScore} className="h-3 bg-purple-100" />
                      <p className="text-sm mt-2 font-bold text-purple-700">{analysis.compatibilityScore}% match</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="font-medium mb-2 flex items-center">
                        <ChevronRight className="h-5 w-5 mr-1 text-green-600" />
                        Strengths
                      </p>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {analysis.strengths.map((strength, index) => (
                            <li key={index} className="text-green-700 flex items-start">
                              <span className="inline-block h-5 w-5 rounded-full bg-green-200 flex-shrink-0 mr-2 flex items-center justify-center mt-0.5">
                                <ChevronRight className="h-3 w-3 text-green-700" />
                              </span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2 flex items-center">
                        <ChevronRight className="h-5 w-5 mr-1 text-orange-600" />
                        Areas for Improvement
                      </p>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {analysis.weaknesses.map((weakness, index) => (
                            <li key={index} className="text-orange-700 flex items-start">
                              <span className="inline-block h-5 w-5 rounded-full bg-orange-200 flex-shrink-0 mr-2 flex items-center justify-center mt-0.5">
                                <ChevronRight className="h-3 w-3 text-orange-700" />
                              </span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="font-medium mb-2 flex items-center">
                        <ChevronRight className="h-5 w-5 mr-1 text-[#121a28]" />
                        Work Style Indicators
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {analysis.workStyle.map((style, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-[#121a28] rounded-full text-sm flex items-center">
                              <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-center bg-gray-50 p-6 rounded-lg">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-indigo-500" />
                      <p className="text-lg font-medium mb-2">Ready to get personalized advice?</p>
                      <p className="text-sm text-gray-600 mb-4">Chat with our AI assistant about your application and get tips on how to improve your chances.</p>
                      <Button onClick={nextStep} className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                        Start Chat
                        <MessageSquare className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No analysis available. Please go back and complete the previous steps.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Chat with Agent */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2 text-indigo-600" />
                  Chat with Job Assistant
                </h2>
                
                <div className="bg-gradient-to-b from-indigo-50 to-white p-4 rounded-lg">
                  <ScrollArea className="h-[400px] rounded-md bg-white border shadow-sm p-4 mb-4">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 ${
                          message.sender === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          {message.sender === 'agent' && (
                            <>
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                                <MessageSquare className="h-4 w-4 text-indigo-600" />
                              </div>
                              <span className="text-xs font-medium text-indigo-600">Job Assistant</span>
                            </>
                          )}
                          {message.sender === 'user' && (
                            <>
                              <span className="text-xs font-medium text-[#121a28] ml-auto mr-2">You</span>
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Upload className="h-4 w-4 text-[#121a28]" />
                              </div>
                            </>
                          )}
                        </div>
                        <div
                          className={`inline-block max-w-[80%] rounded-lg p-3 shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-indigo-100 text-indigo-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                  
                  <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="border-indigo-200 focus:border-indigo-400"
                    />
                    <Button onClick={sendMessage} className="bg-indigo-600 hover:bg-indigo-700">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
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
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Step
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepComplete()}
              className={`${isStepComplete() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
            >
              {currentStep === 0 && "Upload CV"}
              {currentStep === 1 && "Analyze"}
              {currentStep === 2 && "Start Chat"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/workflows")}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}