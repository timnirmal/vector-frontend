// src/components/workflows/invoice-workflow.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Upload, Download, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceData {
  category: string;
  description: string;
  vendor: string;
  amount: string;
}

export default function InvoiceWorkflow() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<InvoiceData[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setProcessedData([
        {
          category: 'Professional Services',
          description: 'Consulting Services',
          vendor: 'Acme Corp',
          amount: '$1,000.00'
        },
        // Add more mock data as needed
      ]);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Invoice Automation Agent</h1>
        <p
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/workflows")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workflows
        </p>
      </div>

        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Upload Invoices</h2>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    className="hidden"
                    id="invoice-upload"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="invoice-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-4" />
                    <p>Drop PDF invoices here or click to browse</p>
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      {files.length} file(s) selected
                    </p>
                    <Button
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="mt-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Process Invoices'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {processedData.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Results</h2>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.vendor}</TableCell>
                          <TableCell className="text-right">{item.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}