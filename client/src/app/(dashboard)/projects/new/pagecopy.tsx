// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Upload, Play, Sparkles, Loader2, Download, X } from "lucide-react";
// import { TEMPLATE_VIDEOS } from "@/lib/video-constants";
// import {
//   createFinalVideo,
// } from "@/app/actions/video-processing";
// import {
//   convertTextToSpeech,
//   getVoiceSample,
// } from "@/app/actions/text-to-speech";
// import { toast } from "sonner";
// import { AudioPlayer } from "@/components/audio/audio-player";
// import { FileUpload } from "@/components/video/file-uploader";
// import { SubtitleSegment, VideoPlayer } from "@/components/video/video-player";
// import { AVAILABLE_VOICES } from "@/lib/text-to-speech-types";
// import { generateSubtitles } from "@/app/actions/speech-to-text";


// export default function NewVideoPage() {
//   const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
//   const [selectedFont, setSelectedFont] = useState<string>("arial");
//   const [selectedColor, setSelectedColor] = useState<string>("white");
//   const [showTemplates, setShowTemplates] = useState(false);
//   const [script, setScript] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(
//     null
//   );
//   const [audioDuration, setAudioDuration] = useState(0);
//   const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
//   const [subtitles, setSubtitles] = useState<SubtitleSegment[]>([]);
//   const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
//   const [isCreatingVideo, setIsCreatingVideo] = useState(false);

//   // For voice samples
//   const [voiceSamples, setVoiceSamples] = useState<Record<string, string>>({});
//   const [loadingVoiceSample, setLoadingVoiceSample] = useState<string | null>(
//     null
//   );

//   // Add state for modal
//   const [showPreviewModal, setShowPreviewModal] = useState(false);

//   const fonts = [
//     { id: "arial", name: "Arial" },
//     { id: "roboto", name: "Roboto" },
//     { id: "montserrat", name: "Montserrat" },
//     { id: "opensans", name: "Open Sans" },
//     { id: "playfair", name: "Playfair Display" },
//   ];

//   const colors = [
//     { id: "white", name: "White", class: "bg-white border border-gray-300" },
//     { id: "black", name: "Black", class: "bg-black" },
//     { id: "red", name: "Red", class: "bg-red-500" },
//     { id: "blue", name: "Blue", class: "bg-blue-500" },
//     { id: "yellow", name: "Yellow", class: "bg-yellow-400" },
//   ];

//   // Estimate audio duration when script changes
//   useEffect(() => {
//     // Rough estimate: average reading speed is about 150 words per minute
//     const words = script.trim().split(/\s+/).length;
//     const estimatedDuration = (words / 150) * 60; // in seconds
//     setAudioDuration(estimatedDuration || 0);
//   }, [script]);

//   // Generate subtitles when audio is generated
//   useEffect(() => {
//     if (generatedAudioUrl && script && audioDuration > 0) {
//       generateSubtitles(script, generatedAudioUrl).then(newSubtitles => {
//         setSubtitles(newSubtitles);
//       });
//     }
//   }, [generatedAudioUrl, script, audioDuration]);

//   // Handle playing voice sample
//   const handlePlayVoiceSample = async (voiceId: string) => {
//     // If we already have the sample, don't generate it again
//     if (voiceSamples[voiceId]) {
//       return;
//     }

//     setLoadingVoiceSample(voiceId);

//     try {
//       const result = await getVoiceSample(voiceId);

//       if (result.success && result.audioUrl) {
//         setVoiceSamples((prev) => ({
//           ...prev,
//           [voiceId]: result.audioUrl!,
//         }));
//       } else {
//         toast(toast("An error occured when generating video"));
//       }
//     } catch (error) {
//       toast("An error occured when generating video");
//     } finally {
//       setLoadingVoiceSample(null);
//     }
//   };

//   // Handle text-to-speech conversion
//   const handleGenerateSpeech = async () => {
//     if (!script) {
//       toast.error("Please enter a script first");
//       return;
//     }

//     if (!selectedVoice) {
//       toast.error("Please select a voice");
//       return;
//     }

//     setIsGenerating(true);
//     setGeneratedAudioUrl(null);

//     try {
//       const result = await convertTextToSpeech(script, selectedVoice);

