"use client";

import { useStudentsContent } from "@/context/StudentsContentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function FAQEditor() {
  const { content, updateContent } = useStudentsContent();

  const addFAQ = () => {
    updateContent((prev) => ({
      ...prev,
      faq: [
        ...prev.faq,
        {
          question: "",
          answer: "",
        },
      ],
    }));
  };

  const removeFAQ = (index: number) => {
    updateContent((prev) => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index),
    }));
  };

  const updateFAQ = (index: number, field: string, value: string) => {
    updateContent((prev) => ({
      ...prev,
      faq: prev.faq.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">FAQ</h2>
          <p className="text-muted-foreground text-sm">
            Manage frequently asked questions
          </p>
        </div>
        <Button onClick={addFAQ} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      <div className="space-y-4">
        {content.faq.map((faq, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>FAQ #{index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFAQ(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={faq.question}
                  onChange={(e) => updateFAQ(index, "question", e.target.value)}
                  placeholder="What types of opportunities are available?"
                />
              </div>

              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={faq.answer}
                  onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                  placeholder="We offer internships, part-time positions..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
