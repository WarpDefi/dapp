import React, { useEffect, useMemo, useRef, useState } from "react";

const ChatWidget: React.FC = () => {
  // ✅ Configure your deployed chat.html here or via env:
  const CHAT_SRC =
    (import.meta as any)?.env?.VITE_CHAT_SRC ||
    (process as any)?.env?.REACT_APP_CHAT_SRC ||
    "https://pangoai.app/chat/chat.html";

  // Only respond to messages from this origin
  const CHAT_ORIGIN = useMemo(() => {
    try {
      return new URL(CHAT_SRC).origin;
    } catch {
      return "*";
    }
  }, [CHAT_SRC]);

  // ---------- helpers ----------
  const isMobileNow = () => {
    if (typeof window === "undefined") return false;
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
    const narrow = window.innerWidth <= 768;
    return Boolean(coarse || narrow);
  };

  // ---------- state ----------
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(isMobileNow());
  const expandedRef = useRef(false);

  // ---------- viewport height measuring (for mobile fullscreen) ----------
  useEffect(() => {
    const setMeasuredVh = () => {
      const vh = window.innerHeight; // visible viewport height
      document.documentElement.style.setProperty("--chat-vh", `${vh}px`);
    };
    setMeasuredVh();
    window.addEventListener("resize", setMeasuredVh);
    window.addEventListener("orientationchange", setMeasuredVh);
    return () => {
      window.removeEventListener("resize", setMeasuredVh);
      window.removeEventListener("orientationchange", setMeasuredVh);
    };
  }, []);

  // ---------- detect mobile/desktop on resize ----------
  useEffect(() => {
    const onResize = () => setIsMobile(isMobileNow());
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  // ---------- lock background scroll ONLY for mobile fullscreen ----------
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (expanded && isMobile) {
      const prevHtmlOverflow = html.style.overflow;
      const prevBodyOverflow = body.style.overflow;
      const prevTouchAction = (body.style as any).touchAction;

      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      (body.style as any).touchAction = "none";

      return () => {
        html.style.overflow = prevHtmlOverflow;
        body.style.overflow = prevBodyOverflow;
        (body.style as any).touchAction = prevTouchAction;
      };
    }
  }, [expanded, isMobile]);

  // ---------- listen for expand/shrink from chat.html ----------
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (CHAT_ORIGIN !== "*" && event.origin !== CHAT_ORIGIN) return;
      const action = (event.data && (event.data as any).action) || "";
      if (action === "expandChat") {
        setExpanded(true);
        expandedRef.current = true;
      } else if (action === "shrinkChat") {
        setExpanded(false);
        expandedRef.current = false;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [CHAT_ORIGIN]);

  // ---------- keep sizing correct after rotation/resize ----------
  useEffect(() => {
    const reapply = () => {
      if (expandedRef.current) setExpanded((e) => e); // trigger re-render
    };
    window.addEventListener("resize", reapply);
    window.addEventListener("orientationchange", reapply);
    return () => {
      window.removeEventListener("resize", reapply);
      window.removeEventListener("orientationchange", reapply);
    };
  }, []);

  // ---------- styles ----------
  const base: React.CSSProperties = {
    position: "fixed",
    border: "none",
    zIndex: 2147483647,
    background: "transparent",
    overflow: "hidden", // hard-clip contents (prevents inner halo)
    transition: "all 0.28s ease-in-out",
    pointerEvents: "auto",
  };

  // Collapsed launcher sizes:
  // - Desktop: 120x120
  // - Mobile:  60x60 (2× smaller)
  const collapsed: React.CSSProperties = {
    right: 16,
    bottom: 16,
    width: isMobile ? 60 : 120,
    height: isMobile ? 60 : 120,
    borderRadius: "50%",
    boxShadow: "none",
  };

  // Desktop expanded: panel bottom-right
  const desktopExpanded: React.CSSProperties = {
    right: 20,
    bottom: 20,
    width: 448,
    height: "80vh",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,.2)",
  };

  // Mobile expanded: TRUE fullscreen
  const mobileExpanded: React.CSSProperties = {
    top: 0,
    left: 0,
    width: "100vw",
    height: "var(--chat-vh)", // measured viewport height
    borderRadius: 0,
    boxShadow: "0 10px 30px rgba(0,0,0,.2)",
  };

  const style: React.CSSProperties = {
    ...base,
    ...(expanded ? (isMobile ? mobileExpanded : desktopExpanded) : collapsed),
  };

  return (
    <iframe
      src={CHAT_SRC}
      allow="clipboard-write; clipboard-read; fullscreen"
      title="Pangolin AI Chat"
      aria-label="Pangolin AI Chat"
      style={style}
    />
  );
};

export default ChatWidget;