//       if (result.success && result.audioUrl) {
//         setGeneratedAudioUrl(result.audioUrl);
//         toast.success("Audio generated successfully");
//       } else {
//         toast.error(result.error || "Failed to generate audio");
//       }
//     } catch (error: unknown) {
//       console.error("Text-to-speech error:", error);
//       toast.error("Failed to generate audio");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   // Handle template video selection
//   const handleSelectTemplateVideo = (videoUrl: string) => {
//     setSelectedVideoUrl(videoUrl);
//     setShowTemplates(false);
//   };

//   // Handle video upload complete
//   const handleVideoUploadComplete = async (videoUrl: string) => {
//     setSelectedVideoUrl(videoUrl);
//     toast("The video Uploaded Successfully");

//     // Generate subtitles after video upload
//     if (generatedAudioUrl) {
//       const generatedSubtitles = await generateSubtitles(script, videoUrl);
//       setSubtitles(generatedSubtitles);
//     }
//   };

//   // Handle video upload error
//   const handleVideoUploadError = (error: string) => {
//     toast(toast("An error occured when generating video"));
//   };

//   // Handle video creation
//   const handleCreateVideo = async () => {
//     if (!selectedVideoUrl) {
//       toast("Video is missing");
//       return;
//     }

//     if (!generatedAudioUrl) {
//       toast("An error occurred when generating Audio");
//       return;
//     }

//     setIsCreatingVideo(true);
//     setFinalVideoUrl(null);

//     try {
//       const result = await createFinalVideo(
//         selectedVideoUrl,
//         generatedAudioUrl,
//         script, // Pass the script for subtitles
//         selectedFont,
//         selectedColor
//       );

//       if (result.success && result.videoUrl) {
//         setFinalVideoUrl(result.videoUrl);
//         toast("Video Generated Successfully");
//       } else {
//         toast("Failed to create Video");
//       }
//     } catch (error) {
//       toast("An error occurred when generating Video");
//     } finally {
//       setIsCreatingVideo(false);
//     }
//   };

//   return (
//     <div className="container mx-auto py-8 space-y-8">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold tracking-tight">Create New Video</h2>
//       </div>

//       {/* Video Source Selection */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Choose Video Source</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <Button
//               variant={!showTemplates ? "default" : "outline"}
//               size="lg"
//               className="flex-1 h-20 flex flex-col items-center justify-center gap-2"
//               onClick={() => setShowTemplates(false)}
//             >
//               <Upload className="h-6 w-6" />
//               <div>
//                 <div>Upload Video</div>
//                 <div className="text-xs text-muted-foreground">
//                   (1 min, max 10MB)
//                 </div>
//               </div>
//             </Button>
//             <Button
//               variant={showTemplates ? "default" : "outline"}
//               size="lg"
//               className="flex-1 h-20 flex flex-col items-center justify-center gap-2"
//               onClick={() => setShowTemplates(true)}
//             >
//               <div>Use Template Videos</div>
//             </Button>
//           </div>

//           {showTemplates ? (
//             <div className="mt-4">
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
//                 {TEMPLATE_VIDEOS.map((video) => (
//                   <div
//                     key={video.id}
//                     className="cursor-pointer hover:opacity-80 transition-opacity"
//                     onClick={() => handleSelectTemplateVideo(video.url)}
//                   >
//                     <div className="relative rounded-md overflow-hidden">
//                       <img
//                         src={video.thumbnail || "/placeholder.svg"}
//                         alt={video.name}
//                         className="w-full min-h-[120px] object-cover"
//                       />
//                       <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
//                         <Play className="h-8 w-8 text-white" />
//                       </div>
//                     </div>
//                     <div className="text-sm mt-1">{video.name}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <FileUpload
//               onUploadComplete={handleVideoUploadComplete}
//               onUploadError={handleVideoUploadError}
//               maxSizeMB={10}
//             />
//           )}

