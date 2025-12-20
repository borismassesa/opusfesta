"use client"

import { useContent } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";

export function HeroEditor() {
  const { content, updateContent } = useContent();
  const { hero } = content;

  const handleTextChange = (field: keyof typeof hero, value: any) => {
    updateContent("hero", { [field]: value });
  };

  const updateTypingPhrase = (index: number, value: string) => {
    const newPhrases = [...hero.typingPhrases];
    newPhrases[index] = value;
    updateContent("hero", { typingPhrases: newPhrases });
  };

  const addTypingPhrase = () => {
    updateContent("hero", { typingPhrases: [...hero.typingPhrases, "New phrase"] });
  };

  const removeTypingPhrase = (index: number) => {
    const newPhrases = hero.typingPhrases.filter((_, i) => i !== index);
    updateContent("hero", { typingPhrases: newPhrases });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Hero Text</CardTitle>
          <CardDescription>Customize the main headline and introduction.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headlinePrefix">Headline Prefix</Label>
            <Input 
              id="headlinePrefix" 
              value={hero.headlinePrefix} 
              onChange={(e) => handleTextChange("headlinePrefix", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Typing Phrases (Animated)</Label>
            <div className="space-y-2">
              {hero.typingPhrases.map((phrase, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={phrase} 
                    onChange={(e) => updateTypingPhrase(index, e.target.value)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeTypingPhrase(index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addTypingPhrase} className="w-full mt-2">
                <Plus className="w-4 h-4 mr-2" /> Add Phrase
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subhead">Subhead</Label>
            <Textarea 
              id="subhead" 
              value={hero.subhead} 
              onChange={(e) => handleTextChange("subhead", e.target.value)}
              className="h-24"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
