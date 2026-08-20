import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { 
  QrCode, Camera, Upload, Copy, Check, Download, Printer, RefreshCw, 
  Wifi, Link2, FileText, Cpu, User, Mail, Phone, MapPin, Sparkles, 
  Trash2, ExternalLink, Zap, Shield, AlertCircle, History, Maximize2, 
  SwitchCamera, Eye, Layers, Tag, Monitor
} from 'lucide-react';
import { JobTicket } from '../types';

type TabMode = 'generator' | 'scanner' | 'history';
type QrContentType = 'text' | 'url' | 'wifi' | 'asset' | 'vcard' | 'email' | 'phone' | 'ticket';

interface ScanHistoryItem {
  id: string;
  timestamp: string;
  type: string;
  rawText: string;
  title?: string;
}

interface QrCodeSuiteProps {
  tickets?: JobTicket[];
  onOpenTicket?: (ticketId: string) => void;
}

export const QrCodeSuite: React.FC<QrCodeSuiteProps> = ({ tickets = [], onOpenTicket }) => {
  const [activeSubTab, setActiveSubTab] = useState<TabMode>('generator');

  // ==========================================
  // GENERATOR STATE
  // ==========================================
  const [contentType, setContentType] = useState<QrContentType>('text');
  
  // Input fields
  const [textContent, setTextContent] = useState('WORKBENCH-PRO-DIAGNOSTICS-SERIAL-7749');
  const [urlContent, setUrlContent] = useState('https://workbench-pro.internal');
  
  // WiFi
  const [wifiSsid, setWifiSsid] = useState('Lab_Guest_5G');
  const [wifiPassword, setWifiPassword] = useState('TechDesk2026!');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // Asset Tag
  const [assetTag, setAssetTag] = useState('ASSET-PC-8921');
  const [assetDevice, setAssetDevice] = useState('Custom Gaming Rig (i9-14900K / RTX 4080)');
  const [assetSerial, setAssetSerial] = useState('SN-9984-XTR-01');
  const [assetTech, setAssetTech] = useState('TECH-01 (Apex)');
  const [assetTicketNo, setAssetTicketNo] = useState('TICK-1029');

  // Contact / vCard
  const [vcardName, setVcardName] = useState('Alex Vance');
  const [vcardOrg, setVcardOrg] = useState('Workbench Pro Electronics');
  const [vcardPhone, setVcardPhone] = useState('+1 (555) 234-5678');
  const [vcardEmail, setVcardEmail] = useState('alex@workbench.lab');

  // Email
  const [emailTo, setEmailTo] = useState('support@workbench.lab');
  const [emailSubject, setEmailSubject] = useState('Hardware Diagnostics Report');
  const [emailBody, setEmailBody] = useState('Attached please find the voltage rail test results.');

  // Phone / SMS
  const [phoneNumber, setPhoneNumber] = useState('+15552345678');

  // Customization Options
  const [qrFgColor, setQrFgColor] = useState('#0f172a');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [qrSize, setQrSize] = useState<number>(320);
  const [includeLabelSticker, setIncludeLabelSticker] = useState(true);
  const [stickerTitle, setStickerTitle] = useState('WORKBENCH LAB ASSET');
  
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ==========================================
  // SCANNER STATE
  // ==========================================
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scannedResultType, setScannedResultType] = useState<string>('text');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isCopyScanned, setIsCopyScanned] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  // ==========================================
  // SCAN HISTORY STATE
  // ==========================================
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('wb_qr_history');
      return saved ? JSON.parse(saved) : [
        {
          id: 'hist-1',
          timestamp: '2026-08-20 14:15',
          type: 'WIFI',
          rawText: 'WIFI:T:WPA;S:Lab_Diagnostics_5G;P:SafePass998;;',
          title: 'WiFi: Lab_Diagnostics_5G'
        },
        {
          id: 'hist-2',
          timestamp: '2026-08-20 12:40',
          type: 'ASSET',
          rawText: 'ASSET: PC-RTX4090 | SN: SN-88219 | TICKET: TICK-1002',
          title: 'Asset Tag: PC-RTX4090'
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wb_qr_history', JSON.stringify(scanHistory));
  }, [scanHistory]);

  // ==========================================
  // COMPUTE QR RAW STRING
  // ==========================================
  const getRawQrString = useCallback((): string => {
    switch (contentType) {
      case 'url':
        return urlContent.trim();
      case 'wifi':
        return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'asset':
        return JSON.stringify({
          tag: assetTag,
          device: assetDevice,
          serial: assetSerial,
          technician: assetTech,
          ticket: assetTicketNo,
          system: 'Workbench Pro'
        }, null, 2);
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardOrg}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${phoneNumber}`;
      case 'text':
      default:
        return textContent;
    }
  }, [
    contentType, urlContent, wifiAuth, wifiSsid, wifiPassword, wifiHidden,
    assetTag, assetDevice, assetSerial, assetTech, assetTicketNo,
    vcardName, vcardOrg, vcardPhone, vcardEmail, emailTo, emailSubject, emailBody,
    phoneNumber, textContent
  ]);

  // Generate QR Code onto Canvas / DataURL
  const generateQr = useCallback(async () => {
    const rawString = getRawQrString();
    if (!rawString) return;

    try {
      // 1. Generate base QR data URL
      const qrDataUrl = await QRCode.toDataURL(rawString, {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrFgColor,
          light: qrBgColor
        },
        errorCorrectionLevel: errorCorrectionLevel
      });

      if (!includeLabelSticker) {
        setGeneratedDataUrl(qrDataUrl);
        return;
      }

      // 2. Draw styled Technician Equipment Label sticker with header, barcode-like text & serial
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const padding = 24;
      const headerHeight = 44;
      const footerHeight = 56;
      const totalWidth = qrSize + (padding * 2);
      const totalHeight = qrSize + headerHeight + footerHeight + (padding * 2);

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // Draw Sticker Background (Clean crisp white or customized)
      ctx.fillStyle = qrBgColor === '#ffffff' ? '#fdfefe' : qrBgColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Sticker Border & Outline
      ctx.lineWidth = 3;
      ctx.strokeStyle = qrFgColor;
      ctx.strokeRect(6, 6, totalWidth - 12, totalHeight - 12);

      // Inner Header banner
      ctx.fillStyle = qrFgColor;
      ctx.fillRect(10, 10, totalWidth - 20, 36);

      // Header Text
      ctx.fillStyle = qrBgColor;
      ctx.font = 'bold 14px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stickerTitle.toUpperCase(), totalWidth / 2, 33);

      // Load QR Image onto canvas
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, padding, headerHeight + padding, qrSize, qrSize);

        // Footer Metadata text
        ctx.fillStyle = qrFgColor;
        ctx.textAlign = 'center';
        
        if (contentType === 'asset') {
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillText(`ID: ${assetTag}  ·  SN: ${assetSerial}`, totalWidth / 2, totalHeight - 34);
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(`TECH: ${assetTech}  ·  TICKET: ${assetTicketNo}`, totalWidth / 2, totalHeight - 18);
        } else if (contentType === 'wifi') {
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillText(`SSID: ${wifiSsid}`, totalWidth / 2, totalHeight - 34);
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(`AUTH: ${wifiAuth}  ·  SCAN TO CONNECT`, totalWidth / 2, totalHeight - 18);
        } else {
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText(rawString.length > 36 ? rawString.slice(0, 34) + '...' : rawString, totalWidth / 2, totalHeight - 26);
        }

        setGeneratedDataUrl(canvas.toDataURL('image/png'));
      };
      img.src = qrDataUrl;

    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  }, [
    getRawQrString, qrSize, qrFgColor, qrBgColor, errorCorrectionLevel,
    includeLabelSticker, stickerTitle, contentType, assetTag, assetSerial,
    assetTech, assetTicketNo, wifiSsid, wifiAuth
  ]);

  useEffect(() => {
    generateQr();
  }, [generateQr]);

  // Copy Image or Raw to Clipboard
  const handleCopyImage = async () => {
    if (!generatedDataUrl) return;
    try {
      const res = await fetch(generatedDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback copy raw text
      navigator.clipboard.writeText(getRawQrString());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = (format: 'png' | 'jpeg') => {
    if (!generatedDataUrl) return;
    const a = document.createElement('a');
    a.href = generatedDataUrl;
    a.download = `workbench-qr-${contentType}-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (!generatedDataUrl) return;
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>Print QR Label - Workbench Pro</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center; 
              margin: 20px; 
              font-family: sans-serif;
            }
            img { max-width: 90%; height: auto; }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <img src="${generatedDataUrl}" />
          <p style="font-family: monospace; font-size: 11px; margin-top: 10px;">Printed via Workbench Pro Diagnostics Suite</p>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Preset Color Palettes
  const applyColorPreset = (fg: string, bg: string) => {
    setQrFgColor(fg);
    setQrBgColor(bg);
  };

  // ==========================================
  // CAMERA SCANNER LOGIC
  // ==========================================
  const startCamera = async (facing = cameraFacing) => {
    stopCamera();
    setCameraError(null);
    setScannedResult(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      // Check torch capability (phones)
      const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
      setHasTorch(Boolean(capabilities?.torch));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setScannerActive(true);
        requestAnimationFrame(tickScanner);
      }
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Camera access error:', e);
      setCameraError(e.message || 'Unable to access camera. Please check device permissions.');
      setScannerActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    trackRef.current = null;
    setScannerActive(false);
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!trackRef.current || !hasTorch) return;
    try {
      const newTorch = !torchOn;
      const track = trackRef.current as MediaStreamTrack & { applyConstraints?: (c: unknown) => Promise<void> };
      if (track.applyConstraints) {
        await track.applyConstraints({ advanced: [{ torch: newTorch }] });
      }
      setTorchOn(newTorch);
    } catch (err) {
      console.error('Torch error:', err);
    }
  };

  const switchCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (scannerActive) {
      startCamera(nextFacing);
    }
  };

  // Screen Capture Scanner for Desktop
  const startScreenCapture = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScannerActive(true);
        requestAnimationFrame(tickScanner);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setCameraError(e.message || 'Screen capture cancelled or not allowed');
    }
  };

  // Scanner Tick Loop
  const tickScanner = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      if (scannerActive) {
        animationFrameRef.current = requestAnimationFrame(tickScanner);
      }
      return;
    }

    const video = videoRef.current;
    const canvas = scanCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) {
      // Beep sound feedback
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch {
        // AudioContext not allowed or ignored
      }

      handleSuccessfulScan(code.data);
      stopCamera();
      return;
    }

    if (scannerActive) {
      animationFrameRef.current = requestAnimationFrame(tickScanner);
    }
  };

  // Handle Successful Scan
  const handleSuccessfulScan = (rawText: string) => {
    setScannedResult(rawText);

    let type = 'TEXT';
    let title = rawText.slice(0, 30);

    if (rawText.startsWith('http://') || rawText.startsWith('https://')) {
      type = 'URL';
      title = 'URL: ' + rawText.replace(/^https?:\/\//, '').slice(0, 30);
    } else if (rawText.startsWith('WIFI:')) {
      type = 'WIFI';
      const ssidMatch = rawText.match(/S:([^;]+)/);
      title = ssidMatch ? `WiFi: ${ssidMatch[1]}` : 'WiFi Network';
    } else if (rawText.startsWith('BEGIN:VCARD')) {
      type = 'CONTACT';
      const nameMatch = rawText.match(/FN:([^\n\r]+)/);
      title = nameMatch ? `Contact: ${nameMatch[1]}` : 'vCard Contact';
    } else if (rawText.startsWith('mailto:')) {
      type = 'EMAIL';
      title = 'Email: ' + rawText.replace('mailto:', '').split('?')[0];
    } else if (rawText.startsWith('tel:')) {
      type = 'PHONE';
      title = 'Phone: ' + rawText.replace('tel:', '');
    } else if (rawText.includes('ASSET') || rawText.includes('"tag":')) {
      type = 'ASSET';
      title = 'Hardware Asset Tag';
    }

    setScannedResultType(type);

    // Add to history
    const newItem: ScanHistoryItem = {
      id: 'scan-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      type,
      rawText,
      title
    };
    setScanHistory(prev => [newItem, ...prev.slice(0, 49)]);
  };

  // Image File Scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleSuccessfulScan(code.data);
          setActiveSubTab('scanner');
        } else {
          setCameraError('No valid QR code was detected in the uploaded image. Please try a clearer picture.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Parse WiFi credentials if scanned
  const parseWifiData = (raw: string) => {
    const ssid = raw.match(/S:([^;]+)/)?.[1] || '';
    const pass = raw.match(/P:([^;]+)/)?.[1] || '';
    const auth = raw.match(/T:([^;]+)/)?.[1] || 'WPA';
    return { ssid, pass, auth };
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0f1422] border border-cyan-500/20 shadow-lg shadow-black/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-['Space_Grotesk'] tracking-wide">
                QR Diagnostic &amp; Asset Suite
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                High-speed Optical Tag Generator, Live Camera Scanner &amp; Work Order Decoder
              </p>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center bg-[#090c14] p-1 rounded-xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveSubTab('generator');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeSubTab === 'generator'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('scanner');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeSubTab === 'scanner'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveSubTab('history');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeSubTab === 'history'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Scan Log ({scanHistory.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. GENERATOR TAB                                        */}
      {/* ======================================================== */}
      {activeSubTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Controls & Data Inputs */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Content Category Selector */}
            <div className="p-4 rounded-2xl bg-[#0d111c] border border-white/10 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Select Tag / Content Type
              </span>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[
                  { id: 'asset', label: 'Asset Tag', icon: Tag, color: 'text-amber-400' },
                  { id: 'wifi', label: 'WiFi Access', icon: Wifi, color: 'text-cyan-400' },
                  { id: 'url', label: 'Web URL', icon: Link2, color: 'text-emerald-400' },
                  { id: 'text', label: 'Plain Text', icon: FileText, color: 'text-slate-300' },
                  { id: 'vcard', label: 'vCard Contact', icon: User, color: 'text-purple-400' },
                  { id: 'email', label: 'Email Note', icon: Mail, color: 'text-blue-400' },
                  { id: 'phone', label: 'Phone Call', icon: Phone, color: 'text-rose-400' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = contentType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setContentType(item.id as QrContentType)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-mono transition-all ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold shadow-sm shadow-cyan-500/10'
                          : 'bg-[#121624] border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${item.color}`} />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Content Form */}
            <div className="p-5 rounded-2xl bg-[#0d111c] border border-white/10 space-y-4">
              
              {/* Asset Tag Form */}
              {contentType === 'asset' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" />
                      Hardware Asset &amp; Work Order Sticker
                    </span>
                    <span className="text-[10px] text-slate-500">Thermal label ready</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Asset ID / Barcode Code</label>
                      <input
                        type="text"
                        value={assetTag}
                        onChange={(e) => setAssetTag(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-amber-400 focus:outline-none"
                        placeholder="ASSET-PC-1002"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Serial Number (SN)</label>
                      <input
                        type="text"
                        value={assetSerial}
                        onChange={(e) => setAssetSerial(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-amber-400 focus:outline-none"
                        placeholder="SN-9984-XTR"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Device Description / Spec</label>
                    <input
                      type="text"
                      value={assetDevice}
                      onChange={(e) => setAssetDevice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. Dell Precision 7820 Workstation (Dual Xeon)"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Assigned Technician</label>
                      <input
                        type="text"
                        value={assetTech}
                        onChange={(e) => setAssetTech(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-amber-400 focus:outline-none"
                        placeholder="TECH-01"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Ticket / RMA Number</label>
                      <input
                        type="text"
                        value={assetTicketNo}
                        onChange={(e) => setAssetTicketNo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-amber-400 focus:outline-none"
                        placeholder="TICK-1029"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WiFi Form */}
              {contentType === 'wifi' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <Wifi className="w-4 h-4" />
                      WiFi Quick Auto-Connect
                    </span>
                    <span className="text-[10px] text-slate-500">Android &amp; iOS one-tap join</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Network SSID (Name)</label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-none"
                        placeholder="Workbench_Lab_5G"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Encryption Security</label>
                      <select
                        value={wifiAuth}
                        onChange={(e) => setWifiAuth(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                        <option value="WEP">WEP (Legacy)</option>
                        <option value="nopass">Open Network (No Password)</option>
                      </select>
                    </div>
                  </div>

                  {wifiAuth !== 'nopass' && (
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">WiFi Password / Key</label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-none"
                        placeholder="Enter WiFi Key"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded bg-black/40 border-white/20 text-cyan-500 focus:ring-0"
                    />
                    <span className="text-[11px]">Hidden Network SSID</span>
                  </label>
                </div>
              )}

              {/* URL Form */}
              {contentType === 'url' && (
                <div className="space-y-3 font-mono text-xs">
                  <label className="text-[11px] text-slate-400 block mb-1">Target Web Address (URL)</label>
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <input
                      type="url"
                      value={urlContent}
                      onChange={(e) => setUrlContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-emerald-400 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              {/* Plain Text Form */}
              {contentType === 'text' && (
                <div className="space-y-3 font-mono text-xs">
                  <label className="text-[11px] text-slate-400 block mb-1">Text Payload / Diagnostic Log</label>
                  <textarea
                    rows={4}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-none"
                    placeholder="Enter serials, notes, or terminal output..."
                  />
                </div>
              )}

              {/* vCard Form */}
              {contentType === 'vcard' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Company / Organization</label>
                      <input
                        type="text"
                        value={vcardOrg}
                        onChange={(e) => setVcardOrg(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Form */}
              {contentType === 'email' && (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Recipient Email</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Message Body</label>
                    <textarea
                      rows={2}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Phone Form */}
              {contentType === 'phone' && (
                <div className="space-y-3 font-mono text-xs">
                  <label className="text-[11px] text-slate-400 block mb-1">Direct Dial Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono focus:border-rose-400 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Customization & Appearance Settings */}
            <div className="p-5 rounded-2xl bg-[#0d111c] border border-white/10 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Visual Style &amp; Sticker Configuration
              </span>

              {/* Palette Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Theme Presets:</span>
                {[
                  { name: 'Classic Crisp', fg: '#0f172a', bg: '#ffffff' },
                  { name: 'Cyber Amber', fg: '#b45309', bg: '#fef3c7' },
                  { name: 'Tech Cyan', fg: '#0e7490', bg: '#ecfeff' },
                  { name: 'Neon Emerald', fg: '#047857', bg: '#ecfdf5' },
                  { name: 'Dark Blueprint', fg: '#38bdf8', bg: '#0b1329' },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyColorPreset(p.fg, p.bg)}
                    className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-cyan-400 text-[11px] font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <span className="w-3 h-3 rounded-full border border-black/30" style={{ backgroundColor: p.fg }} />
                    <span className="text-slate-300">{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Foreground</label>
                  <div className="flex items-center gap-2 bg-[#141926] p-1.5 rounded-xl border border-white/10">
                    <input
                      type="color"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-300">{qrFgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Background</label>
                  <div className="flex items-center gap-2 bg-[#141926] p-1.5 rounded-xl border border-white/10">
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-300">{qrBgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Error Correction</label>
                  <select
                    value={errorCorrectionLevel}
                    onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono text-xs"
                  >
                    <option value="L">L (7% recovery)</option>
                    <option value="M">M (15% standard)</option>
                    <option value="Q">Q (25% high)</option>
                    <option value="H">H (30% ultra/stickers)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Size Resolution</label>
                  <select
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#141926] border border-white/10 text-white font-mono text-xs"
                  >
                    <option value={200}>200px (Compact)</option>
                    <option value={320}>320px (Standard)</option>
                    <option value={512}>512px (High Res)</option>
                    <option value={800}>800px (Print 300DPI)</option>
                  </select>
                </div>
              </div>

              {/* Sticker Header Toggle */}
              <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLabelSticker}
                    onChange={(e) => setIncludeLabelSticker(e.target.checked)}
                    className="rounded bg-black/40 border-white/20 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-xs font-mono">Format as Hardware Asset Sticker with Header &amp; Serial</span>
                </label>

                {includeLabelSticker && (
                  <input
                    type="text"
                    value={stickerTitle}
                    onChange={(e) => setStickerTitle(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141926] border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none"
                    placeholder="Sticker Banner Header"
                  />
                )}
              </div>

            </div>

          </div>

          {/* Right Live Preview & Export Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6 p-6 rounded-2xl bg-[#0d111c] border border-white/10 flex flex-col items-center justify-center space-y-5">
              
              <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                  {qrSize}x{qrSize}px · {errorCorrectionLevel}-Level
                </span>
              </div>

              {/* Rendered QR Image */}
              <div className="p-3 bg-[#06080d] rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center max-w-full overflow-hidden">
                {generatedDataUrl ? (
                  <img 
                    src={generatedDataUrl} 
                    alt="Generated QR Code"
                    className="max-h-72 w-auto object-contain rounded-lg transition-transform hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-slate-500 font-mono text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Raw Payload Preview snippet */}
              <div className="w-full bg-[#121624] p-3 rounded-xl border border-white/5 font-mono text-[11px] text-slate-400 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Raw Optical Payload</div>
                <div className="truncate text-cyan-300 select-all font-mono">
                  {getRawQrString()}
                </div>
              </div>

              {/* Export Buttons Grid */}
              <div className="w-full grid grid-cols-2 gap-2.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={handleCopyImage}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{isCopied ? 'Copied Image!' : 'Copy Image'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-medium transition-all"
                >
                  <Printer className="w-4 h-4 text-cyan-400" />
                  <span>Print Sticker</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload('png')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-white/10 text-slate-200 transition-all"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Download PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload('jpeg')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-white/10 text-slate-200 transition-all"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Download JPG</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SCANNER TAB (CAMERA & FILE UPLOAD)                   */}
      {/* ======================================================== */}
      {activeSubTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Camera / Scan Viewport */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0d111c] border border-white/10 space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    Optical Viewport &amp; Camera Scanner
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Works on webcams, smartphones, thermal tags &amp; screenshots
                  </p>
                </div>

                {/* Camera Action Buttons */}
                <div className="flex items-center gap-2">
                  {hasTorch && scannerActive && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`p-2 rounded-xl border text-xs font-mono transition-all ${
                        torchOn 
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/30' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                      }`}
                      title="Toggle Torch / Flashlight"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={switchCameraFacing}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all"
                    title={`Switch Camera (Currently: ${cameraFacing})`}
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Viewport Box */}
              <div className="relative aspect-video w-full bg-[#05070d] rounded-2xl border-2 border-dashed border-white/15 overflow-hidden flex flex-col items-center justify-center group">
                
                {/* Live Video */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${scannerActive ? 'block' : 'hidden'}`}
                  autoPlay
                  muted
                  playsInline
                />
                
                {/* Hidden canvas for jsQR sampling */}
                <canvas ref={scanCanvasRef} className="hidden" />

                {/* Animated Targeting Reticle when Camera is Active */}
                {scannerActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-64 h-64 border-2 border-cyan-400/80 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                      {/* Corner marks */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
                      {/* Scanning laser line animation */}
                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-bounce duration-1000 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}

                {/* Idle / Off Screen Overlay */}
                {!scannerActive && (
                  <div className="p-6 text-center space-y-3 font-mono">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Camera Standby</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Click below to initiate live camera scanner or upload an image file
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {cameraError && (
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-rose-500/90 text-white font-mono text-xs flex items-center gap-2 backdrop-blur-md shadow-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Scanner Control Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                {!scannerActive ? (
                  <button
                    type="button"
                    onClick={() => startCamera(cameraFacing)}
                    className="sm:col-span-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="sm:col-span-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold transition-all"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                )}

                {/* Screen Share Scan */}
                <button
                  type="button"
                  onClick={startScreenCapture}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-white/10 text-slate-200 transition-all"
                >
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>Scan Desktop Screen</span>
                </button>

                {/* Upload Image File */}
                <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-white/10 text-slate-200 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Image / Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          </div>

          {/* Right Decoded Result Action Center */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0d111c] border border-white/10 space-y-4">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Decoded Result Inspector
                </span>

                {scannedResult && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                    {scannedResultType}
                  </span>
                )}
              </div>

              {scannedResult ? (
                <div className="space-y-4">
                  
                  {/* Scanned Content Box */}
                  <div className="p-4 rounded-xl bg-[#06080e] border border-white/10 font-mono text-xs space-y-2">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Payload Detected
                    </div>
                    <div className="text-white break-all select-all font-mono leading-relaxed bg-[#111522] p-3 rounded-lg border border-white/5 max-h-48 overflow-y-auto">
                      {scannedResult}
                    </div>
                  </div>

                  {/* Context-Specific Actions */}
                  {scannedResultType === 'URL' && (
                    <a
                      href={scannedResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-md shadow-emerald-500/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Link in New Tab</span>
                    </a>
                  )}

                  {scannedResultType === 'WIFI' && (() => {
                    const { ssid, pass, auth } = parseWifiData(scannedResult);
                    return (
                      <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 font-mono text-xs space-y-2">
                        <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                          <Wifi className="w-4 h-4" />
                          WiFi Access Detected
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <div><span className="text-slate-500">SSID:</span> {ssid}</div>
                          <div><span className="text-slate-500">AUTH:</span> {auth}</div>
                          <div className="col-span-2"><span className="text-slate-500">PASS:</span> <code className="text-white font-bold bg-black/40 px-1 py-0.5 rounded">{pass || '(Open Network)'}</code></div>
                        </div>
                        {pass && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(pass);
                              setIsCopyScanned(true);
                              setTimeout(() => setIsCopyScanned(false), 2000);
                            }}
                            className="w-full py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-[11px] transition-all"
                          >
                            {isCopyScanned ? 'Password Copied!' : 'Copy WiFi Password'}
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Copy Raw Payload */}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(scannedResult);
                      setIsCopyScanned(true);
                      setTimeout(() => setIsCopyScanned(false), 2000);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs transition-all"
                  >
                    {isCopyScanned ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                    <span>{isCopyScanned ? 'Payload Copied to Clipboard!' : 'Copy Raw Text'}</span>
                  </button>

                  {/* Reset Scanner Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setScannedResult(null);
                      startCamera(cameraFacing);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-white/10 text-slate-300 font-mono text-xs transition-all"
                  >
                    <RefreshCw className="w-4 h-4 text-cyan-400" />
                    <span>Scan Another Code</span>
                  </button>

                </div>
              ) : (
                <div className="p-8 text-center space-y-2 font-mono text-xs text-slate-400">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div className="text-slate-300 font-bold">No QR Code Scanned Yet</div>
                  <div className="text-[11px] text-slate-500">
                    Align your phone or webcam with a QR code or drop an image file into the viewport.
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SCAN LOG & HISTORY TAB                               */}
      {/* ======================================================== */}
      {activeSubTab === 'history' && (
        <div className="p-5 rounded-2xl bg-[#0d111c] border border-white/10 space-y-4">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                Optical Scan History Log
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Persisted session scan records &amp; decoded hardware tickets
              </p>
            </div>

            {scanHistory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all optical scan history?')) {
                    setScanHistory([]);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {scanHistory.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-slate-500 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <div>No scans recorded yet. Use the Live Scanner or Upload tool to record barcodes.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {scanHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[#121624] border border-white/5 hover:border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs transition-all"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {item.type}
                      </span>
                      <span className="text-white font-bold truncate">
                        {item.title || item.rawText.slice(0, 40)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xl">
                      {item.rawText}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.rawText);
                        alert('Copied to clipboard: ' + item.rawText);
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Copy payload"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