//           {selectedVideoUrl && (
//             <div className="mt-4">
//               <h3 className="text-lg font-medium mb-2">Selected Video</h3>
//               <video
//                 src={selectedVideoUrl}
//                 className="w-full min-h-[200px] object-contain rounded-md mb-3"
//                 controls
//               />
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Voice Selection */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Select Voice</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//             {AVAILABLE_VOICES.map((voice) => (
//               <div
//                 key={voice.id}
//                 className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
//                   selectedVoice === voice.id
//                     ? "border-green-500 bg-green-50"
//                     : "border-gray-200 hover:bg-gray-50"
//                 }`}
//                 onClick={() => setSelectedVoice(voice.id)}
//               >
//                 <span>{voice.name}</span>
//                 {loadingVoiceSample === voice.id ? (
//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-8 w-8"
//                     disabled
//                   >
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   </Button>
//                 ) : (
//                   <AudioPlayer
//                     src={voiceSamples[voice.id]}
//                     onPlay={() => handlePlayVoiceSample(voice.id)}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Script Input */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Video Script</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <Textarea
//             placeholder="Enter your script here. This text will be converted to speech for your video..."
//             className="min-h-[200px]"
//             value={script}
//             onChange={(e) => setScript(e.target.value)}
//           />
//           <div className="flex flex-col sm:flex-row gap-3">
//             <Button
//               className="flex-1"
//               onClick={handleGenerateSpeech}
//               disabled={isGenerating || !script || !selectedVoice}
//             >
//               {isGenerating ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Generating...
//                 </>
//               ) : (
//                 "Generate Speech"
//               )}
//             </Button>
//             <Button variant="outline" className="flex-1 gap-2">
//               <Sparkles className="h-4 w-4" />
//               Use AI to Generate Script
//             </Button>
//           </div>

//           {generatedAudioUrl && (
//             <div className="mt-4 p-4 bg-muted rounded-md">
//               <div className="flex items-center justify-between">
//                 <span className="font-medium">Generated Audio</span>
//                 <AudioPlayer src={generatedAudioUrl} />
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Subtitle Customization */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Subtitle Customization</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <Label>Select Font</Label>
//               <div className="grid grid-cols-1 gap-2">
//                 {fonts.map((font) => (
//                   <div
//                     key={font.id}
//                     className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
//                       selectedFont === font.id
//                         ? "border-green-500 bg-green-50"
//                         : "border-gray-200 hover:bg-gray-50"
//                     }`}
//                     onClick={() => setSelectedFont(font.id)}
//                   >
//                     <span className="text-base">{font.name}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="space-y-4">
//               <Label>Select Text Color</Label>
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                 {colors.map((color) => (
//                   <div
//                     key={color.id}
//                     className={`flex flex-col items-center gap-2 cursor-pointer ${
//                       selectedColor === color.id ? "scale-105" : ""
//                     }`}
//                     onClick={() => setSelectedColor(color.id)}
//                   >
//                     <div
//                       className={`h-12 w-12 rounded-full ${color.class} ${
//                         selectedColor === color.id
//                           ? "ring-2 ring-green-500 ring-offset-2"
//                           : ""
//                       }`}
//                     />
//                     <span className="text-sm">{color.name}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Preview Button */}
//       {selectedVideoUrl && generatedAudioUrl && subtitles.length > 0 && (
//         <div className="flex justify-end">
//           <Button
//             size="lg"
//             onClick={() => setShowPreviewModal(true)}
//             className="gap-2"
//           >
//             <Play className="h-4 w-4" />
//             Preview & Create Video
//           </Button>
//         </div>
//       )}

//       {/* Preview Modal */}
//       {showPreviewModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg w-full max-w-4xl p-6 space-y-4">
//             <div className="flex justify-between items-center">
//               <h2 className="text-2xl font-bold">Preview Video</h2>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => setShowPreviewModal(false)}
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>

//             <VideoPlayer
//               videoSrc={selectedVideoUrl || undefined}
//               audioSrc={generatedAudioUrl || undefined}
//               subtitles={subtitles}
//               fontFamily={selectedFont}
//               textColor={selectedColor}
//               className="w-full aspect-video"
//             />

//             <div className="flex justify-end gap-3">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowPreviewModal(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 size="lg"
//                 onClick={handleCreateVideo}
//                 disabled={isCreatingVideo}
//               >
//                 {isCreatingVideo ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Creating Video...
//                   </>
//                 ) : (
//                   "Create Final Video"
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Download Final Video */}
//       {finalVideoUrl && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Your Video is Ready!</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <VideoPlayer
//               videoSrc={finalVideoUrl}
//               subtitles={subtitles}
//               fontFamily={selectedFont}
//               textColor={selectedColor}
//               className="w-full max-h-[500px]"
//             />

//             <div className="flex justify-center mt-4">
//               <Button
//                 size="lg"
//                 className="px-8 gap-2"
//                 onClick={() => window.open(finalVideoUrl, "_blank")}
//               >
//                 <Download className="h-4 w-4" />
//                 Download Video
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
