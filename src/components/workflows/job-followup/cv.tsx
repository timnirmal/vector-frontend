"use client";

import React from "react";
import { Upload, FileText } from "lucide-react";

interface CVStepProps {
    file: File | null;
    setFile: (file: File | null) => void;
    handleCVFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CVStep({
    file,
    setFile,
    handleCVFileSelect
}: CVStepProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Upload Your CV</h2>
            <p className="text-muted-foreground">
                Please upload your CV or resume to compare against the job description.
            </p>

            {/* File upload */}
            <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:bg-secondary/50 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Upload your CV</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Drag and drop your CV file here, or click to browse
                        </p>
                        <label
                            htmlFor="cv-file"
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
                        >
                            <span>Select File</span>
                            <input
                                id="cv-file"
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                className="hidden"
                                onChange={handleCVFileSelect}
                            />
                        </label>
                    </div>
                </div>

                {file && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-md">
                        <FileText className="h-5 w-5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="bg-secondary/50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Tips:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Upload your most recent and relevant CV</li>
                    <li>• Make sure your CV includes your skills and experience</li>
                    <li>• Supported formats: PDF, Word documents, and text files</li>
                    <li>• Maximum file size: 5MB</li>
                </ul>
            </div>
        </div>
    );
}