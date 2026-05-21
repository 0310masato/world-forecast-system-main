"use client";

import dynamic from "next/dynamic";

// Dynamic import of the Dashboard component with SSR disabled
const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#020206",
      color: "#fff",
      fontFamily: "var(--font-outfit), sans-serif"
    }}>
      <div style={{
        width: "50px",
        height: "50px",
        border: "3px solid rgba(99, 102, 241, 0.1)",
        borderTop: "3px solid #6366f1",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "20px"
      }} />
      <h2 style={{
        fontSize: "1.2rem",
        fontWeight: 600,
        letterSpacing: "2px",
        background: "linear-gradient(135deg, #a5b4fc, #6366f1)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        世界予想システムを起動中...
      </h2>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
});

export default function Home() {
  return <Dashboard />;
}

