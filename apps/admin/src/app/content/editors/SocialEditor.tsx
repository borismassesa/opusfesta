"use client"

import { useContent } from "@/context/ContentContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter, Instagram, Linkedin, Facebook, Youtube, Music2 } from "lucide-react";

const PinterestIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.05 8.97 7.35 10.58-.1-.95-.19-2.4.04-3.43.17-1.05 1.1-7.05 1.1-7.05s-.28-.56-.28-1.39c0-1.3.75-2.27 1.69-2.27.8 0 1.18.6 1.18 1.32 0 .8-.51 2-1.01 3.11-.29.61.58 1.11 1.18 1.11 1.42 0 2.51-1.5 2.51-3.66 0-1.91-1.38-3.25-3.36-3.25-2.29 0-3.63 1.72-3.63 3.5 0 .68.26 1.41.59 1.81.07.08.08.15.06.23l-.24.94c-.03.12-.1.15-.23.09-1.09-.51-1.77-2.1-1.77-3.38 0-2.77 2.01-5.31 5.79-5.31 3.04 0 5.41 2.17 5.41 5.07 0 3.02-1.9 5.45-4.54 5.45-.89 0-1.73-.46-2.02-1.06l-.55 2.1c-.2.78-.74 1.75-1.1 2.35.83.26 1.71.4 2.61.4 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
  </svg>
);

export function SocialEditor() {
  const { content, updateContent } = useContent();
  const { social } = content;

  const handleSocialChange = (platform: keyof typeof social, value: string) => {
    updateContent("social", {
      ...social,
      [platform]: value,
    });
  };

  const socialPlatforms = [
    {
      key: "twitter" as const,
      label: "X (Twitter)",
      icon: Twitter,
      placeholder: "https://twitter.com/yourhandle",
    },
    {
      key: "instagram" as const,
      label: "Instagram",
      icon: Instagram,
      placeholder: "https://instagram.com/yourhandle",
    },
    {
      key: "linkedin" as const,
      label: "LinkedIn",
      icon: Linkedin,
      placeholder: "https://linkedin.com/company/yourcompany",
    },
    {
      key: "tiktok" as const,
      label: "TikTok",
      icon: Music2,
      placeholder: "https://tiktok.com/@yourhandle",
    },
    {
      key: "facebook" as const,
      label: "Facebook",
      icon: Facebook,
      placeholder: "https://facebook.com/yourpage",
    },
    {
      key: "youtube" as const,
      label: "YouTube",
      icon: Youtube,
      placeholder: "https://youtube.com/@yourchannel",
    },
    {
      key: "pinterest" as const,
      label: "Pinterest",
      icon: PinterestIcon,
      placeholder: "https://pinterest.com/yourprofile",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>
            Manage social media links displayed in the footer. Leave empty to hide a platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div key={platform.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {platform.label}
                  </Label>
                  <Input
                    type="url"
                    value={social[platform.key] || ""}
                    onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="font-mono text-sm"
                  />
                </div>
              );
            })}
          </div>

          {/* Preview Section */}
          <div className="mt-6 p-4 rounded-lg border border-border bg-muted/20">
            <Label className="text-sm font-medium mb-3 block">Footer Preview</Label>
            <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
              {socialPlatforms
                .filter((platform) => social[platform.key] && social[platform.key].trim() !== "")
                .map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <a
                      key={platform.key}
                      href={social[platform.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-primary/30 transition-all duration-300"
                      aria-label={platform.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              {socialPlatforms.filter((platform) => social[platform.key] && social[platform.key].trim() !== "").length === 0 && (
                <p className="text-sm text-muted-foreground">No social media links added yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
