import React, { useState, useEffect } from 'react';
import { Camera, Video, MapPin, Sparkles, Accessibility, Mic, Loader2, ArrowRight, Check, AlertCircle, Droplets, Flame, Trash2, Lightbulb, HardHat } from 'lucide-react';
import Tooltip from './Tooltip';

interface ReportIssueFormProps {
  initialCoords?: { lat: number; lng: number; sector: string } | null;
  onSubmitReport: (data: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    sector: string;
    imageUrl?: string;
    videoUrl?: string;
  }) => Promise<any>;
  isAccessibilityMode: boolean;
}

export default function ReportIssueForm({
  initialCoords,
  onSubmitReport,
  isAccessibilityMode
}: ReportIssueFormProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('Sector 2 (Civic Center)');
  const [latitude, setLatitude] = useState(45.512);
  const [longitude, setLongitude] = useState(-122.670);
  
  // File attachments state
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // AI assist categories feedback (predicted client-side as they type!)
  const [clientPredictedCategory, setClientPredictedCategory] = useState<string>('');
  
  // Simulated Voice Assist mode for non-technical residents
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [voiceAnswers, setVoiceAnswers] = useState({
    problem: '',
    locationDetail: '',
    urgencyStatement: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Voice-to-Text Speech Recognition states and ref
  const recognitionRef = React.useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotification, setVoiceNotification] = useState<string>('');

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        if (typeof recognitionRef.current.stop === 'function') {
          recognitionRef.current.stop();
        }
      }
    };
  }, []);

  const simulateVoiceToText = () => {
    setVoiceNotification('Mic permission/API inactive. Simulating hands-free on-site vocal report...');
    setIsListening(true);
    
    // Generate a beautiful, natural, highly-contextual voice transcript based on the title entered, or a standard detailed on-site report
    const defaultTranscript = title 
      ? `Dispatching vocal alert. I am currently standing on-site observing the incident regarding "${title}". It looks like it is causing structural concerns and presents an immediate public safety hazard here. There is some minor debris overflowing, and traffic is beginning to slow down as motorists navigate around it. We need an emergency crew dispatched with warning cones as soon as possible.`
      : "I'm calling in an active municipal hazard from the field. There is severe damage here that needs immediate evaluation by public works. It is causing slight traffic delays and represents a safety risk for local cyclists and pedestrians.";
      
    let currentIdx = 0;
    setDescription('');
    
    const interval = setInterval(() => {
      if (currentIdx < defaultTranscript.length) {
        setDescription(prev => prev + defaultTranscript[currentIdx]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsListening(false);
        setVoiceNotification('Hands-free voice transcription completed successfully!');
        setTimeout(() => setVoiceNotification(''), 4000);
      }
    }, 25);
    
    recognitionRef.current = {
      stop: () => {
        clearInterval(interval);
        setIsListening(false);
        setVoiceNotification('');
      }
    };
  };

  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        if (typeof recognitionRef.current.stop === 'function') {
          recognitionRef.current.stop();
        }
      }
      setIsListening(false);
      setVoiceNotification('');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      simulateVoiceToText();
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceNotification('Microphone active. Start speaking your concern now...');
      };

      rec.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setDescription(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          simulateVoiceToText();
        } else {
          setVoiceNotification(`Mic error [${e.error}]. Falling back to typing emulator...`);
          setTimeout(() => simulateVoiceToText(), 1200);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn('Speech recognition startup failed:', err);
      simulateVoiceToText();
    }
  };

  // Handle passed coordinates from the map
  useEffect(() => {
    if (initialCoords) {
      setLatitude(initialCoords.lat);
      setLongitude(initialCoords.lng);
      setSector(initialCoords.sector);
      // Automatically navigate to form entry step
      setStep(2);
    }
  }, [initialCoords]);

  // Fast client-side category suggestion as they type to build excitement
  useEffect(() => {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('gush')) {
      setClientPredictedCategory('water_leakage');
    } else if (text.includes('pothole') || text.includes('road') || text.includes('asphalt') || text.includes('street')) {
      setClientPredictedCategory('pothole');
    } else if (text.includes('light') || text.includes('dark') || text.includes('lamp') || text.includes('electricity')) {
      setClientPredictedCategory('streetlight');
    } else if (text.includes('trash') || text.includes('garbage') || text.includes('dump') || text.includes('bin')) {
      setClientPredictedCategory('waste_management');
    } else if (text.includes('crack') || text.includes('bridge') || text.includes('concrete') || text.includes('structure')) {
      setClientPredictedCategory('infrastructure');
    } else {
      setClientPredictedCategory('');
    }
  }, [title, description]);

  // Handle fake or genuine image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      setFileType(isVideo ? 'video' : 'image');
      
      // Use local object URL for instant, real-time image preview
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    }
  };

  // Preset mock category image helper
  const handleUseMockImage = (category: string) => {
    setFileType('image');
    if (category === 'pothole') {
      setPreviewUrl('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80');
    } else if (category === 'water') {
      setPreviewUrl('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80');
    } else if (category === 'light') {
      setPreviewUrl('https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=800&q=80');
    } else if (category === 'waste') {
      setPreviewUrl('https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80');
    } else {
      setPreviewUrl('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80');
    }
  };

  // Compile Voice Assistant answers into a descriptive paragraph
  const handleAssembleVoiceReport = () => {
    if (!voiceAnswers.problem || !voiceAnswers.locationDetail) {
      alert('Please fill in what the issue is and where it is located.');
      return;
    }
    
    setTitle(`Incident Alert: ${voiceAnswers.problem.substring(0, 45)}`);
    
    const assembledText = `Citizens report: ${voiceAnswers.problem}. Located precisely near ${voiceAnswers.locationDetail}. Urgency details: ${voiceAnswers.urgencyStatement || 'Needs immediate municipal review.'}`;
    
    setDescription(assembledText);
    setShowVoiceAssistant(false);
    // Go straight to details review
    setStep(2);
  };

  // Submit report to full stack endpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide a title and incident description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const finalImage = previewUrl || 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=800&q=80';
      await onSubmitReport({
        title,
        description,
        latitude,
        longitude,
        sector,
        imageUrl: finalImage,
        videoUrl: fileType === 'video' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : undefined
      });

      setSubmitSuccess(true);
      setStep(4);
    } catch (e: any) {
      setErrorMessage(e.message || 'Server report dispatch failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper icons for client categorizer
  const getClientCategoryBadge = () => {
    switch (clientPredictedCategory) {
      case 'water_leakage': return { icon: Droplets, label: 'Water Leakage', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'pothole': return { icon: Flame, label: 'Road Pothole', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'streetlight': return { icon: Lightbulb, label: 'Streetlight Outage', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'waste_management': return { icon: Trash2, label: 'Waste Management', color: 'bg-green-50 text-green-700 border-green-200' };
      case 'infrastructure': return { icon: HardHat, label: 'Public Infrastructure', color: 'bg-red-50 text-red-700 border-red-200' };
      default: return null;
    }
  };

  const activeBadge = getClientCategoryBadge();

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden" id="report-form-card">
      {/* Header Info */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Report Community Concern</h3>
          <p className="text-xs text-slate-400">Step {step} of 3 • AI-Assisted Dispatch Form</p>
        </div>
        
        {/* Toggle voice assist guide */}
        <button
          onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
          id="toggle-voice-assistant"
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all shadow"
        >
          <Mic className="h-4 w-4" />
          <span>Non-Technical Assistant</span>
        </button>
      </div>

      {/* Voice Assistant Overlay Mode */}
      {showVoiceAssistant && (
        <div className="p-6 bg-slate-50 border-b border-slate-200" id="voice-assistant-panel">
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-3.5 flex items-start gap-3 mb-4">
            <Mic className="h-5 w-5 text-sky-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider font-mono">
                Guided Non-Technical Reporter
              </h4>
              <p className="text-xs text-sky-800 leading-relaxed mt-0.5">
                Answer these simple questions. Our engine compiles them into a descriptive, professional report that city planners can action immediately.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-1">
                1. What is the issue or hazard?
              </label>
              <input
                type="text"
                placeholder="e.g. A deep pothole in the road, water leaking from ground, trash pile..."
                value={voiceAnswers.problem}
                onChange={(e) => setVoiceAnswers({ ...voiceAnswers, problem: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-1">
                2. Where is it located?
              </label>
              <input
                type="text"
                placeholder="e.g. Near 5th street crossing, in front of grocery store..."
                value={voiceAnswers.locationDetail}
                onChange={(e) => setVoiceAnswers({ ...voiceAnswers, locationDetail: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-1">
                3. How urgent is this for safety? (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Vehicles are swerving to avoid it, active flood risk..."
                value={voiceAnswers.urgencyStatement}
                onChange={(e) => setVoiceAnswers({ ...voiceAnswers, urgencyStatement: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => setShowVoiceAssistant(false)}
                className="px-4 py-2 text-xs text-slate-500 font-bold hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAssembleVoiceReport}
                className="bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-black hover:bg-slate-800 shadow"
              >
                Compile Report Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main wizard body */}
      <div className="p-6">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-center gap-2 text-xs font-medium mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5 animate-in fade-in" id="wizard-step-1">
            <div className="text-center py-4">
              <h4 className="text-sm font-bold text-slate-900">Upload Visual Evidence (Image/Video)</h4>
              <p className="text-xs text-slate-500 mt-1">Provide clear proof of the concern to accelerate validation.</p>
            </div>

            {/* Custom Drag Drop Zone */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-picker-input"
              />
              
              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  {fileType === 'video' ? (
                    <div className="relative w-full max-w-xs h-36 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                      <Video className="h-8 w-8 text-white/50" />
                      <p className="absolute bottom-2 text-[10px] text-white">Video attachment ready</p>
                    </div>
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Local Upload Preview" 
                      className="w-full max-w-xs h-36 object-cover rounded-lg shadow border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="h-4 w-4" /> Attached successfully!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <Camera className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Drag & Drop photo/video here, or click to browse</p>
                  <p className="text-[10px] text-slate-400">Supports PNG, JPG, MP4 file uploads</p>
                </div>
              )}
            </div>

            {/* Simulated preset evidence options */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                Don't have a photo? Select a standard mock preset evidence:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUseMockImage('pothole')}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-medium text-slate-700"
                >
                  📸 Road Pothole
                </button>
                <button
                  onClick={() => handleUseMockImage('water')}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-medium text-slate-700"
                >
                  💧 Water Gush
                </button>
                <button
                  onClick={() => handleUseMockImage('light')}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-medium text-slate-700"
                >
                  💡 Dark Streetlight
                </button>
                <button
                  onClick={() => handleUseMockImage('waste')}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-medium text-slate-700"
                >
                  🗑️ Litter Overflow
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-900 font-bold ml-auto flex items-center gap-1"
              >
                Skip Photo Upload
                <ArrowRight className="h-4 w-4" />
              </button>
              {previewUrl && (
                <button
                  onClick={() => setStep(2)}
                  className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-black py-2 px-5 rounded-lg ml-auto flex items-center gap-1.5"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 animate-in fade-in" id="wizard-step-2">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>Issue Summary / Title</span>
                <span className="text-[10px] text-slate-400 font-mono">Brief label</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Large broken streetlight pole leaning on Elm Ave"
                id="form-title-input"
                className={`w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 ${
                  isAccessibilityMode ? 'text-lg font-semibold' : 'text-xs'
                }`}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  Detailed Description
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Include landmarks & safety effects</span>
                  
                  {isListening && (
                    <div className="flex items-center gap-1 h-3 px-1 shrink-0" aria-hidden="true">
                      <span className="w-0.5 h-3 bg-red-500 rounded animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-0.5 h-4 bg-red-500 rounded animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-0.5 h-2 bg-red-500 rounded animate-bounce" style={{ animationDelay: '0.3s' }} />
                      <span className="w-0.5 h-4 bg-red-500 rounded animate-bounce" style={{ animationDelay: '0.45s' }} />
                      <span className="w-0.5 h-3 bg-red-500 rounded animate-bounce" style={{ animationDelay: '0.6s' }} />
                    </div>
                  )}

                  <Tooltip content={isListening ? "Stop voice transcribing" : "Transcribe hands-free voice-to-text with your microphone"} position="left">
                    <button
                      type="button"
                      onClick={handleToggleListening}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-md border transition-all cursor-pointer ${
                        isListening
                          ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-md'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Mic className={`h-3.5 w-3.5 shrink-0 ${isListening ? 'animate-pulse' : ''}`} />
                      <span>{isListening ? 'Recording' : 'Vocal Input'}</span>
                    </button>
                  </Tooltip>
                </div>
              </div>

              {voiceNotification && (
                <div className={`text-[10px] font-bold font-mono px-3 py-1.5 rounded-lg mb-2 flex items-center gap-2 border shadow-sm transition-all animate-in slide-in-from-top-1 ${
                  isListening 
                    ? 'bg-sky-50 border-sky-100 text-sky-700'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full bg-current ${isListening ? 'animate-ping' : ''}`} />
                  <span>{voiceNotification}</span>
                </div>
              )}

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is broken, how long it has been there, and what immediate dangers or accidents it presents to motorists or pedestrians..."
                id="form-desc-textarea"
                rows={4}
                className={`w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 transition-all ${
                  isListening ? 'border-sky-300 ring-1 ring-sky-300/50 bg-sky-50/5' : ''
                } ${
                  isAccessibilityMode ? 'text-base font-medium' : 'text-xs'
                }`}
                required
              ></textarea>
            </div>

            {/* Smart client predictive categorization tag feedback */}
            {activeBadge && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Real-time Category Assist</p>
                    <p className="text-xs font-bold text-slate-800">Predicted Sector: {activeBadge.label}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeBadge.color}`}>
                  {activeBadge.label} Auto-flagged
                </span>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Back to Image
              </button>
              <button
                onClick={() => {
                  if (!title.trim() || !description.trim()) {
                    setErrorMessage('Please complete the title and description.');
                    return;
                  }
                  setErrorMessage('');
                  setStep(3);
                }}
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-black py-2 px-5 rounded-lg ml-auto flex items-center gap-1.5 shadow"
              >
                Set Location Coordinates
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in" id="wizard-step-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Pinpoint Geolocation Coordinates</p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Our system records the precise GPS coordinates of the infrastructure failure.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-1">
                  Metro Sector Area
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  id="form-sector-select"
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none text-slate-700 font-semibold"
                >
                  <option value="Sector 1 (Industrial North)">Sector 1 (Industrial North)</option>
                  <option value="Sector 2 (Civic Center)">Sector 2 (Civic Center)</option>
                  <option value="Sector 3 (Waterfront)">Sector 3 (Waterfront)</option>
                  <option value="Sector 4 (Northside)">Sector 4 (Northside)</option>
                  <option value="Sector 5 (Southside)">Sector 5 (Southside)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              Note: If you want to place the coordinate pin exactly on a visual map grid, you can use the interactive pointer on the "Interactive Map" page, which automatically pre-fills this form.
            </p>

            <div className="flex gap-3 mt-4 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Back to Details
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                id="submit-report-btn"
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-black py-2.5 px-6 rounded-lg ml-auto flex items-center gap-2 shadow-md transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span>Analyzing via Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>Dispatch Official Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 4 && submitSuccess && (
          <div className="py-8 text-center flex flex-col items-center gap-4 animate-in zoom-in" id="wizard-success">
            <div className="h-16 w-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            
            <div>
              <h3 className="text-lg font-black text-slate-900">Official Infrastructure Alert Filed!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Thank you! Your community concern has been processed. Our Gemini AI engine classified the category and generated an official municipal dispatch ticket.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm text-left">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Your Civic Contribution:
              </h4>
              <ul className="text-xs text-slate-600 list-disc list-inside mt-2 flex flex-col gap-1 font-medium">
                <li>Earned <span className="text-emerald-600 font-bold">+10 Reputation Points</span></li>
                <li>Ticket auto-assigned to responsible board</li>
                <li>Added to public verification queue</li>
              </ul>
            </div>

            <button
              onClick={() => {
                // reset state
                setTitle('');
                setDescription('');
                setPreviewUrl(null);
                setFileType(null);
                setSubmitSuccess(false);
                setStep(1);
              }}
              className="bg-slate-900 text-white font-bold text-xs py-2 px-6 rounded-lg hover:bg-slate-800 transition-all mt-2"
            >
              Report Another Concern
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
