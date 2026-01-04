"use client"

import { useContent, FAQItem } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2 } from "lucide-react";

export function FAQEditor() {
  const { content, updateContent } = useContent();
  const { faqs } = content;

  const handleFAQChange = (index: number, field: keyof FAQItem, value: string) => {
    const newFAQs = [...faqs];
    newFAQs[index] = { ...newFAQs[index], [field]: value };
    updateContent("faqs", newFAQs);
  };

  const addFAQ = () => {
    updateContent("faqs", [
      ...faqs,
      { question: "New Question", answer: "New Answer" }
    ]);
  };

  const removeFAQ = (index: number) => {
    const newFAQs = faqs.filter((_, i) => i !== index);
    updateContent("faqs", newFAQs);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Manage the FAQ section content.</CardDescription>
          </div>
          <Button onClick={addFAQ} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline text-left">
                  <span className="truncate pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Input 
                      value={faq.question} 
                      onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Answer</Label>
                    <Textarea 
                      value={faq.answer} 
                      onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="destructive" size="sm" onClick={() => removeFAQ(index)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Question
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
