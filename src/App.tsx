import { useState, useRef, useCallback } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";

type ErrorLevel = "L" | "M" | "Q" | "H";

const PRESET_COLORS = [
  { fg: "#000000", bg: "#ffffff", label: "Klasik" },
  { fg: "#1e3a5f", bg: "#ffffff", label: "Lacivert" },
  { fg: "#7c3aed", bg: "#f5f3ff", label: "Mor" },
  { fg: "#059669", bg: "#ecfdf5", label: "Yeşil" },
  { fg: "#dc2626", bg: "#fff1f2", label: "Kırmızı" },
  { fg: "#d97706", bg: "#fffbeb", label: "Amber" },
  { fg: "#0ea5e9", bg: "#f0f9ff", label: "Mavi" },
  { fg: "#db2777", bg: "#fdf2f8", label: "Pembe" },
];

export default function App() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [includeMargin, setIncludeMargin] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"url" | "text" | "email" | "phone" | "wifi">("url");

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  const tabTemplates: Record<string, string> = {
    url: "https://example.com",
    text: "Merhaba! Bu bir QR kodudur.",
    email: "mailto:ornek@email.com?subject=Merhaba&body=Mesajınız",
    phone: "tel:+905001234567",
    wifi: "WIFI:T:WPA;S:AgAdim;P:sifre123;;",
  };

  const tabLabels: Record<string, string> = {
    url: "🌐 URL",
    text: "📝 Metin",
    email: "📧 E-posta",
    phone: "📞 Telefon",
    wifi: "📶 Wi-Fi",
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setText(tabTemplates[tab]);
  };

  const handlePresetColor = (fg: string, bg: string) => {
    setFgColor(fg);
    setBgColor(bg);
  };

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-kod.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadSVG = useCallback(() => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-kod.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleCopyText = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isValid = text.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-blue-900 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4 shadow-lg">
          <span className="text-3xl">⬛</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">
          QR Kod Oluşturucu
        </h1>
        <p className="text-indigo-200 text-sm">
          Anında QR kod oluşturun, özelleştirin ve indirin
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT PANEL */}
        <div className="flex flex-col gap-5">
          {/* Tabs */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 flex gap-1 flex-wrap">
            {(Object.keys(tabLabels) as typeof activeTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 py-2 px-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-white text-indigo-900 shadow-md"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-lg">
            <label className="block text-sm font-semibold text-indigo-200 mb-2">
              İçerik
            </label>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="QR koda dönüştürülecek içeriği girin..."
                className="w-full bg-white/10 text-white placeholder-white/30 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition"
              />
              <button
                onClick={handleCopyText}
                title="Kopyala"
                className="absolute top-2 right-2 text-white/40 hover:text-white/80 transition text-xs bg-white/10 rounded-lg px-2 py-1"
              >
                {copied ? "✓ Kopyalandı" : "📋 Kopyala"}
              </button>
            </div>
            <p className="text-xs text-white/30 mt-1 text-right">{text.length} karakter</p>
          </div>

          {/* Colors */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-lg">
            <p className="text-sm font-semibold text-indigo-200 mb-3">🎨 Renk Teması</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {PRESET_COLORS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePresetColor(p.fg, p.bg)}
                  title={p.label}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 border-2 transition-all ${
                    fgColor === p.fg && bgColor === p.bg
                      ? "border-white scale-105 shadow-lg"
                      : "border-transparent hover:border-white/40"
                  }`}
                  style={{ background: p.bg }}
                >
                  <div
                    className="w-6 h-6 rounded-md"
                    style={{ background: p.fg }}
                  />
                  <span className="text-xs font-medium" style={{ color: p.fg }}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-white/50 mb-1">Ön Plan</label>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-white text-xs font-mono">{fgColor}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-white/50 mb-1">Arka Plan</label>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-white text-xs font-mono">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-lg">
            <p className="text-sm font-semibold text-indigo-200 mb-4">⚙️ Ayarlar</p>
            <div className="flex flex-col gap-4">
              {/* Size */}
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <label>Boyut</label>
                  <span className="font-mono text-white/80">{size}×{size}px</span>
                </div>
                <input
                  type="range"
                  min={128}
                  max={512}
                  step={8}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-indigo-400"
                />
                <div className="flex justify-between text-xs text-white/30 mt-0.5">
                  <span>128</span>
                  <span>512</span>
                </div>
              </div>

              {/* Error Correction */}
              <div>
                <label className="block text-xs text-white/50 mb-1">
                  Hata Düzeltme Seviyesi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["L", "M", "Q", "H"] as ErrorLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setErrorLevel(lvl)}
                      className={`py-1.5 rounded-lg text-sm font-bold transition-all ${
                        errorLevel === lvl
                          ? "bg-indigo-500 text-white shadow-md"
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/30 mt-1">
                  L = %7 · M = %15 · Q = %25 · H = %30 hata toleransı
                </p>
              </div>

              {/* Margin */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Kenar Boşluğu</span>
                <button
                  onClick={() => setIncludeMargin(!includeMargin)}
                  className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                    includeMargin ? "bg-indigo-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                      includeMargin ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col gap-5">
          {/* QR Preview */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col items-center">
            <p className="text-sm font-semibold text-indigo-200 mb-5 self-start">
              👁️ Önizleme
            </p>
            <div
              className="rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-300"
              style={{ background: bgColor, padding: includeMargin ? 16 : 0 }}
            >
              {isValid ? (
                <>
                  {/* Canvas önizleme için görünür */}
                  <div ref={canvasRef}>
                    <QRCodeCanvas
                      value={text}
                      size={Math.min(size, 300)}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={errorLevel}
                      marginSize={includeMargin ? 2 : 0}
                    />
                  </div>
                  {/* SVG indirme için DOM'da ama gizli */}
                  <div ref={svgRef} style={{ position: "absolute", opacity: 0, pointerEvents: "none", left: "-9999px" }}>
                    <QRCodeSVG
                      value={text}
                      size={size}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={errorLevel}
                      marginSize={includeMargin ? 2 : 0}
                    />
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 text-white/40"
                  style={{ width: 200, height: 200 }}
                >
                  <span className="text-5xl">⬜</span>
                  <span className="text-sm">İçerik girin</span>
                </div>
              )}
            </div>

            {isValid && (
              <p className="text-xs text-white/30 mt-4 text-center max-w-xs break-all">
                {text.length > 80 ? text.slice(0, 80) + "..." : text}
              </p>
            )}
          </div>

          {/* Export */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-lg">
            <p className="text-sm font-semibold text-indigo-200 mb-4">⬇️ İndir</p>

            <div className="flex gap-3">
              <button
                onClick={downloadPNG}
                disabled={!isValid}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  isValid
                    ? "bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <span>⬇️</span>
                PNG İndir
              </button>
              <button
                onClick={downloadSVG}
                disabled={!isValid}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  isValid
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white shadow-lg hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-95"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <span>⬇️</span>
                SVG İndir
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "⚡", title: "Anında", desc: "Gerçek zamanlı oluşturma" },
              { icon: "🎨", title: "Özelleştir", desc: "Renk ve boyut seçimi" },
              { icon: "📥", title: "İndir", desc: "PNG veya SVG formatı" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 backdrop-blur rounded-xl p-3 text-center border border-white/10"
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-white text-xs font-bold">{item.title}</div>
                <div className="text-white/40 text-xs mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-white/20 text-xs mt-10 text-center">
        QR Kod Oluşturucu • Tüm veriler tarayıcınızda işlenir
      </p>
    </div>
  );
}
