"use client";

import { ImagePlus, RotateCcw, RotateCw, SlidersHorizontal, X, ZoomIn } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type Props = {
  image: string;
  t: (source: string) => string;
  onApply: (image: string) => void;
  onClose: () => void;
};

export function PhotoEditorModal({ image, t, onApply, onClose }: Props) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [aspect, setAspect] = useState("original");
  const [filter, setFilter] = useState("none");
  const [overlayText, setOverlayText] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  function reset() {
    setRotation(0);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setAspect("original");
    setFilter("none");
    setOverlayText("");
    setLogo(null);
  }

  const filterCss = `${filter === "mono" ? "grayscale(100%) " : filter === "warm" ? "sepia(30%) " : filter === "cool" ? "hue-rotate(165deg) saturate(115%) " : ""}brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

  function addLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function applyEdits() {
    setIsSaving(true);
    try {
      const source = new Image();
      source.src = image;
      await source.decode();

      const normalizedRotation = ((rotation % 360) + 360) % 360;
      const swapped = normalizedRotation === 90 || normalizedRotation === 270;
      const maxSide = 2000;
      const ratio = Math.min(1, maxSide / Math.max(source.naturalWidth, source.naturalHeight));
      const sourceWidth = Math.round(source.naturalWidth * ratio);
      const sourceHeight = Math.round(source.naturalHeight * ratio);
      const rotatedWidth = swapped ? sourceHeight : sourceWidth;
      const rotatedHeight = swapped ? sourceWidth : sourceHeight;
      const aspectValue = aspect === "1:1" ? 1 : aspect === "4:5" ? 4 / 5 : aspect === "9:16" ? 9 / 16 : rotatedWidth / rotatedHeight;
      let outputWidth = rotatedWidth;
      let outputHeight = rotatedHeight;
      if (rotatedWidth / rotatedHeight > aspectValue) outputWidth = Math.round(rotatedHeight * aspectValue);
      else outputHeight = Math.round(rotatedWidth / aspectValue);
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((normalizedRotation * Math.PI) / 180);
      context.scale(zoom, zoom);
      context.filter = filterCss;
      context.drawImage(source, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.filter = "none";
      if (overlayText.trim()) {
        const fontSize = Math.max(26, Math.round(canvas.width * 0.045));
        context.font = `700 ${fontSize}px Arial, sans-serif`;
        const padding = Math.round(fontSize * 0.65);
        const textWidth = Math.min(canvas.width - padding * 2, context.measureText(overlayText).width);
        context.fillStyle = "rgba(11,31,51,.78)";
        context.fillRect(0, canvas.height - fontSize - padding * 2, canvas.width, fontSize + padding * 2);
        context.fillStyle = "#ffffff";
        context.fillText(overlayText, padding, canvas.height - padding, textWidth);
      }
      if (logo) {
        const logoImage = new Image();
        logoImage.src = logo;
        await logoImage.decode();
        const logoWidth = Math.min(canvas.width * 0.2, logoImage.naturalWidth);
        const logoHeight = logoWidth * (logoImage.naturalHeight / logoImage.naturalWidth);
        const padding = canvas.width * 0.035;
        context.drawImage(logoImage, canvas.width - logoWidth - padding, padding, logoWidth, logoHeight);
      }
      onApply(canvas.toDataURL("image/jpeg", 0.9));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="photo-editor-backdrop" role="dialog" aria-modal="true" aria-label={t("Photo editor")}>
      <div className="photo-editor-modal">
        <div className="photo-editor-header">
          <div><p className="muted-label">{t("PHOTO EDITOR")}</p><h2>{t("Edit photo")}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label={t("Close")}><X size={20}/></button>
        </div>

        <div className={`photo-editor-stage aspect-${aspect.replace(":", "-")}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={t("Photo preview")} style={{ transform: `rotate(${rotation}deg) scale(${zoom})`, filter: filterCss }} />
          {overlayText && <strong className="photo-editor-text">{overlayText}</strong>}
          {logo && <img className="photo-editor-logo" src={logo} alt={t("Logo")}/>} 
        </div>

        <div className="photo-editor-controls">
          <div className="photo-editor-actions">
            <button className="secondary-button" onClick={() => setRotation((value) => value - 90)}><RotateCcw size={17}/>{t("Rotate left")}</button>
            <button className="secondary-button" onClick={() => setRotation((value) => value + 90)}><RotateCw size={17}/>{t("Rotate right")}</button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={addLogo}/>
            <button className="secondary-button" onClick={() => logoRef.current?.click()}><ImagePlus size={17}/>{t("Add logo")}</button>
            <button className="secondary-button" onClick={reset}><SlidersHorizontal size={17}/>{t("Reset")}</button>
          </div>
          <div className="photo-editor-options"><label><span>{t("Crop format")}</span><select value={aspect} onChange={event=>setAspect(event.target.value)}><option value="original">{t("Original")}</option><option value="1:1">1:1 Instagram</option><option value="4:5">4:5 Post</option><option value="9:16">9:16 Story / TikTok</option></select></label><label><span>{t("Filter")}</span><select value={filter} onChange={event=>setFilter(event.target.value)}><option value="none">{t("No filter")}</option><option value="warm">{t("Warm")}</option><option value="cool">{t("Cool")}</option><option value="mono">{t("Black and white")}</option></select></label><label><span>{t("Text on image")}</span><input value={overlayText} maxLength={80} onChange={event=>setOverlayText(event.target.value)} placeholder={t("Enter text...")}/></label></div>
          <label><span><ZoomIn size={16}/>{t("Zoom")}</span><input type="range" min="1" max="2" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))}/><b>{Math.round(zoom * 100)}%</b></label>
          <label><span>{t("Brightness")}</span><input type="range" min="50" max="150" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))}/><b>{brightness}%</b></label>
          <label><span>{t("Contrast")}</span><input type="range" min="50" max="150" value={contrast} onChange={(event) => setContrast(Number(event.target.value))}/><b>{contrast}%</b></label>
          <label><span>{t("Saturation")}</span><input type="range" min="0" max="200" value={saturation} onChange={(event) => setSaturation(Number(event.target.value))}/><b>{saturation}%</b></label>
          <label><span>{t("Blur")}</span><input type="range" min="0" max="10" step="0.5" value={blur} onChange={(event) => setBlur(Number(event.target.value))}/><b>{blur}px</b></label>
        </div>

        <div className="photo-editor-footer">
          <button className="secondary-button" onClick={onClose}>{t("Cancel")}</button>
          <button className="primary-button" onClick={applyEdits} disabled={isSaving}>{isSaving ? t("Saving...") : t("Add photo")}</button>
        </div>
      </div>
    </div>
  );
}
