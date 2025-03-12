'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface InvoiceDetailsModalProps {
    invoice: any; // Replace with proper type once API response structure is finalized
    isOpen: boolean;
    onClose: () => void;
}

export default function InvoiceDetailsModal({ invoice, isOpen, onClose }: InvoiceDetailsModalProps) {
    if (!invoice) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Invoice Details</DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 h-full pr-4">
                    <div className="space-y-6 pb-6">
                        {/* Basic Information */}
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Invoice Number</p>
                                    <p className="font-medium">{invoice.invoice_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">{invoice.date || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="font-medium">{invoice.amount || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge
                                        className={`${invoice.status === 'processed' ? 'bg-green-100 text-green-800' : 
                                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            invoice.status === 'error' ? 'bg-red-100 text-red-800' : 
                                            'bg-gray-100 text-gray-800'}`}
                                    >
                                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                    </Badge>
                                </div>
                            </div>
                        </section>

                        {/* Vendor Information */}
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Vendor Name</p>
                                    <p className="font-medium">{invoice.vendor || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <p className="font-medium">{invoice.category || 'N/A'}</p>
                                </div>
                            </div>
                        </section>

                        {/* Line Items */}
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Line Items</h3>
                            {invoice.line_items && invoice.line_items.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.line_items.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{item.unit_price}</TableCell>
                                                <TableCell className="text-right">{item.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-gray-500">No line items available</p>
                            )}
                        </section>

                        {/* Additional Details */}
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Payment Terms</p>
                                    <p className="font-medium">{invoice.payment_terms || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Due Date</p>
                                    <p className="font-medium">{invoice.due_date || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">PO Number</p>
                                    <p className="font-medium">{invoice.po_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Notes</p>
                                    <p className="font-medium">{invoice.notes || 'N/A'}</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </ScrollArea>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}