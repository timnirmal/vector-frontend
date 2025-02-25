// src/components/workflows/job-followup-workflow.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Upload, Calendar, FileText, Play, Pause, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface Analysis {
  compatibilityScore: number;
  strengths: string[];
  weaknesses: string[];
  cultureFit: number;
  workStyle: string[];
}

interface Interview {
  status: 'scheduled' | 'in-progress' | 'completed';
  scheduledTime?: Date;
  questions: string[];
  answers: string[];
}

export default function JobFollowupWorkflow() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  const mockQuestions = [
    "Tell me about your experience with React.",
    "How do you handle challenging situations?",
    "What's your approach to learning new technologies?",
    "Describe a project you're proud of."
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
      toast.success("CV uploaded successfully");
    }
  };

  const handleAnalyze = () => {
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

  const handleScheduleInterview = () => {
    setInterview({
      status: 'scheduled',
      scheduledTime: new Date(Date.now() + 86400000), // Tomorrow
      questions: mockQuestions,
      answers: []
    });
    toast.success("Interview scheduled");
  };

  const startInterview = () => {
    setIsInterviewActive(true);
    setInterview(prev => prev ? { ...prev, status: 'in-progress' } : null);
    toast("Interview started", {
      description: "Recording has begun"
    });
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setInterview(prev => prev ? { ...prev, status: 'completed' } : null);
    toast.success("Interview completed", {
      description: "Results are being processed"
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Job Follow-up Agent</h1>
        <p
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/workflows")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workflows
        </p>
      </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
            <TabsTrigger value="results" disabled={!analysis}>Results</TabsTrigger>
            <TabsTrigger value="interview" disabled={!analysis}>Interview</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="grid gap-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Upload CV</h2>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="cv-upload"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-4" />
                      <p>Upload CV (PDF, DOC, DOCX)</p>
                    </label>
                  </div>
                  {file && <p className="mt-2 text-sm text-gray-500">{file.name}</p>}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Job Description</h2>
                  <Textarea
                    placeholder="Enter the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[200px]"
                  />
                </CardContent>
              </Card>

              <Button 
                onClick={handleAnalyze}
                disabled={!file || !jobDescription}
              >
                Analyze CV
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results">
            {analysis && (
              <div className="grid gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium mb-2">Compatibility Score</p>
                        <Progress value={analysis.compatibilityScore} className="h-2" />
                        <p className="text-sm text-gray-500 mt-1">{analysis.compatibilityScore}% match</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="font-medium mb-2">Strengths</p>
                        <ul className="list-disc pl-5">
                          {analysis.strengths.map((strength, index) => (
                            <li key={index} className="text-green-600">{strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">Areas for Improvement</p>
                        <ul className="list-disc pl-5">
                          {analysis.weaknesses.map((weakness, index) => (
                            <li key={index} className="text-orange-600">{weakness}</li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div>
                        <p className="font-medium mb-2">Work Style Indicators</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.workStyle.map((style, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="interview">
            <div className="grid gap-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Interview Management</h2>
                  {!interview ? (
                    <div className="grid gap-4">
                      <Button onClick={handleScheduleInterview} className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Interview
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          <span>Scheduled for: {interview.scheduledTime?.toLocaleDateString()}</span>
                        </div>
                        <Button
                          onClick={isInterviewActive ? endInterview : startInterview}
                          variant={isInterviewActive ? "destructive" : "default"}
                        >
                          {isInterviewActive ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              End Interview
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start Interview
                            </>
                          )}
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="font-semibold">Question Bank</h3>
                        <ScrollArea className="h-[300px] rounded-md border p-4">
                          {mockQuestions.map((question, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg mb-2 ${
                                currentQuestion === index
                                  ? 'bg-blue-50 border border-blue-200'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <p className="font-medium">{question}</p>
                              {interview.answers[index] && (
                                <p className="text-sm text-gray-600 mt-2">
                                  Answer: {interview.answers[index]}
                                </p>
                              )}
                            </div>
                          ))}
                        </ScrollArea>
                      </div>

                      {interview.status === 'completed' && (
                        <div className="space-y-4">
                          <h3 className="font-semibold">Interview Summary</h3>
                          <Card>
                            <CardContent className="p-4">
                              <p>Interview completed successfully. View detailed analysis in the results tab.</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}