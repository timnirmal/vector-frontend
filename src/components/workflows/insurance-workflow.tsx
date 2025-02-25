// src/components/workflows/insurance-workflow.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ImagePlus, Send, Loader2, ChevronDown, ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Message {
  type: "system" | "user" | "result" | "image" | "thinking";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface VehicleDetails {
  license_plate: string;
  estimated_make_model: string;
  color: string;
  estimated_vehicle_type: string;
}

interface AccidentScene {
  location_type: string;
  road_condition: string;
  weather: string;
  lighting: string;
  traffic_density: string;
  road_markings_present: boolean;
  road_signage_present: string[];
  other_vehicles_detected: Array<{
    vehicle_type: string;
    license_plate: string;
  }>;
  skid_marks_length_meters: number;
  collision_angle: string;
  obstacles_detected: string[];
  pedestrians_detected: boolean;
}

interface AnalysisResult {
  vehicle_details: VehicleDetails;
  accident_scene: AccidentScene;
  notes: {
    topic: Array<any>;
  };
  estimatedValue?: number;
}

export default function InsuranceWorkflow() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "system",
      content:
        "Welcome! You can chat with us about your claim. If you are filing a claim, please upload images from multiple angles clearly showing the damages and area.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // Convert FileList to array of Files
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      toast.success(`${event.target.files.length} files selected`);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!inputMessage && selectedFiles.length === 0) {
      toast.error("Please enter a message or select files");
      return;
    }

    // Add user message to the chat
    if (inputMessage) {
      setMessages(prev => [
        ...prev,
        {
          type: "user",
          content: inputMessage,
          timestamp: new Date(),
        },
      ]);
    }
    
    // Add thinking animation
    setIsThinking(true);
    setMessages(prev => [
      ...prev,
      {
        type: "thinking",
        content: "",
        timestamp: new Date(),
      },
    ]);
    
    // Add any images to the message list
    if (selectedFiles.length > 0) {
      selectedFiles.forEach(file => {
        const imageUrl = URL.createObjectURL(file);
        setMessages(prev => [
          ...prev,
          {
            type: "image",
            content: file.name,
            imageUrl,
            timestamp: new Date(),
          },
        ]);
      });
    }
    
    setIsProcessing(true);
    
    toast.promise(
      // Real API call to the insurance processing endpoint
      (async () => {
        try {
          console.log('Sending request to insurance API...');
          
          // Make the API call with appropriate headers and timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          let requestBody: any = {};
          
          // If there's text input, add it to the request body
          if (inputMessage) {
            requestBody.text = inputMessage;
          }
          
          // If there are images, encode them as base64 and add to request
          if (selectedFiles.length > 0) {
            const imagePromises = selectedFiles.map(file => {
              return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  // Get the base64 string (remove the data:image/jpeg;base64, prefix)
                  const base64String = reader.result as string;
                  const base64Data = base64String.split(',')[1];
                  resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
            });
            
            // Wait for all image files to be converted to base64
            const base64Images = await Promise.all(imagePromises);
            
            // Add images array to request body
            requestBody.images = base64Images;
          }
          
          console.log('API Request Body Keys:', Object.keys(requestBody));
          
          // Make the API call with JSON format
          const response = await fetch('https://api.know360.io/insurance_agent/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          console.log('API Response Status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }
          
          // Parse the response
          const data = await response.json();
          console.log('API Response Data:', data);
          
          // Remove thinking message
          setIsThinking(false);
          
          let responseMessages: { type: "result" | "system"; content: any; timestamp: Date; }[] = [];
          
          // Handle text response from API - use result.answer instead of message
          if (data.result && data.result.answer) {
            responseMessages.push({
              type: "system" as const,
              content: data.result.answer,
              timestamp: new Date(),
            });
          } else if (data.message) {
            // Fallback for older format
            responseMessages.push({
              type: "system" as const,
              content: data.message,
              timestamp: new Date(),
            });
          }
          
          // Handle analysis results if present (either in result object or at the root)
          const analysisData = data.result || data;
          
          if (analysisData.vehicle_details || analysisData.accident_scene) {
            // Set the analysis result from the API
            setAnalysisResult(analysisData);
            
            responseMessages.push({
              type: "result" as const,
              content: "Analysis complete! Here are the details of the accident scene:",
              timestamp: new Date(),
            });
            
            if (analysisData.estimatedValue) {
              responseMessages.push({
                type: "result" as const,
                content: `Estimated damage value: $${Number(analysisData.estimatedValue).toFixed(2)}`,
                timestamp: new Date(),
              });
            }
          }
          
          // If no response messages were generated, add a default one
          if (responseMessages.length === 0) {
            responseMessages.push({
              type: "system" as const,
              content: "Request processed. Please provide more information if needed.",
              timestamp: new Date(),
            });
          }
          
          // Update messages state with response
          setMessages(prev => {
            const filtered = prev.filter(msg => msg.type !== "thinking");
            return [
              ...filtered,
              ...responseMessages
            ];
          });
          
          setIsProcessing(false);
          setInputMessage("");
          setSelectedFiles([]);
          return true;
        } catch (error: any) {
          console.error("Error processing request:", error);
          
          // Log detailed error info
          if (error.name === 'AbortError') {
            console.error("Request timed out");
          } else if (error instanceof TypeError && error.message.includes('NetworkError')) {
            console.error("Network error - Check CORS settings or network connectivity");
          }
          
          // Remove thinking message and add error response
          setMessages(prev => {
            const filtered = prev.filter(msg => msg.type !== "thinking");
            return [
              ...filtered,
              {
                type: "system",
                content: `Sorry, there was an error processing your request: ${error.message}. Please try again.`,
                timestamp: new Date(),
              },
            ];
          });
          setIsThinking(false);
          setIsProcessing(false);
          throw error; // Rethrow to trigger the toast error
        }
      })(),
      {
        loading: "Processing your request...",
        success: "Request processed successfully",
        error: "Failed to process request",
      }
    );
  };

  // Animation variants for thinking dots
  const dotsVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: { 
      y: [0, -5, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
      }
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-[calc(100vh-6rem)] bg-[#DEE6E5]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Insurance Claims Agent</h1>
        <p
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/workflows")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workflows
        </p>
      </div>

      <Card className="h-[calc(100vh-12rem)] flex flex-col">
        <CardContent className="flex flex-col h-full p-4 gap-4">
          <ScrollArea className="flex-grow bg-slate-50 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${
                    message.type === "user" || message.type === "image"
                      ? "justify-start flex-row-reverse"
                      : "justify-start"
                  }`}
                >
                  {message.type === "user" || message.type === "image" ? (
                    <img
                      src="/u.svg"
                      alt="User"
                      className="w-8 h-8"
                    />
                  ) : message.type !== "thinking" ? (
                    <img
                      src="/v.svg"
                      alt="Vector"
                      className="w-8 h-8"
                    />
                  ) : null}

                  {message.type === "thinking" ? (
                    <div className="p-3 bg-gray-100">
                      <motion.div 
                        className="flex space-x-1" 
                        variants={dotsVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <motion.div variants={dotVariants} className="h-2 w-2 bg-gray-500 rounded-full" />
                        <motion.div variants={dotVariants} className="h-2 w-2 bg-gray-500 rounded-full" />
                        <motion.div variants={dotVariants} className="h-2 w-2 bg-gray-500 rounded-full" />
                      </motion.div>
                    </div>
                  ) : message.type === "image" ? (
                    <div className="p-2 bg-[#DEE6E5] max-w-[80%]">
                      <img 
                        src={message.imageUrl} 
                        alt={message.content} 
                        className="max-w-full max-h-60 rounded" 
                      />
                      <p className="text-xs mt-1 text-gray-500">{message.content}</p>
                    </div>
                  ) : (
                    <div
                      className={`p-3 max-w-[80%] rounded ${
                        message.type === "user"
                          ? "bg-[#DEE6E5] text-green-900"
                          : message.type === "result"
                          ? "bg-green-100 text-green-900"
                          : "bg-white border"
                      }`}
                    >
                      {message.content}
                    </div>
                  )}
                </div>
              ))}

              {analysisResult && (
                <Collapsible className="bg-white mt-4 border border-gray-200 rounded">
                  <CollapsibleTrigger className="flex w-full items-center bg-gray-200 justify-between p-4">
                    <span className="font-medium">View Detailed Analysis</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">Vehicle Details</h3>
                      <div className="space-y-1 pl-2">
                        <div className="flex justify-between">
                          <span className="font-bold">License Plate:</span>
                          <span>{analysisResult.vehicle_details.license_plate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Make/Model:</span>
                          <span>{analysisResult.vehicle_details.estimated_make_model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Color:</span>
                          <span>{analysisResult.vehicle_details.color}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Vehicle Type:</span>
                          <span>{analysisResult.vehicle_details.estimated_vehicle_type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg mb-2">Accident Scene</h3>
                      <div className="space-y-1 pl-2">
                        <div className="flex justify-between">
                          <span className="font-bold">Location Type:</span>
                          <span>{analysisResult.accident_scene.location_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Road Condition:</span>
                          <span>{analysisResult.accident_scene.road_condition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Weather:</span>
                          <span>{analysisResult.accident_scene.weather}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Collision Angle:</span>
                          <span>{analysisResult.accident_scene.collision_angle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Pedestrians Present:</span>
                          <span>{analysisResult.accident_scene.pedestrians_detected ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg mb-2">Other Vehicles Detected</h3>
                      <div className="space-y-2 pl-2">
                        {analysisResult.accident_scene.other_vehicles_detected.map((vehicle, idx) => (
                          <div key={idx} className="border p-2 rounded">
                            <div className="flex justify-between">
                              <span className="font-bold">Type:</span>
                              <span>{vehicle.vehicle_type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold">License Plate:</span>
                              <span>{vehicle.license_plate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 items-end">
            <div className="flex-grow space-y-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <ImagePlus className="h-5 w-5" />
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={
                  isProcessing ||
                  isThinking ||
                  (!inputMessage && selectedFiles.length === 0)
                }
                className="h-10"
              >
                {isProcessing || isThinking ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <button 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSelectedFile(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}