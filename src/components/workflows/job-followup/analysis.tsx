"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { CompatibilityResponse } from "./index";

interface AnalysisStepProps {
    analysis: CompatibilityResponse | null;
    isAnalyzing: boolean;
    handleAnalyzeProfile: () => Promise<CompatibilityResponse | undefined>;
}

export default function AnalysisStep({ analysis, isAnalyzing, handleAnalyzeProfile }: AnalysisStepProps) {
    if (isAnalyzing) {
        return (
            <div className="space-y-6 py-4">
                <h2 className="text-xl font-semibold">Analyzing Your Profile</h2>
                <p className="text-muted-foreground">
                    Please wait while we analyze your CV against the job description...
                </p>
                <Progress value={undefined} className="h-2 w-full animate-pulse" />
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="space-y-6 py-4">
                <h2 className="text-xl font-semibold">Ready for Analysis</h2>
                <p className="text-muted-foreground">
                    Click the button below to analyze your CV against the job description.
                </p>
                <Button 
                    onClick={handleAnalyzeProfile} 
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                    Analyze Profile
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Analysis Results</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Compatibility Score:</span>
                    <span className="text-lg font-bold">
                        {analysis.compatibility_score}%
                    </span>
                </div>
            </div>

            <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                <div
                    className="bg-primary h-full transition-all duration-500 ease-in-out"
                    style={{ width: `${analysis.compatibility_score}%` }}
                ></div>
            </div>

            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                    {/* Strengths */}
                    <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Strengths
                        </h3>
                        <ul className="space-y-2">
                            {analysis.strengths.map((strength, index) => (
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

                    {/* Potential Concerns */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Potential Concerns</h3>
                        <ul className="space-y-2">
                            {analysis.potential_concerns.map((concern, index) => (
                                <li
                                    key={index}
                                    className="bg-secondary p-3 rounded-md text-sm"
                                >
                                    {concern}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/* Work Style */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Work Style Indicators</h3>
                        <ul className="space-y-2">
                            {analysis.work_style_indicators.map((indicator, index) => (
                                <li
                                    key={index}
                                    className="bg-secondary p-3 rounded-md text-sm"
                                >
                                    {indicator}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/* Culture Fit */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Culture Fit</h3>
                        <ul className="space-y-2">
                            {analysis.culture_fit_aspects.map((aspect, index) => (
                                <li
                                    key={index}
                                    className="bg-secondary p-3 rounded-md text-sm"
                                >
                                    {aspect}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/* Adaptability */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Adaptability</h3>
                        <ul className="space-y-2">
                            {analysis.adaptability_signals.map((aspect, index) => (
                                <li
                                    key={index}
                                    className="bg-secondary p-3 rounded-md text-sm"
                                >
                                    {aspect}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/*/!* Salary Expectation TODO *!/*/}
                    {/*<div>*/}
                    {/*    <h3 className="text-lg font-medium mb-2">Salary Expectation</h3>*/}
                    {/*    <ul className="space-y-2">*/}
                    {/*        {analysis.salary_expectation.map((aspect, index) => (*/}
                    {/*            <li*/}
                    {/*                key={index}*/}
                    {/*                className="bg-secondary p-3 rounded-md text-sm"*/}
                    {/*            >*/}
                    {/*                {aspect}*/}
                    {/*            </li>*/}
                    {/*        ))}*/}
                    {/*    </ul>*/}
                    {/*</div>*/}

                    {/*<Separator />*/}

                    {/* Next Steps */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Recommended Next Steps</h3>
                        <div className="bg-primary/10 p-4 rounded-md text-sm">
                            {analysis.next_steps}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}