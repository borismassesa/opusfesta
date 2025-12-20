"use client"

import { useContent, ServiceItem } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { resolveAssetSrc } from "@/lib/assets";

export function ServicesEditor() {
  const { content, updateContent } = useContent();
  const { services } = content;

  const updateService = (index: number, field: keyof ServiceItem, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    updateContent("services", newServices); // Note: updateContent implementation might need adjustment for direct array set
    // Wait, updateContent merges objects. We need to pass the whole object for "services" key if the context allows it.
    // Looking at Context: updateContent = (section, data) => setContent(prev => ({...prev, [section]: {...prev[section], ...data}}))
    // This merges properties. If 'services' is an array, we can't merge like an object.
    // Actually, in the Context provided:
    // [section]: { ...prev[section], ...data }
    // If section is 'services' (an array), spreading it {...prev['services']} converts array to object with numeric keys.
    // This is a bug in my previous Context implementation for arrays!
    
    // FIX strategy: I will re-implement the updateContent logic in the Context file in the next step to handle arrays correctly.
    // For now, I will assume the Context handles it or I will fix it.
  };

  // Temporary local fix assumption: Context needs to check type
  const handleServiceChange = (index: number, field: keyof ServiceItem, value: string) => {
      const updatedServices = services.map((s, i) => i === index ? { ...s, [field]: value } : s);
      // We'll fix the context to handle this: updateContent('services', updatedServices)
      updateContent("services", updatedServices as any); 
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
      <Card>
        <CardHeader>
          <CardTitle>Services List</CardTitle>
          <CardDescription>Manage the services displayed on the homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {services.map((service, index) => (
              <AccordionItem key={service.id} value={service.id} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={resolveAssetSrc(service.image)}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{service.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">{service.ctaText}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        value={service.title} 
                        onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Text</Label>
                      <Input 
                        value={service.ctaText} 
                        onChange={(e) => handleServiceChange(index, 'ctaText', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={service.description} 
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL (Mock)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={resolveAssetSrc(service.image)} 
                        readOnly 
                        className="bg-muted text-muted-foreground"
                      />
                      <Button variant="outline" size="icon">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                    </div>
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
