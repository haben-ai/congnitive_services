import { useState, useEffect } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveHistory = (item) => {
    const newHistory = [item, ...history];
    setHistory(newHistory);
    localStorage.setItem("history", JSON.stringify(newHistory));
  };

  const callBackend = async (action) => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
      saveHistory({ text, ...data });
    } catch (e) {
      alert("Backend error");
    }
    setLoading(false);
  };

  const colors = theme === "dark" ? {
    bg: "bg-black text-white",
    cardBg: "bg-[#111]",
    sidebarBg: "bg-[#0f0f0f]",
    border: "border-gray-800",
    cyan: "text-cyan-400 border-cyan-500 shadow-[0_0_10px_#06b6d4]",
    pink: "text-pink-400 border-pink-500 shadow-[0_0_10px_#ec4899]",
    green: "text-green-400 border-green-500 shadow-[0_0_10px_#22c55e]",
    purple: "bg-purple-900 shadow-[0_0_8px_#a855f7]"
  } : {
    bg: "bg-gray-100 text-gray-900",
    cardBg: "bg-white",
    sidebarBg: "bg-gray-200",
    border: "border-gray-400",
    cyan: "text-cyan-600 border-cyan-300 shadow-[0_0_5px_#06b6d4]",
    pink: "text-pink-600 border-pink-300 shadow-[0_0_5px_#ec4899]",
    green: "text-green-600 border-green-300 shadow-[0_0_5px_#22c55e]",
    purple: "bg-purple-300 shadow-[0_0_5px_#a855f7]"
  };

  return (
    <div className={`flex h-screen ${colors.bg}`}>
      {/* Sidebar */}
      <div className={`w-72 ${colors.sidebarBg} border-r ${colors.border} p-6 space-y-6`}>
        <h1 className="text-2xl font-bold mb-6">Task 6 Cognitive Services</h1>
        <div>
          <h2 className="text-lg mb-2">Services</h2>
          <ul className="space-y-4 text-lg">
            <li> Translator</li>
            <li> Sentiment</li>
            <li>IBM NLU</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg mb-2 mt-6">History</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {history.map((h, i) => (
              <div
                key={i}
                onClick={() => setResult(h)}
                className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 text-md"
              >
                {h.text.substring(0, 40)}...
              </div>
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="mt-6 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
        >
          Toggle {theme === "dark" ? "Light" : "Dark"} Mode
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Input */}
        <div className={`${colors.cardBg} p-6 rounded-xl border ${colors.border} shadow-lg`}>
          <textarea
            className="w-full border border-gray-600 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={4}
            placeholder="Enter text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => callBackend("translate")}
              className="px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400"
            >
              Translate
            </button>
            <button
              onClick={() => callBackend("sentiment")}
              className="px-4 py-2 bg-pink-500 text-black rounded hover:bg-pink-400"
            >
              Analyze Sentiment
            </button>
            <button
              onClick={() => callBackend("classify")}
              className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400"
            >
              Classify
            </button>
            <button
              onClick={() => callBackend("pipeline")}
              className="px-4 py-2 bg-purple-500 text-black rounded hover:bg-purple-400"
            >
              Run Pipeline
            </button>
          </div>
        </div>

        {/* Pipeline */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${result ? colors.cyan : colors.border}`}>
            <h3 className={`${colors.cyan} font-semibold`}>1. Translation</h3>
            <p className="mt-2 text-sm">{result ? result.translated_text : "Waiting..."}</p>
          </div>
          <div className={`p-4 rounded-xl border ${result ? colors.pink : colors.border}`}>
            <h3 className={`${colors.pink} font-semibold`}>2. Sentiment</h3>
            <p className="mt-2 text-sm">{result ? `${result.sentiment} (${result.score})` : "Waiting..."}</p>
          </div>
          <div className={`p-4 rounded-xl border ${result ? colors.green : colors.border}`}>
            <h3 className={`${colors.green} font-semibold`}>3. Classification</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {result?.categories?.map((c, i) => (
                <span key={i} className="px-2 py-1 rounded text-xs bg-green-900">{c}</span>
              )) || "Waiting..."}
            </div>
          </div>
        </div>

        {/* Keywords */}
        {result && (
          <div className={`${colors.cardBg} p-4 rounded-xl border ${colors.border}`}>
            <h2 className="text-purple-400 font-semibold mb-2">Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {result.keywords?.map((k, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-sm ${colors.purple}`}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}