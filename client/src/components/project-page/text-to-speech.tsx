"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { convertTextToSpeech } from "@/app/actions/text-to-speech";
import { AVAILABLE_VOICES } from "@/lib/text-to-speech-types";
import { AudioPlayer } from "../audio/audio-player";

interface TextToSpeechProps {
  onAudioGenerated: (url: string) => void;
  projectId : string | null;

}

export default function TextToSpeech({ onAudioGenerated,  projectId}: TextToSpeechProps) {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSpeech = async () => {
    if (!script) {
      toast.error("Please enter a script first");
      return;
    }

    if (!selectedVoice) {
      toast.error("Please select a voice");
      return;
    }

    if (!projectId) {
      toast.error("Project ID is required");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedAudioUrl(null);

    try {
      const result = await convertTextToSpeech(script, selectedVoice, projectId);
      if (result.success && result.audioUrl) {
        setGeneratedAudioUrl(result.audioUrl);
        onAudioGenerated(result.audioUrl); // Add this line

        toast.success("Audio generated successfully");
      } else {
        toast.error(result.error || "Failed to generate audio");
      }
    } catch (error) {
      toast.error("Failed to generate audio");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column - Script Input and Audio Preview */}
      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Script Input</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full h-48 p-3 border rounded-md resize-none"
              placeholder="Enter your script here..."
            />
            <Button
              size="lg"
              onClick={handleGenerateSpeech}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Generate Speech"
              )}
            </Button>

            {generatedAudioUrl && (
              <div className="mt-4 flex  justify-center items-center flex-col">
                <h3 className="font-medium mb-2">Audio Preview</h3>
                <div className="border rounded-xl p-2 border-gray-800">

                <AudioPlayer src={generatedAudioUrl} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Voice Selection */}
      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Voice Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {AVAILABLE_VOICES.map((voice) => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <div
                  key={voice.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedVoice === voice.id
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedVoice(voice.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        selectedVoice === voice.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                    <span className="font-medium">{voice.name}</span>
                  </div>
                  {/* {voice.sampleUrl && (
                    <AudioPlayer 
                      src={voice.sampleUrl} 
                      size="sm"
                    />
                  )} */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
