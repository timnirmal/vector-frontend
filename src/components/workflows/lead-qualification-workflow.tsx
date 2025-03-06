"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Upload, Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------
// 1) Type definitions
// ---------------------------------------------
type Prospect = {
  id: string;
  company_name: string;
  first_name: string | null;
  last_name: string | null;
  work_email: string | null;
  user: string | null;
  Direct_email: string | null;
  phone_1: string | null;
  phone_2: string | null;
  job_Title: string | null;
  seniority: string | null;
  departments: string | null;
  country: string | null;
  continent: string | null;
  linkedin_Url: string | null;
  tags: string | null;
  company_domain: string | null;
  company_description: string | null;
  company_year_founded: string | null;
  company_website: string | null;
  company_number_of_employees: string | null;
  company_revenue: string | null;
  company_linkedin_URL: string | null;
  company_location: string | null;
  company_specialities: string | null;
  research_data: string | null;
  bant_analysis: string | null;
  final_analysis: string | null;
  budget_score: number | null;
  authority_score: number | null;
  need_score: number | null;
  timeline_score: number | null;
  // ... any other fields from your JSON
};

const API_BASE_URL = "https://api.know360.io/lead_qualification_agent";

export default function LeadQualificationWorkflow() {
  // ---------------------------------------------
  // 2) State management
  // ---------------------------------------------
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetched prospects after CSV is processed
  const [prospects, setProspects] = useState<Prospect[]>([]);

  // For controlling the progress bar when uploading
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal/Details
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // ---------------------------------------------
  // 3) File Upload Handler
  // ---------------------------------------------
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      setIsUploading(true);
      setUploadProgress(0);

      // Optional: show a "fake" progress bar
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Stop at 90% until the request finishes
          }
          return prev + 5;
        });
      }, 500);

      try {
        const response = await fetch(`${API_BASE_URL}/upload-csv/`, {
          method: "POST",
          body: formData,
        });

        // Clear the interval once fetch completes
        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          throw new Error(`Failed to upload: ${response.status}`);
        }

        const result = await response.json();
        toast.success("File uploaded successfully");

        // IMPORTANT:
        // Wait 1 minute, then fetch new prospects
        setTimeout(() => {
          fetchProspects();
        }, 60000);

        // If you want to handle the result in some way, do it here
        console.log("Upload result:", result);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file");
      } finally {
        setIsUploading(false);

        // Reset progress bar after short delay
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      }
    }
  };

  // ---------------------------------------------
  // 4) Fetch Prospects from API
  // ---------------------------------------------
  const fetchProspects = async () => {
    try {
      setIsProcessing(true);
      // Adjust to your actual endpoint returning the final data
      const response = await fetch(`${API_BASE_URL}/research/`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch prospects: ${response.status}`);
      }

      const data: Prospect[] = await response.json();
      setProspects(data);
      toast.success("Prospects data fetched successfully");
    } catch (error) {
      console.error("Error fetching prospects:", error);
      toast.error("Failed to fetch prospects data");
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------------------------------------
  // 5) Table + Modal Setup
  // ---------------------------------------------
  const handleRowClick = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setIsDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedProspect(null);
    setIsDialogOpen(false);
  };

  // ---------------------------------------------
  // 6) Render
  // ---------------------------------------------
  return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold mb-6">Lead Qualification Manager</h1>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap gap-3">
                {/* =============== Upload Leads Dialog =============== */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Leads
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Leads</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <input
                            type="file"
                            accept=".csv,.xlsx"
                            className="hidden"
                            id="lead-upload"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        <label htmlFor="lead-upload" className="cursor-pointer">
                          <FileSpreadsheet className="h-8 w-8 mx-auto mb-4" />
                          <p>Drop CSV or Excel file or click to browse</p>
                        </label>
                      </div>

                      <Button
                          onClick={() => document.getElementById("lead-upload")?.click()}
                          className="w-full"
                          disabled={isUploading}
                      >
                        {isUploading ? (
                            <>
                              <motion.div
                                  className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Uploading...
                            </>
                        ) : (
                            "Select File"
                        )}
                      </Button>

                      {/* Show a small progress bar during upload */}
                      {isUploading && (
                          <div className="mt-4">
                            <Progress value={uploadProgress} className="h-2" />
                            <div className="text-sm text-gray-500 mt-2">Uploading... {uploadProgress}%</div>
                          </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* =============== Refresh Data Button =============== */}
                <Button variant="outline" onClick={fetchProspects} disabled={isProcessing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? "animate-spin" : ""}`} />
                  Refresh Data
                </Button>
              </div>

              {/* =============== Prospects Table =============== */}
              <ScrollArea className="h-[500px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Prospect Name</TableHead>
                      <TableHead>Work Email</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Direct Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Authority</TableHead>
                      <TableHead>Need</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Analysis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prospects.map((item) => {
                      const phoneNumber = item.phone_1 || item.phone_2 || "N/A";
                      const prospectName = `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim();

                      return (
                          <TableRow
                              key={item.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleRowClick(item)}
                          >
                            <TableCell>{item.company_name || "N/A"}</TableCell>
                            <TableCell>{prospectName || "N/A"}</TableCell>
                            <TableCell>{item.work_email || "N/A"}</TableCell>
                            <TableCell>{item.user || "N/A"}</TableCell>
                            <TableCell>{item.Direct_email || "N/A"}</TableCell>
                            <TableCell>{phoneNumber}</TableCell>
                            <TableCell>{item.budget_score ?? "-"}</TableCell>
                            <TableCell>{item.authority_score ?? "-"}</TableCell>
                            <TableCell>{item.need_score ?? "-"}</TableCell>
                            <TableCell>{item.timeline_score ?? "-"}</TableCell>
                            <TableCell>
                              {item.final_analysis ? (
                                  <Badge
                                      className={
                                        item.final_analysis.toLowerCase() === "qualified"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                      }
                                  >
                                    {item.final_analysis}
                                  </Badge>
                              ) : (
                                  "-"
                              )}
                            </TableCell>
                          </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* =============== Modal for Showing Full Details =============== */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl w-full h-[80vh] flex flex-col">
            {/* Scrollable Content Area */}
            <div className="overflow-y-auto flex-1 p-4">
              {selectedProspect && (
                  <>
                    <DialogHeader>
                      <DialogTitle>
                        Full Details for {selectedProspect.first_name} {selectedProspect.last_name}
                      </DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Content */}
                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div>
                        <h3 className="font-semibold mb-2">Basic Info</h3>
                        <Separator />
                        <p><strong>Company Name:</strong> {selectedProspect.company_name || "N/A"}</p>
                        <p><strong>Work Email:</strong> {selectedProspect.work_email || "N/A"}</p>
                        <p><strong>Direct Email:</strong> {selectedProspect.Direct_email || "N/A"}</p>
                        <p><strong>Phone 1:</strong> {selectedProspect.phone_1 || "N/A"}</p>
                        <p><strong>Phone 2:</strong> {selectedProspect.phone_2 || "N/A"}</p>
                      </div>

                      {/* Company Info */}
                      <div>
                        <h3 className="font-semibold mb-2">Company Info</h3>
                        <Separator />
                        <p><strong>Domain:</strong> {selectedProspect.company_domain || "N/A"}</p>
                        <p><strong>Description:</strong> {selectedProspect.company_description || "N/A"}</p>
                        <p><strong>Year Founded:</strong> {selectedProspect.company_year_founded || "N/A"}</p>
                        <p>
                          <strong>Website:</strong>{" "}
                          {selectedProspect.company_website ? (
                              <a href={selectedProspect.company_website} target="_blank" rel="noopener noreferrer" className="underline">
                                {selectedProspect.company_website}
                              </a>
                          ) : (
                              "N/A"
                          )}
                        </p>
                      </div>

                      {/* BANT Scores */}
                      <div>
                        <h3 className="font-semibold mb-2">BANT Analysis</h3>
                        <Separator />
                        <p><strong>Budget Score:</strong> {selectedProspect.budget_score ?? "N/A"}</p>
                        <p><strong>Authority Score:</strong> {selectedProspect.authority_score ?? "N/A"}</p>
                        <p><strong>Need Score:</strong> {selectedProspect.need_score ?? "N/A"}</p>
                        <p><strong>Timeline Score:</strong> {selectedProspect.timeline_score ?? "N/A"}</p>
                        <p>
                          <strong>Final Analysis:</strong>{" "}
                          {selectedProspect.final_analysis ? (
                              <Badge
                                  className={
                                    selectedProspect.final_analysis.toLowerCase() === "qualified"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                  }
                              >
                                {selectedProspect.final_analysis}
                              </Badge>
                          ) : (
                              "N/A"
                          )}
                        </p>
                      </div>

                      {/* Research Data */}
                      {selectedProspect.research_data && (
                          <div>
                            <h3 className="font-semibold mb-2">Research Data</h3>
                            <Separator />
                            <pre className="bg-gray-100 p-2 mt-2 rounded max-h-[200px] overflow-auto">
                {selectedProspect.research_data}
              </pre>
                          </div>
                      )}
                    </div>
                  </>
              )}
            </div>

            {/* Close Button */}
            <div className="p-4 border-t flex justify-end">
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>


        </Dialog>
      </div>
  );
}
