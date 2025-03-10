"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JDStepProps {
    jobDescription: string;
    setJobDescription: (value: string) => void;
    jdFile: File | null;
    setJdFile: (file: File | null) => void;
    handleJDFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleJDUpload?: () => Promise<void>;
}

export default function JDStep({
    jobDescription,
    setJobDescription,
    jdFile,
    setJdFile,
    handleJDFileSelect,
    handleJDUpload
}: JDStepProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Job Description</h2>
            <p className="text-muted-foreground">
                Please provide the job description you're applying for. You can either
                paste the text or upload a file.
            </p>

            {/* Text input */}
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Paste job description text:
                </label>
                <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[200px]"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />
            </div>

            {/* File upload */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Or upload a file:</label>
                <div className="flex items-center gap-4">
                    <label
                        htmlFor="jd-file"
                        className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-secondary"
                    >
                        <Upload className="h-4 w-4" />
                        <span>Upload JD</span>
                        <input
                            id="jd-file"
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                            onChange={handleJDFileSelect}
                        />
                    </label>
                    {jdFile && (
                        <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4" />
                            <span className="truncate max-w-[200px]">{jdFile.name}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-secondary/50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Tips:</h3>
                <ScrollArea className="h-[100px]">
                    <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Include the full job description for best results</li>
                        <li>• Make sure to include required skills and qualifications</li>
                        <li>• Include company culture information if available</li>
                        <li>
                            • Supported file formats: PDF, Word documents, and text files
                        </li>
                    </ul>
                </ScrollArea>
            </div>
        </div>
    );
}