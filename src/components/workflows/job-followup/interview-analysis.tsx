"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Target, Brain, MessageSquare } from "lucide-react";

import { InterviewAnalysisResponse } from './types';

interface InterviewAnalysisProps {
    analysis: InterviewAnalysisResponse | null;
    isLoading: boolean;
}

export default function InterviewAnalysis({ analysis, isLoading }: InterviewAnalysisProps) {
    if (isLoading) {
        return (
            <div className="space-y-6 py-4">
                <h2 className="text-xl font-semibold">Analyzing Interview Responses</h2>
                <p className="text-muted-foreground">
                    Please wait while we analyze your interview responses...
                </p>
                <Progress value={undefined} className="h-2 w-full animate-pulse" />
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="space-y-6 py-4">
                <h2 className="text-xl font-semibold">Interview Analysis</h2>
                <p className="text-muted-foreground">
                    No analysis data available.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Interview Analysis Results</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Overall Score:</span>
                    <span className="text-lg font-bold">
                        {analysis.overall_score}%
                    </span>
                </div>
            </div>

            <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                <div
                    className="bg-primary h-full transition-all duration-500 ease-in-out"
                    style={{ width: `${analysis.overall_score}%` }}
                ></div>
            </div>

            <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                    {/* Response Quality Metrics */}
                    <Card className="p-4">
                        <h3 className="text-lg font-medium mb-4">Response Quality Metrics</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">Clarity</span>
                                    <span className="text-sm font-medium">{analysis.response_quality.clarity}%</span>
                                </div>
                                <Progress value={analysis.response_quality.clarity} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">Completeness</span>
                                    <span className="text-sm font-medium">{analysis.response_quality.completeness}%</span>
                                </div>
                                <Progress value={analysis.response_quality.completeness} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">Relevance</span>
                                    <span className="text-sm font-medium">{analysis.response_quality.relevance}%</span>
                                </div>
                                <Progress value={analysis.response_quality.relevance} className="h-2" />
                            </div>
                        </div>
                    </Card>

                    <Separator />

                    {/* Key Strengths */}
                    <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Key Strengths
                        </h3>
                        <ul className="space-y-2">
                            {analysis.key_strengths.map((strength, index) => (
                                <li
                                    key={index}
                                    className="bg-green-500/10 p-3 rounded-md text-sm"
                                >
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/* Areas of Improvement */}
                    <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Areas of Improvement
                        </h3>
                        <ul className="space-y-2">
                            {analysis.areas_of_improvement.map((area, index) => (
                                <li
                                    key={index}
                                    className="bg-yellow-500/10 p-3 rounded-md text-sm"
                                >
                                    {area}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/* Themes Identified */}
                    <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            Themes Identified
                        </h3>
                        <ul className="space-y-2">
                            {analysis.themes_identified.map((theme, index) => (
                                <li
                                    key={index}
                                    className="bg-blue-500/10 p-3 rounded-md text-sm"
                                >
                                    {theme}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/* Recommendations */}
                    <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-500" />
                            Recommendations for Hiring Manager
                        </h3>
                        <ul className="space-y-2">
                            {analysis.recommendations_for_hiring_manager.map((rec, index) => (
                                <li
                                    key={index}
                                    className="bg-purple-500/10 p-3 rounded-md text-sm"
                                >
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/* Final Recommendation */}
                    <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Final Recommendation
                        </h3>
                        <div className="bg-primary/10 p-4 rounded-md text-sm font-medium">
                            {analysis.final_recommendation}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}