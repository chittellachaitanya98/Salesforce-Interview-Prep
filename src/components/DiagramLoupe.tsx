"use client";

import { Search, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  label?: string;
};

const SCALE = 2.25;
const LENS = 168;

type Shot = {
  url: string;
  width: number;
  height: number;
};

/**
 * Hover magnifier — pointer coords and snapshot share the same
 * loupe-content box so the lens is not offset from the diagram.
 */
export function DiagramLoupe({ children, label = "diagram" }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, show: false });
  const [shot, setShot] = useState<Shot | null>(null);
  const lensId = useId();

  const capture = useCallback(async () => {
    const content = contentRef.current;
    if (!content) return;
    try {
      const next = await captureAligned(content);
      setShot(next);
    } catch {
      setShot(null);
    }
  }, []);

  useEffect(() => {
    if (!on) {
      setShot(null);
      setPos((p) => ({ ...p, show: false }));
      return;
    }
    // Wait a frame so Mermaid SVG layout is settled
    const id = window.requestAnimationFrame(() => {
      void capture();
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOn(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [on, capture]);

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!on || !contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    setPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      show: true,
    });
  }

  return (
    <div className={`diagram-loupe ${on ? "is-active" : ""}`}>
      <div
        className="loupe-content"
        ref={contentRef}
        onPointerMove={onMove}
        onPointerLeave={() => setPos((p) => ({ ...p, show: false }))}
      >
        {children}

        {on && pos.show && shot ? (
          <div
            id={lensId}
            className="loupe-lens"
            aria-hidden
            style={{
              width: LENS,
              height: LENS,
              left: pos.x - LENS / 2,
              top: pos.y - LENS / 2,
              backgroundImage: `url("${shot.url}")`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${shot.width * SCALE}px ${shot.height * SCALE}px`,
              backgroundPosition: `${-pos.x * SCALE + LENS / 2}px ${
                -pos.y * SCALE + LENS / 2
              }px`,
            }}
          />
        ) : null}
      </div>

      <button
        type="button"
        className="loupe-toggle"
        aria-pressed={on}
        aria-controls={lensId}
        aria-label={on ? `Turn off magnifier for ${label}` : `Magnify ${label}`}
        onClick={() => setOn((value) => !value)}
      >
        {on ? <X size={18} aria-hidden /> : <Search size={18} aria-hidden />}
      </button>
    </div>
  );
}

/** Rasterize loupe-content at its on-screen size; SVG drawn at its real offset. */
async function captureAligned(content: HTMLElement): Promise<Shot> {
  const contentRect = content.getBoundingClientRect();
  const width = Math.max(Math.round(contentRect.width), 1);
  const height = Math.max(Math.round(contentRect.height), 1);
  const ratio = Math.min(2, window.devicePixelRatio || 1);

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * ratio);
  canvas.height = Math.ceil(height * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const caption = content.querySelector("figcaption");
  if (caption) {
    const cr = caption.getBoundingClientRect();
    const style = getComputedStyle(caption);
    ctx.fillStyle = style.color || "#0176D3";
    ctx.font = style.font || "700 12px Plus Jakarta Sans, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(
      (caption.textContent || "").trim(),
      cr.left - contentRect.left,
      cr.top - contentRect.top,
    );
  }

  const svg = content.querySelector("svg");
  if (svg) {
    const svgRect = svg.getBoundingClientRect();
    const sw = Math.max(Math.round(svgRect.width), 1);
    const sh = Math.max(Math.round(svgRect.height), 1);
    const ox = svgRect.left - contentRect.left;
    const oy = svgRect.top - contentRect.top;
    const url = await rasterizeSvg(svg, sw, sh);
    const img = await loadImage(url);
    ctx.drawImage(img, ox, oy, sw, sh);
  } else {
    // Non-SVG tiles (flow strip): paint a styled clone via temporary image
    const url = await htmlRegionToPng(content, width, height);
    const img = await loadImage(url);
    ctx.drawImage(img, 0, 0, width, height);
  }

  return { url: canvas.toDataURL("image/png"), width, height };
}

async function rasterizeSvg(
  svg: SVGSVGElement,
  width: number,
  height: number,
): Promise<string> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  // Keep existing viewBox so on-screen scale matches
  if (!clone.getAttribute("viewBox")) {
    const bbox = svg.viewBox?.baseVal;
    if (bbox && bbox.width && bbox.height) {
      clone.setAttribute(
        "viewBox",
        `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`,
      );
    }
  }

  clone.querySelectorAll("foreignObject").forEach((fo) => {
    const text = (fo.textContent || "").trim();
    const x = Number(fo.getAttribute("x") || 0);
    const y = Number(fo.getAttribute("y") || 0);
    const w = Number(fo.getAttribute("width") || 0);
    const h = Number(fo.getAttribute("height") || 0);
    const parent = fo.parentNode;
    if (!parent || !text) {
      fo.remove();
      return;
    }
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", String(x + w / 2));
    label.setAttribute("y", String(y + h / 2));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("fill", "#0B1C2C");
    label.setAttribute("font-size", "13");
    label.setAttribute(
      "font-family",
      "Plus Jakarta Sans, Segoe UI, sans-serif",
    );
    label.textContent = text.replace(/\s+/g, " ");
    parent.replaceChild(label, fo);
  });

  const xml = new XMLSerializer().serializeToString(clone);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  return drawDataUrl(dataUrl, width, height);
}

async function htmlRegionToPng(
  el: HTMLElement,
  width: number,
  height: number,
): Promise<string> {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".loupe-lens, .loupe-toggle").forEach((n) => n.remove());
  inlineTextColors(el, clone);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<foreignObject width="100%" height="100%">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;background:#fff;box-sizing:border-box;">` +
    clone.outerHTML +
    `</div></foreignObject></svg>`;

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return drawDataUrl(dataUrl, width, height);
}

function inlineTextColors(sourceRoot: Element, cloneRoot: Element) {
  const sourceNodes = [sourceRoot, ...sourceRoot.querySelectorAll("*")];
  const cloneNodes = [cloneRoot, ...cloneRoot.querySelectorAll("*")];
  sourceNodes.forEach((src, index) => {
    const dst = cloneNodes[index];
    if (!(src instanceof HTMLElement) || !(dst instanceof HTMLElement)) return;
    if (dst.classList.contains("loupe-lens") || dst.classList.contains("loupe-toggle")) {
      return;
    }
    const style = getComputedStyle(src);
    dst.style.color = style.color;
    dst.style.backgroundColor =
      style.backgroundColor === "rgba(0, 0, 0, 0)"
        ? "transparent"
        : style.backgroundColor;
    dst.style.borderColor = style.borderColor;
    dst.style.font = style.font;
    dst.style.padding = style.padding;
    dst.style.margin = style.margin;
    dst.style.borderRadius = style.borderRadius;
    dst.style.borderWidth = style.borderWidth;
    dst.style.borderStyle = style.borderStyle;
    dst.style.display = style.display;
    dst.style.gap = style.gap;
    dst.style.flexDirection = style.flexDirection;
    dst.style.boxSizing = "border-box";
    dst.style.width = style.width;
    dst.style.maxWidth = "100%";
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = url;
  });
}

function drawDataUrl(
  dataUrl: string,
  width: number,
  height: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas"));
        return;
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("image"));
    img.src = dataUrl;
  });
}
