"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DiagramLoupe } from "@/components/DiagramLoupe";

type Props = {
  chart: string;
  title: string;
  showSource?: boolean;
  withLoupe?: boolean;
};

/** Soft fills + strong borders — PDF-style multi-color flowcharts. */
const NODE_PALETTE = [
  { fill: "#D9EEFB", stroke: "#0176D3" },
  { fill: "#D8F8E7", stroke: "#0B9F4F" },
  { fill: "#FFE9B8", stroke: "#E5A000" },
  { fill: "#E9D9FF", stroke: "#9050E9" },
  { fill: "#FFD6DE", stroke: "#E3485C" },
  { fill: "#CFFAEA", stroke: "#00B86B" },
  { fill: "#D6E4FF", stroke: "#3B6CF0" },
  { fill: "#FFE0C2", stroke: "#F07A2C" },
] as const;

function colorizeMermaidSvg(root: HTMLElement) {
  const nodes = root.querySelectorAll<SVGGElement>("g.node");
  nodes.forEach((node, index) => {
    const tone = NODE_PALETTE[index % NODE_PALETTE.length];
    node
      .querySelectorAll<SVGElement>("rect, polygon, circle, ellipse, path")
      .forEach((shape) => {
        const tag = shape.tagName.toLowerCase();
        // Skip tiny marker-like paths inside labels
        if (tag === "path" && (shape.getAttribute("d") || "").length < 24) {
          return;
        }
        shape.setAttribute("fill", tone.fill);
        shape.setAttribute("stroke", tone.stroke);
        shape.setAttribute("stroke-width", "2");
        shape.style.fill = tone.fill;
        shape.style.stroke = tone.stroke;
      });
    node.querySelectorAll<SVGElement>("span, p, div").forEach((label) => {
      label.style.color = "#0B1C2C";
    });
  });

  const edges = root.querySelectorAll<SVGPathElement>(
    "g.edgePath path, path.transition",
  );
  edges.forEach((edge, index) => {
    const tone = NODE_PALETTE[index % NODE_PALETTE.length];
    edge.setAttribute("stroke", tone.stroke);
    edge.style.stroke = tone.stroke;
    edge.setAttribute("stroke-width", "1.75");
  });

  root.querySelectorAll<SVGElement>("marker path").forEach((marker, index) => {
    const tone = NODE_PALETTE[index % NODE_PALETTE.length];
    marker.setAttribute("fill", tone.stroke);
    marker.style.fill = tone.stroke;
  });
}

export function MermaidDiagram({
  chart,
  title,
  showSource = false,
  withLoupe = true,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif",
            fontSize: "14px",
            primaryColor: "#D9EEFB",
            primaryTextColor: "#0B1C2C",
            primaryBorderColor: "#0176D3",
            secondaryColor: "#D8F8E7",
            secondaryTextColor: "#0B1C2C",
            secondaryBorderColor: "#0B9F4F",
            tertiaryColor: "#FFE9B8",
            tertiaryTextColor: "#0B1C2C",
            tertiaryBorderColor: "#E5A000",
            lineColor: "#0176D3",
            textColor: "#0B1C2C",
            mainBkg: "#D9EEFB",
            nodeBorder: "#0176D3",
            clusterBkg: "#F0F7FC",
            clusterBorder: "#0176D3",
            titleColor: "#032D60",
            edgeLabelBackground: "#FFFFFF",
            actorBkg: "#E9D9FF",
            actorBorder: "#9050E9",
            actorTextColor: "#0B1C2C",
          },
          flowchart: {
            curve: "basis",
            padding: 12,
            htmlLabels: false,
            nodeSpacing: 36,
            rankSpacing: 42,
          },
          fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif",
        });
        const { svg } = await mermaid.render(`mmd-${reactId}`, chart.trim());
        if (!cancelled && host.current) {
          host.current.innerHTML = svg;
          colorizeMermaidSvg(host.current);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (host.current) host.current.innerHTML = "";
    };
  }, [chart, reactId]);

  if (!chart.trim()) return null;

  const figure = (
    <figure className="visual-block mermaid-block">
      <figcaption>{title}</figcaption>
      {failed ? (
        <pre className="mermaid-fallback">{chart.trim()}</pre>
      ) : (
        <div ref={host} className="mermaid-host" />
      )}
    </figure>
  );

  return (
    <div className="mermaid-stack">
      {withLoupe ? (
        <DiagramLoupe label={title}>{figure}</DiagramLoupe>
      ) : (
        figure
      )}
      {showSource ? (
        <pre className="code-tile" tabIndex={0}>
          {chart.trim()}
        </pre>
      ) : null}
    </div>
  );
}
