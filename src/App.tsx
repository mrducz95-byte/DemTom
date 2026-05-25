import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Sparkles, 
  Upload, 
  Loader2, 
  RefreshCw, 
  Smartphone, 
  Code2, 
  Check, 
  FileText, 
  Cpu, 
  Eye, 
  CheckCircle, 
  Plus, 
  Minus, 
  Sliders, 
  Info,
  History,
  Trash2,
  Maximize2,
  Save
} from "lucide-react";
import { KotlinCodeViewer } from "./components/KotlinCodeViewer";
import { CountResult, ShrimpMarker } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Navigation tabs
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"emulator" | "history">("emulator");
  
  // Simulation config
  const [simulatedCount, setSimulatedCount] = useState<number>(45);
  const [addDebris, setAddDebris] = useState<boolean>(true);
  const [simulatedTime, setSimulatedTime] = useState<string>("14:15");

  // Camera and Image states
  const [imageSource, setImageSource] = useState<"placeholder" | "simulation" | "uploaded" | "camera">("placeholder");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [liveStreamActive, setLiveStreamActive] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // API analysis result
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CountResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // History logs
  const [historyLogs, setHistoryLogs] = useState<Array<{
    id: string;
    timestamp: string;
    count: number;
    accuracy: number;
    source: string;
    img: string;
  }>>([
    {
      id: "shrimp-1",
      timestamp: "25/05/2026, 14:10",
      count: 42,
      accuracy: 94,
      source: "Trình giả lập",
      img: ""
    },
    {
      id: "shrimp-2",
      timestamp: "25/05/2026, 13:45",
      count: 78,
      accuracy: 91,
      source: "Ảnh tải lên",
      img: ""
    }
  ]);

  // Canvas ref for simulator
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update Simulated Time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setSimulatedTime(`${hh}:${mm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Drawer loop for the realistic Shrimp Seed Tray on Canvas
  useEffect(() => {
    if (imageSource === "simulation") {
      drawSimulationCanvas();
    }
  }, [simulatedCount, addDebris, imageSource]);

  const drawSimulationCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background (A clean, greyish-white circular plastic basin tray)
    ctx.fillStyle = "#EAEAEA";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Inner tray shadow & border
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#D4D4D4";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#F8F8F8";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 15, 0, Math.PI * 2);
    ctx.fill();

    // Subtle water ripples on background
    ctx.strokeStyle = "rgba(173, 216, 230, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 10, canvas.height / 2 + 10, canvas.width / 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2 + 20, canvas.height / 2 - 15, canvas.width / 5, 0, Math.PI * 2);
    ctx.stroke();

    // Seed Random with fixed numbers to lock layout for count values
    let randomSeedValue = 0.54321;
    function pseudoRandom() {
      const x = Math.sin(randomSeedValue++) * 10000;
      return x - Math.floor(x);
    }

    // Add Debris/Specks (testing robustness of AI engine)
    if (addDebris) {
      ctx.fillStyle = "rgba(78, 62, 53, 0.4)";
      for (let i = 0; i < 30; i++) {
        const radius = pseudoRandom() * 45 + 10;
        const angle = pseudoRandom() * Math.PI * 2;
        const debrisX = canvas.width / 2 + Math.cos(angle) * (canvas.width / 2 - radius - 20);
        const debrisY = canvas.height / 2 + Math.sin(angle) * (canvas.width / 2 - radius - 20);
        const size = pseudoRandom() * 1.5 + 0.5;

        // Draw specks
        ctx.beginPath();
        ctx.arc(debrisX, debrisY, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw baby Shrimps (Tôm giống / Post-larvae)
    // Small thread-like curves with eyes
    for (let i = 0; i < simulatedCount; i++) {
      const radius = pseudoRandom() * (canvas.width / 2 - 40);
      const angle = pseudoRandom() * Math.PI * 2;
      const shrimpX = canvas.width / 2 + Math.cos(angle) * radius;
      const shrimpY = canvas.height / 2 + Math.sin(angle) * radius;
      const rotationAngle = pseudoRandom() * Math.PI * 2;
      const length = pseudoRandom() * 6 + 10; // 10px to 16px long
      const curve = (pseudoRandom() - 0.5) * 6;

      ctx.save();
      ctx.translate(shrimpX, shrimpY);
      ctx.rotate(rotationAngle);

      // Translucent segmented shrimp body
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(length / 2, curve, length, 0);
      ctx.strokeStyle = "rgba(107, 86, 70, 0.55)";
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Hair-like tail
      ctx.beginPath();
      ctx.moveTo(length, 0);
      ctx.lineTo(length + 3, curve / 2);
      ctx.strokeStyle = "rgba(141, 120, 102, 0.45)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Tiny dark spot for eyes (black spots are typical for transparency shrimp seed)
      ctx.fillStyle = "rgba(22, 12, 5, 0.95)";
      ctx.beginPath();
      ctx.arc(-0.6, -0.5, 0.5, 0, Math.PI * 2);
      ctx.arc(-0.6, 0.5, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Tiny translucent long fine antennae at head
      ctx.lineWidth = 0.4;
      ctx.strokeStyle = "rgba(120, 100, 80, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-4, -2, -7, -1);
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-4, 2, -7, 1);
      ctx.stroke();

      ctx.restore();
    }
  };

  // Convert canvas to jpeg base64 base
  const getSimulatedImageBase64 = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
  };

  // Switch to Simulation Source
  const triggerSimulation = () => {
    setImageSource("simulation");
    setAnalysisResult(null);
    setApiError(null);
    // Let react draw canvas then fetch base64
    setTimeout(() => {
      drawSimulationCanvas();
    }, 50);
  };

  // Handle uploaded files
  const handleUploadedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSource("uploaded");
        setSelectedImageBase64((event.target.result as string).split(",")[1]);
        setAnalysisResult(null);
        setApiError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Browser Camera Access
  const startCamera = async () => {
    try {
      setLiveStreamActive(true);
      setImageSource("camera");
      setAnalysisResult(null);
      setApiError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setApiError("Không tìm thấy hoặc không được xếp quyền Camera của thiết bị.");
      setLiveStreamActive(false);
      setImageSource("placeholder");
    }
  };

  const captureCameraFrame = () => {
    const video = videoRef.current;
    if (!video || !liveStreamActive) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setSelectedImageBase64(dataUrl.split(",")[1]);
      setImageSource("uploaded");

      // Stop stream
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setLiveStreamActive(false);
    }
  };

  const cancelCamera = () => {
    const video = videoRef.current;
    if (video) {
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setLiveStreamActive(false);
    setImageSource("placeholder");
  };

  // Primary action: COUNT AI
  const runAICounter = async () => {
    let base64Payload: string | null = null;

    if (imageSource === "simulation") {
      base64Payload = getSimulatedImageBase64();
    } else if (imageSource === "uploaded" && selectedImageBase64) {
      base64Payload = selectedImageBase64;
    }

    if (!base64Payload) {
      setApiError("Vui lòng chụp ảnh hoặc tải bạt ảnh khay tôm lên trước.");
      return;
    }

    setIsAnalyzing(true);
    setApiError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/count-shrimp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageBase64: base64Payload,
          isHighAccuracy: true
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || "Không nhận được phản hồi chính xác.");
      }

      const result: CountResult = await response.json();
      setAnalysisResult(result);

      // Add to historical logs
      const formattedDate = new Date().toLocaleString("vi-VN");
      const sourceLabel = imageSource === "simulation" ? "Trình giả lập" : "Ảnh tải lên";
      
      const newLog = {
        id: "shrimp-" + Date.now(),
        timestamp: formattedDate,
        count: result.count,
        accuracy: result.accuracy,
        source: sourceLabel,
        // Save current image to log data
        img: `data:image/jpeg;base64,${base64Payload}`
      };
      setHistoryLogs(prev => [newLog, ...prev]);

    } catch (err: any) {
      setApiError(err.message || "Lỗi kết nối tới mô hình AI. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = () => {
    setHistoryLogs([]);
  };

  const handleSaveToGallery = () => {
    let dataUrl: string | null = null;
    if (imageSource === "simulation") {
      const canvas = canvasRef.current;
      if (canvas) {
        dataUrl = canvas.toDataURL("image/jpeg");
      }
    } else if (imageSource === "uploaded" && selectedImageBase64) {
      dataUrl = `data:image/jpeg;base64,${selectedImageBase64}`;
    }

    if (!dataUrl) {
      setApiError("Không tìm thấy hình ảnh nào để lưu vào Bộ sưu tập. Hãy tạo tray hoặc tải ảnh lên trước.");
      return;
    }

    try {
      // Trigger a direct JPEG image download
      const link = document.createElement("a");
      link.download = `shrimp-tray-capture-${Date.now()}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Trigger standard beautiful Android notification toast inside smartphone emulator
      setSuccessToast("Đã lưu ảnh khay tôm vào Bộ sưu tập thành công!");
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      setApiError("Lỗi khi kết nối tải xuống tệp ảnh.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col antialiased">
      {/* Top Banner Branding */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-display">Shrimp Counter</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">AI SMART</span>
              </div>
              <p className="text-slate-400 text-xs">Phần mềm nhận diện & đếm tôm giống thông minh bằng Generative AI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">UTC: 2026-05-25 14:15:21</span>
            <a 
              href="#kotlin-view-panel" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              <Code2 size={14} />
              Xem Code Kotlin
            </a>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* LEFT COMPONENT: The Simulated Android Smartphone Container (lg:col-span-5) */}
        <section className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-[390px] aspect-[9/18.5] bg-black rounded-[50px] p-3.5 shadow-2xl shadow-blue-900/15 border-4 border-slate-800 relative ring-12 ring-slate-900/50 flex flex-col">
            
            {/* Phone Notch/Island */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-36 bg-black rounded-b-2xl z-40 flex items-center justify-center">
              <div className="w-16 h-1 bg-neutral-900 rounded-full mb-1"></div>
              <div className="w-3.5 h-3.5 bg-zinc-900 rounded-full mb-1 ml-1.5 border border-zinc-800 flex items-center justify-center">
                <div className="w-1 h-1 bg-indigo-950 rounded-full"></div>
              </div>
            </div>

            {/* Simulated Phone Top Status Bar */}
            <div className="pt-2 px-5 flex justify-between items-center text-xs font-mono font-medium text-slate-400 select-none z-30">
              <span>{simulatedTime}</span>
              <div className="flex items-center gap-1.5">
                {/* Simulated Data */}
                <span className="text-[10px]">5G</span>
                {/* Simulated Signal Icon */}
                <div className="flex items-end gap-0.5 h-2">
                  <div className="w-0.5 h-1 bg-slate-400 rounded-full"></div>
                  <div className="w-0.5 h-1.5 bg-slate-400 rounded-full"></div>
                  <div className="w-0.5 h-2 bg-slate-400 rounded-full"></div>
                </div>
                {/* Battery Icon */}
                <div className="w-5 h-2.5 rounded-sm border border-slate-400 p-0.5 flex items-center">
                  <div className="w-full h-full bg-slate-400 rounded-2xs"></div>
                </div>
              </div>
            </div>

            {/* PHONE INNER CONTAINER (MainScreen.kt emulation) */}
            <div className="flex-1 rounded-[38px] bg-slate-900 overflow-hidden flex flex-col relative mt-1.5 border border-slate-800 shadow-inner">
              
              {/* TopAppBar Container */}
              <div className="bg-blue-600 px-5 py-4 flex items-center justify-between text-white shadow-md">
                <span className="font-bold text-sm tracking-wide font-display">Shrimp Counter</span>
                <div className="bg-blue-500/40 p-1.5 rounded-full hover:bg-blue-500/60 transition-colors pointer-events-none">
                  <Smartphone size={14} className="text-white" />
                </div>
              </div>

              {/* Inner screen contents */}
              <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto overflow-x-hidden pt-3">
                
                {/* Region 1: Image Viewport */}
                <div className="flex-1 flex flex-col justify-center items-center">
                  <div className="relative w-full aspect-square bg-slate-950 rounded-2xl border border-slate-800 shadow-md flex items-center justify-center overflow-hidden">
                    
                    {/* Placeholder mode */}
                    {imageSource === "placeholder" && (
                      <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-full mb-3 shadow-inner">
                          <Camera size={34} className="text-blue-500/80 animate-pulse" />
                        </div>
                        <p className="font-medium text-xs text-slate-300">Chụp ảnh khay tôm hoặc kéo thả ảnh vào đây để bắt đầu</p>
                        <p className="text-[10px] text-slate-500 mt-1">Chuẩn Material Design 3</p>
                      </div>
                    )}

                    {/* Simulation drawing canvas in Phone viewport */}
                    <div className={`w-full h-full relative ${imageSource === "simulation" ? "block" : "hidden"}`}>
                      <canvas 
                        ref={canvasRef} 
                        width={300} 
                        height={300} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Camera view screen */}
                    {imageSource === "camera" && (
                      <div className="w-full h-full relative">
                        <video 
                          ref={videoRef} 
                          className="w-full h-full object-cover" 
                          playsInline 
                          muted 
                        />
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                          <button
                            onClick={captureCameraFrame}
                            className="bg-emerald-600 active:bg-emerald-700 text-white rounded-full px-4 py-1.5 text-[10px] font-bold shadow-lg"
                          >
                            Đóng Khung Hình
                          </button>
                          <button
                            onClick={cancelCamera}
                            className="bg-red-600 active:bg-red-700 text-white rounded-full px-2 py-1.5 text-[10px] font-bold shadow-lg"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Standard Image upload view */}
                    {imageSource === "uploaded" && selectedImageBase64 && (
                      <img 
                        src={`data:image/jpeg;base64,${selectedImageBase64}`} 
                        alt="Tray upload" 
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Nút lưu ảnh vào thư viện nổi trên ảnh khi có ảnh */}
                    {imageSource !== "placeholder" && !isAnalyzing && (
                      <button
                        onClick={handleSaveToGallery}
                        className="absolute top-3 right-3 bg-slate-900/90 hover:bg-slate-800 active:bg-blue-600 border border-slate-700 text-white rounded-xl py-1.5 px-3 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all text-[11px] font-semibold cursor-pointer z-40"
                        title="Lưu ảnh khay tôm vào bộ sưu tập"
                      >
                        <Save size={13} className="text-blue-400" />
                        Lưu thư viện
                      </button>
                    )}

                    {/* OVERLAYS: Coordinates of detected shrimp seed from Real Gemini API */}
                    {analysisResult && (imageSource === "simulation" || imageSource === "uploaded") && (
                      <div className="absolute inset-0 pointer-events-none">
                        {analysisResult.shrimps.map((marker, index) => (
                          <div 
                            key={`shrimp-marker-${index}`}
                            className="absolute bg-transparent border-1.5 border-emerald-400 text-emerald-300 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                              left: `${marker.x}%`,
                              top: `${marker.y}%`,
                              width: "14px",
                              height: "14px",
                              boxShadow: "0 0 4px rgba(52, 211, 153, 0.6)"
                            }}
                          >
                            {/* Marker Center */}
                            <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Loading status layer */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-slate-950/80 flex flex-col justify-center items-center text-center p-4">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                        <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider animate-pulse">AI Đang Phân Tích...</span>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Đang đếm chính xác từng cá thể tốn larval qua mô hình Gemini</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* API Logs & Accuracy details */}
                <div className="my-4">
                  {apiError && (
                    <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-xl mb-3 flex items-start gap-2 text-red-300">
                      <span className="text-xs">{apiError}</span>
                    </div>
                  )}

                  {/* Results box matching requirements */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                    <div className="text-center">
                      <span className="text-[11px] uppercase tracking-wider text-blue-400 font-bold font-sans">Số lượng tôm phát hiện</span>
                      <div className="text-3xl font-bold font-display text-white mt-1">
                        {analysisResult ? analysisResult.count : 0} <span className="text-xs text-slate-500 font-sans font-normal">con/khay</span>
                      </div>

                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                        <Info size={11} className="text-blue-500" />
                        <span className="text-[11px] text-slate-300 font-medium">
                          Độ chính xác: <strong className="text-blue-400 font-bold">{analysisResult ? analysisResult.accuracy : 0}%</strong>
                        </span>
                      </div>
                    </div>

                    {analysisResult?.notes && (
                      <div className="border-t border-slate-800/80 mt-3 pt-2">
                        <p className="text-[10px] text-slate-400 italic font-medium">
                          <strong>Ghi chú:</strong> {analysisResult.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Region 3: Launch Camera Button */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Capture simulator */}
                    <button
                      onClick={triggerSimulation}
                      className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      Tạo Tray Giả Lập
                    </button>

                    {/* Upload button custom click trigger */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                    >
                      <Upload size={13} />
                      Tải khay tôm lên
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleUploadedFile} 
                    />
                  </div>

                  {/* Primary Trigger AI Button */}
                  <button
                    onClick={imageSource === "placeholder" ? startCamera : runAICounter}
                    disabled={isAnalyzing}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-3 text-xs font-bold tracking-wide shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Camera size={14} />
                    {imageSource === "placeholder" ? "Chụp ảnh ngay (Mở máy ảnh)" : "Bắt đầu đếm (AI Count)"}
                  </button>
                </div>

              </div>
              
              {/* Virtual Snackbar / Toast Alert inside Phone UI */}
              <AnimatePresence>
                {successToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-16 left-4 right-4 bg-slate-900 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 text-[11px] font-medium"
                  >
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span>{successToast}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Virtual Home Bar */}
              <div className="py-2.5 flex justify-center bg-slate-950/20 select-none">
                <div className="w-28 h-1 bg-slate-700 rounded-full"></div>
              </div>

            </div>

          </div>
        </section>

        {/* RIGHT AREA: THE CONTROL BOARD AND SOURCE CODE VIEWERS (lg:col-span-7) */}
        <section className="lg:col-span-7 flex flex-col gap-6">

          {/* Tab Selection */}
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 max-w-fit">
            <button
              onClick={() => setActiveWorkspaceTab("emulator")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeWorkspaceTab === "emulator" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu size={14} />
              Bảng Giả Lập & Thuật Toán
            </button>
            <button
              onClick={() => setActiveWorkspaceTab("history")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeWorkspaceTab === "history" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <History size={14} />
              Lịch sử kết quả ({historyLogs.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeWorkspaceTab === "emulator" ? (
              <motion.div
                key="workspace-emulator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Control sliders for canvas generation */}
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 flex flex-col gap-5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders size={16} className="text-blue-500" />
                      <h4 className="text-sm font-semibold text-white">Bảng cấu hình Tray giả lập tôm</h4>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono">Simulators</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                    {/* Shrimp Count Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium text-slate-300">
                        <span>Số lượng tôm trong dải:</span>
                        <strong className="text-blue-400 font-mono text-sm">{simulatedCount} con</strong>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setSimulatedCount(Math.max(5, simulatedCount - 5));
                            setImageSource("simulation");
                          }}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <Minus size={14} />
                        </button>
                        <input 
                          type="range"
                          min={5}
                          max={150}
                          step={5}
                          value={simulatedCount}
                          onChange={(e) => {
                            setSimulatedCount(parseInt(e.target.value));
                            setImageSource("simulation");
                          }}
                          className="flex-1 accent-blue-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                        <button 
                          onClick={() => {
                            setSimulatedCount(Math.min(150, simulatedCount + 5));
                            setImageSource("simulation");
                          }}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Tăng/giảm số lượng ấu trùng tôm dẹt giả lập bơi trong khay để trực quan hóa cách hệ thống đếm tôm.
                      </p>
                    </div>

                    {/* Specks / Debris config */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                        <span>Chất hữu cơ, bọt khí bám dính:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${addDebris ? "bg-amber-500/10 text-amber-500" : "bg-slate-800 text-slate-400"}`}>
                          {addDebris ? "Bật (Khó đếm)" : "Tắt (Dễ đếm)"}
                        </span>
                      </div>
                      <label className="relative flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={addDebris}
                          onChange={(e) => {
                            setAddDebris(e.target.checked);
                            setImageSource("simulation");
                          }}
                          className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 rounded accent-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-[11px] text-slate-400">Trộn lẫn hạt chất bẩn/ rêu mịn kiểm nghiệm độ chính xác AI</span>
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Hệ thống sử dụng Gemini phân biệt rõ các vết rêu, bọt nước rời rạc với tôm bơi thật.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show Kotlin view code */}
                <KotlinCodeViewer />
              </motion.div>
            ) : (
              <motion.div
                key="workspace-history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 flex flex-col gap-5 h-full"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-blue-500" />
                    <h4 className="text-sm font-semibold text-white font-display">Nhật ký quét tôm giống</h4>
                  </div>
                  {historyLogs.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} />
                      Xóa nhât ký
                    </button>
                  )}
                </div>

                {historyLogs.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
                    <History size={36} className="opacity-30 mb-2" />
                    <p className="text-xs font-medium">Chưa có kết quả quét nào được lưu lại.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[450px] overflow-y-auto">
                    {historyLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {log.img ? (
                            <img 
                              src={log.img} 
                              alt="Scan Thumbnail" 
                              className="w-12 h-12 object-cover rounded-lg border border-slate-800 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-900 text-slate-600 rounded-lg border border-slate-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              SIM
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-200">Đã phát hiện: {log.count} con</span>
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold font-mono">
                                {log.source}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Độ chính xác</span>
                          <strong className="text-xs text-blue-400 font-bold">{log.accuracy}%</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </main>

      {/* Corporate Professional Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-auto py-6 text-center select-none text-xs text-slate-500 leading-relaxed font-sans">
        <p>© 2026 Shrimp Counter Smart AI. Được phát triển kết hợp cùng nền tảng Google Gemini API.</p>
        <p className="mt-1 text-slate-600">Trang web hỗ trợ sao chép cấu trúc Kotlin & Material 3, phù hợp cho kĩ sư nuôi tôm và phát triển ứng dụng di động.</p>
      </footer>
    </div>
  );
}
