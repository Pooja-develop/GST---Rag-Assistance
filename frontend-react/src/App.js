import { useState, useEffect, useRef } from "react";

const API_BASE = "http://127.0.0.1:5000";

const COLORS = {
  navy: "#0F1F3D",
  navyLight: "#162847",
  saffron: "#F5A623",
  saffronDim: "#F5A62322",
  emerald: "#10B981",
  rose: "#F43F5E",
  slate: "#64748B",
  slateLight: "#94A3B8",
  surface: "#F8FAFC",
  white: "#FFFFFF",
  border: "#E2E8F0",
  userBubble: "#0F1F3D",
  aiBubble: "#FFFFFF",
};


const Spinner = () => (
  <span style={{ display: "inline-block", width: 18, height: 18 }}>
    <svg viewBox="0 0 24 24" style={{ animation: "spin 0.9s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke={COLORS.saffron} strokeWidth="3"
        fill="none" strokeDasharray="40 20" />
    </svg>
  </span>
);

const Badge = ({ children, color = COLORS.saffron }) => (
  <span style={{
    background: color + "22", color, fontSize: 11, fontWeight: 700,
    padding: "2px 8px", borderRadius: 99, letterSpacing: 0.5,
    textTransform: "uppercase"
  }}>{children}</span>
);

const SourceCard = ({ sources }) => {
  if (!sources?.length) return null;
  return (
    <div style={{
      marginTop: 10, padding: "8px 12px", background: COLORS.saffronDim,
      borderLeft: `3px solid ${COLORS.saffron}`, borderRadius: 6, fontSize: 12,
      color: COLORS.slate
    }}>
      <strong style={{ color: COLORS.saffron }}>📎 Sources</strong>
      {sources.map((s, i) => (
        <div key={i} style={{ marginTop: 3 }}>
          Page {s.page} — {s.source?.split("\\").pop() || "GST Document"}
        </div>
      ))}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 10, width: "100%",
    padding: "11px 16px", borderRadius: 10, border: "none", cursor: "pointer",
    background: active ? COLORS.saffron + "22" : "transparent",
    color: active ? COLORS.saffron : COLORS.slateLight,
    fontWeight: active ? 700 : 500, fontSize: 14, textAlign: "left",
    transition: "all 0.15s"
  }}>
    <span style={{ fontSize: 18 }}>{icon}</span> {label}
  </button>
);

const LangSelect = ({ value, onChange }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{
    background: COLORS.navyLight, color: COLORS.slateLight,
    border: `1px solid ${COLORS.navyLight}`, borderRadius: 8,
    padding: "6px 10px", fontSize: 13, cursor: "pointer", outline: "none", width: "100%"
  }}>
    <option value="english">🇬🇧 English</option>
    <option value="hindi">🇮🇳 Hindi</option>
    <option value="tamil">🏳 Tamil</option>
  </select>
);


function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "#162847", border: "1px solid #ffffff18",
    borderRadius: 10, padding: "13px 16px", color: "#fff",
    fontSize: 14, outline: "none", marginBottom: 14, fontFamily: "inherit"
  };

  const handleSubmit = () => {
    setError("");
    const { name, email, password } = form;

    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setTimeout(() => {
      
      const users = JSON.parse(localStorage.getItem("gstmitra_users") || "[]");

      if (mode === "signup") {
        
        if (users.find(u => u.email === email)) {
          setError("This email is already registered. Please sign in.");
          setLoading(false);
          return;
        }
        
        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem("gstmitra_users", JSON.stringify(users));
        localStorage.setItem("gstmitra_session", JSON.stringify({ name, email }));
        onLogin({ name, email });
      } else {
        
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
          setError("Incorrect email or password.");
          setLoading(false);
          return;
        }
        localStorage.setItem("gstmitra_session", JSON.stringify({ name: user.name, email }));
        onLogin({ name: user.name, email });
      }
      setLoading(false);
    }, 600);
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0F1F3D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #64748B; }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0F1F3D",
        backgroundImage: "radial-gradient(ellipse at 60% 20%, #1a3a6b44 0%, transparent 60%)"
      }}>
        <div style={{
          width: "100%", maxWidth: 420, padding: "0 24px",
          animation: "fadeUp 0.5s ease"
        }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
              <span style={{ color: COLORS.saffron }}>GST</span>
              <span style={{ color: "#fff" }}>Mitra</span>
              <span style={{ color: COLORS.saffron }}> AI</span>
            </div>
            <div style={{ color: COLORS.slateLight, fontSize: 13, marginTop: 6, letterSpacing: 1 }}>
              YOUR 24/7 GST COMPLIANCE ASSISTANT
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: "#162847", borderRadius: 20,
            padding: "32px 28px", border: "1px solid #ffffff12",
            boxShadow: "0 24px 64px #00000044"
          }}>

            {/* Tab toggle */}
            <div style={{
              display: "flex", background: "#0F1F3D",
              borderRadius: 12, padding: 4, marginBottom: 28
            }}>
              {["signin", "signup"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); setForm({ name: "", email: "", password: "" }); }}
                  style={{
                    flex: 1, padding: "10px", border: "none", borderRadius: 9,
                    cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "all 0.2s",
                    background: mode === m ? COLORS.saffron : "transparent",
                    color: mode === m ? "#fff" : COLORS.slateLight
                  }}>
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Name field — only on signup */}
            {mode === "signup" && (
              <div>
                <label style={{ color: COLORS.slateLight, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
                  FULL NAME
                </label>
                <input
                  style={{ ...inputStyle, marginTop: 6 }}
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ color: COLORS.slateLight, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
                EMAIL ADDRESS
              </label>
              <input
                style={{ ...inputStyle, marginTop: 6 }}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ color: COLORS.slateLight, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
                PASSWORD
              </label>
              <input
                style={{ ...inputStyle, marginTop: 6 }}
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: COLORS.rose + "18", border: `1px solid ${COLORS.rose}44`,
                borderRadius: 8, padding: "10px 14px", color: COLORS.rose,
                fontSize: 13, marginBottom: 16
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading} style={{
              width: "100%", padding: "14px", background: COLORS.saffron,
              color: "#fff", border: "none", borderRadius: 12,
              fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
              letterSpacing: 0.3
            }}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign In →" : "Create Account →"}
            </button>

            {/* Switch mode hint */}
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: COLORS.slateLight }}>
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
                style={{
                  background: "none", border: "none", color: COLORS.saffron,
                  fontWeight: 700, cursor: "pointer", fontSize: 13
                }}>
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#ffffff30", lineHeight: 1.7 }}>
            Answers sourced from official CBIC GST circulars.<br />
            For legal decisions, always consult a CA.
          </div>
        </div>
      </div>
    </>
  );
}


function ChatPanel({ lang }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Namaste! 🙏 I'm GSTMitra AI — your 24/7 GST compliance assistant. Ask me anything about GST rules, ITC, filing dates, or paste a notice below.",
      sources: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const quickQuestions = [
    "How do I cancel GST registration?",
    "Can I claim ITC on laptop purchase?",
    "What is GSTR-10 final return?",
    "Penalty for late GSTR-3B filing?"
  ];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, language: lang })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(m => [...m, { role: "ai", text: data.answer, sources: data.sources }]);
    } catch (e) {
      setMessages(m => [...m, {
        role: "ai",
        text: "⚠️ Something went wrong. Please try again in a moment. If this continues, the server may be restarting.",
        sources: []
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {quickQuestions.map((q, i) => (
          <button key={i} onClick={() => send(q)} style={{
            background: COLORS.navyLight, color: COLORS.slateLight,
            border: `1px solid #ffffff18`, borderRadius: 20, padding: "6px 14px",
            fontSize: 12, cursor: "pointer", transition: "all 0.15s"
          }}>{q}</button>
        ))}
      </div>

      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
        gap: 14, paddingRight: 4
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start"
          }}>
            <div style={{
              maxWidth: "78%",
              background: m.role === "user" ? COLORS.userBubble : COLORS.aiBubble,
              color: m.role === "user" ? "#fff" : "#1E293B",
              padding: "12px 16px", borderRadius: m.role === "user"
                ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              fontSize: 14, lineHeight: 1.6,
              boxShadow: "0 1px 4px #0002",
              border: m.role === "ai" ? `1px solid ${COLORS.border}` : "none"
            }}>
              {m.role === "ai" && (
                <div style={{ marginBottom: 6 }}>
                  <Badge>GSTMitra AI</Badge>
                </div>
              )}
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              <SourceCard sources={m.sources} />
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.slate, fontSize: 13 }}>
            <Spinner /> Searching GST documents…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        display: "flex", gap: 10, marginTop: 16,
        background: COLORS.navyLight, borderRadius: 14, padding: "8px 8px 8px 16px",
        border: `1px solid #ffffff18`
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask any GST question…"
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#fff", fontSize: 14, lineHeight: 1.5
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          background: COLORS.saffron, color: "#fff", border: "none",
          borderRadius: 10, padding: "10px 20px", fontWeight: 700,
          fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
          opacity: (!input.trim() || loading) ? 0.5 : 1, transition: "opacity 0.15s"
        }}>Send →</button>
      </div>
    </div>
  );
}


function ITCPanel({ lang }) {
  const [form, setForm] = useState({ business_type: "", purchase_item: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!form.business_type || !form.purchase_item) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/check-itc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: lang })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", background: COLORS.navyLight,
    border: `1px solid #ffffff18`, borderRadius: 10, padding: "12px 14px",
    color: "#fff", fontSize: 14, outline: "none"
  };

  return (
    <div>
      <p style={{ color: COLORS.slateLight, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Check if you can claim Input Tax Credit on a purchase based on your business type and GST rules.
      </p>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", color: COLORS.slateLight, fontSize: 13, marginBottom: 7, fontWeight: 600 }}>
          Business Type
        </label>
        <select value={form.business_type} onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))}
          style={inputStyle}>
          <option value="">Select business type…</option>
          <option value="Regular GST taxpayer">Regular GST Taxpayer</option>
          <option value="Composition scheme dealer">Composition Scheme Dealer</option>
          <option value="Export business">Export Business</option>
          <option value="E-commerce seller">E-Commerce Seller</option>
          <option value="Service provider">Service Provider</option>
          <option value="Manufacturer">Manufacturer</option>
          <option value="Trader">Trader / Retailer</option>
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", color: COLORS.slateLight, fontSize: 13, marginBottom: 7, fontWeight: 600 }}>
          Purchase Item
        </label>
        <input value={form.purchase_item} onChange={e => setForm(f => ({ ...f, purchase_item: e.target.value }))}
          placeholder="e.g. office laptop, raw materials, office furniture…" style={inputStyle} />
      </div>

      <button onClick={check} disabled={loading || !form.business_type || !form.purchase_item}
        style={{
          background: COLORS.saffron, color: "#fff", border: "none", borderRadius: 10,
          padding: "13px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer",
          opacity: (!form.business_type || !form.purchase_item || loading) ? 0.5 : 1,
          width: "100%", marginBottom: 20
        }}>
        {loading ? "Checking GST Rules…" : "Check ITC Eligibility →"}
      </button>

      {result && !result.error && (
        <div style={{ background: COLORS.white, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <Badge color={COLORS.emerald}>Result</Badge>
          <p style={{ color: "#1E293B", fontSize: 14, lineHeight: 1.7, marginTop: 12, whiteSpace: "pre-wrap" }}>
            {result.eligible}
          </p>
          <SourceCard sources={result.sources} />
        </div>
      )}
      {result?.error && (
        <div style={{ color: COLORS.rose, background: COLORS.rose + "11", borderRadius: 10, padding: 14, fontSize: 14 }}>
          ⚠️ {result.error}
        </div>
      )}
    </div>
  );
}


function PenaltyPanel() {
  const [form, setForm] = useState({ return_type: "GSTR-3B", days_late: "", turnover: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!form.days_late) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/calculate-penalty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          return_type: form.return_type,
          days_late: parseInt(form.days_late),
          turnover: parseFloat(form.turnover || 0)
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", background: COLORS.navyLight,
    border: `1px solid #ffffff18`, borderRadius: 10, padding: "12px 14px",
    color: "#fff", fontSize: 14, outline: "none", marginTop: 7
  };

  return (
    <div>
      <p style={{ color: COLORS.slateLight, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Calculate exact late filing penalties for GST returns based on official rules.
      </p>

      <div style={{ marginBottom: 18 }}>
        <label style={{ color: COLORS.slateLight, fontSize: 13, fontWeight: 600 }}>Return Type</label>
        <select value={form.return_type} onChange={e => setForm(f => ({ ...f, return_type: e.target.value }))}
          style={inputStyle}>
          <option value="GSTR-1">GSTR-1 (Monthly Sales Return)</option>
          <option value="GSTR-3B">GSTR-3B (Monthly Summary Return)</option>
          <option value="GSTR-9">GSTR-9 (Annual Return)</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div>
          <label style={{ color: COLORS.slateLight, fontSize: 13, fontWeight: 600 }}>Days Late</label>
          <input type="number" value={form.days_late} min="1"
            onChange={e => setForm(f => ({ ...f, days_late: e.target.value }))}
            placeholder="e.g. 15" style={inputStyle} />
        </div>
        <div>
          <label style={{ color: COLORS.slateLight, fontSize: 13, fontWeight: 600 }}>Turnover (₹)</label>
          <input type="number" value={form.turnover}
            onChange={e => setForm(f => ({ ...f, turnover: e.target.value }))}
            placeholder="e.g. 500000" style={inputStyle} />
        </div>
      </div>

      <button onClick={calculate} disabled={loading || !form.days_late} style={{
        background: COLORS.saffron, color: "#fff", border: "none", borderRadius: 10,
        padding: "13px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer",
        width: "100%", marginBottom: 20,
        opacity: (!form.days_late || loading) ? 0.5 : 1
      }}>
        {loading ? "Calculating…" : "Calculate Penalty →"}
      </button>

      {result && !result.error && (
        <div style={{ background: COLORS.white, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Badge color={COLORS.rose}>Penalty Amount</Badge>
            <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.rose }}>
              ₹{result.total_penalty?.toLocaleString("en-IN")}
            </span>
          </div>
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 14 }}>
            {result.breakdown?.map((b, i) => (
              <div key={i} style={{ fontSize: 13, color: COLORS.slate, marginBottom: 6, lineHeight: 1.6 }}>
                • {b}
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 14, padding: "10px 14px", background: COLORS.saffronDim,
            borderRadius: 8, fontSize: 12, color: COLORS.slate
          }}>
            ⚠️ {result.note}
          </div>
        </div>
      )}
      {result?.error && (
        <div style={{ color: COLORS.rose, background: COLORS.rose + "11", borderRadius: 10, padding: 14, fontSize: 14 }}>
          ⚠️ {result.error}
        </div>
      )}
    </div>
  );
}


function DeadlinesPanel() {
  const [type, setType] = useState("regular");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setData(null);
      try {
        const res = await fetch(`${API_BASE}/get-deadlines?business_type=${type}`);
        const d = await res.json();
        setData(d);
      } catch { }
      setLoading(false);
    };
    load();
  }, [type]);

  const types = [
    { value: "regular", label: "Regular Taxpayer" },
    { value: "composition", label: "Composition Dealer" },
    { value: "quarterly", label: "QRMP Scheme" }
  ];

  return (
    <div>
      <p style={{ color: COLORS.slateLight, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
        All GST filing due dates based on your taxpayer category.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {types.map(t => (
          <button key={t.value} onClick={() => setType(t.value)} style={{
            padding: "9px 18px", borderRadius: 20, border: "none", cursor: "pointer",
            background: type === t.value ? COLORS.saffron : COLORS.navyLight,
            color: type === t.value ? "#fff" : COLORS.slateLight,
            fontWeight: type === t.value ? 700 : 500, fontSize: 13, transition: "all 0.15s"
          }}>{t.label}</button>
        ))}
      </div>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: COLORS.slate, fontSize: 14 }}>
          <Spinner /> Loading deadlines…
        </div>
      )}

      {data?.deadlines?.map((d, i) => (
        <div key={i} style={{
          background: COLORS.white, borderRadius: 12, padding: "16px 20px",
          marginBottom: 12, border: `1px solid ${COLORS.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1E293B", marginBottom: 4 }}>{d.return}</div>
            <div style={{ color: COLORS.slate, fontSize: 13 }}>{d.description}</div>
          </div>
          <div style={{
            background: COLORS.saffronDim, color: COLORS.saffron,
            borderRadius: 10, padding: "8px 14px", fontSize: 13,
            fontWeight: 700, textAlign: "right", minWidth: 120
          }}>📅 {d.due_date}</div>
        </div>
      ))}

      {data?.note && (
        <div style={{ marginTop: 14, fontSize: 12, color: COLORS.slate, padding: "10px 14px",
          background: COLORS.saffronDim, borderRadius: 8 }}>
          ⚠️ {data.note}
        </div>
      )}
    </div>
  );
}


function NoticePanel({ lang }) {
  const [noticeText, setNoticeText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const explain = async () => {
    if (!noticeText.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/explain-notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notice_text: noticeText, language: lang })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div>
      <p style={{ color: COLORS.slateLight, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
        Received a GST notice you don't understand? Paste it below and get a plain-language explanation.
      </p>

      <textarea
        value={noticeText}
        onChange={e => setNoticeText(e.target.value)}
        placeholder="Paste your GST notice text here…"
        rows={8}
        style={{
          width: "100%", boxSizing: "border-box", background: COLORS.navyLight,
          border: `1px solid #ffffff18`, borderRadius: 12, padding: "14px 16px",
          color: "#fff", fontSize: 14, lineHeight: 1.6, resize: "vertical",
          outline: "none", marginBottom: 16, fontFamily: "inherit"
        }}
      />

      <button onClick={explain} disabled={loading || !noticeText.trim()} style={{
        background: COLORS.saffron, color: "#fff", border: "none", borderRadius: 10,
        padding: "13px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer",
        width: "100%", marginBottom: 20,
        opacity: (!noticeText.trim() || loading) ? 0.5 : 1
      }}>
        {loading ? "Analysing Notice…" : "Explain This Notice →"}
      </button>

      {result && !result.error && (
        <div style={{ background: COLORS.white, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <Badge color={COLORS.emerald}>Explanation</Badge>
          <p style={{ color: "#1E293B", fontSize: 14, lineHeight: 1.75, marginTop: 12, whiteSpace: "pre-wrap" }}>
            {result.explanation}
          </p>
          <SourceCard sources={result.sources} />
          <div style={{
            marginTop: 14, padding: "10px 14px", background: COLORS.rose + "11",
            borderRadius: 8, fontSize: 12, color: COLORS.rose
          }}>
            ⚠️ {result.warning}
          </div>
        </div>
      )}
      {result?.error && (
        <div style={{ color: COLORS.rose, background: COLORS.rose + "11", borderRadius: 10, padding: 14, fontSize: 14 }}>
          ⚠️ {result.error}
        </div>
      )}
    </div>
  );
}


function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/history?limit=30`)
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const featureColors = { ask: COLORS.saffron, itc_checker: COLORS.emerald, notice_explainer: COLORS.rose };
  const featureLabels = { ask: "GST Q&A", itc_checker: "ITC Check", notice_explainer: "Notice" };

  return (
    <div>
      <p style={{ color: COLORS.slateLight, fontSize: 14, marginBottom: 20 }}>
        Last 30 queries stored in your SQLite database.
      </p>
      {loading && <div style={{ display: "flex", gap: 10, alignItems: "center", color: COLORS.slate }}><Spinner /> Loading history…</div>}
      {!loading && history.length === 0 && (
        <div style={{ color: COLORS.slateLight, fontSize: 14, textAlign: "center", marginTop: 40 }}>
          No history yet. Start asking questions!
        </div>
      )}
      {history.map((h, i) => (
        <div key={i} style={{
          background: COLORS.white, borderRadius: 12, padding: "14px 18px",
          marginBottom: 10, border: `1px solid ${COLORS.border}`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <Badge color={featureColors[h.feature] || COLORS.slateLight}>
              {featureLabels[h.feature] || h.feature}
            </Badge>
            <span style={{ fontSize: 11, color: COLORS.slateLight }}>{h.timestamp}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}>Q: {h.question}</div>
          <div style={{ fontSize: 13, color: COLORS.slate, lineHeight: 1.5 }}>
            {h.answer?.slice(0, 180)}{h.answer?.length > 180 ? "…" : ""}
          </div>
        </div>
      ))}
    </div>
  );
}


const PANELS = [
  { id: "chat",      icon: "💬", label: "GST Assistant" },
  { id: "itc",       icon: "📋", label: "ITC Checker" },
  { id: "penalty",   icon: "⚠️", label: "Penalty Calc" },
  { id: "deadlines", icon: "📅", label: "Filing Dates" },
  { id: "notice",    icon: "🚩", label: "Notice Help" },
  { id: "history",   icon: "🕓", label: "History" },
];

export default function App() {
  const [active, setActive]   = useState("chat");
  const [lang, setLang]       = useState("english");
  const [user, setUser]       = useState(null);

  
  useEffect(() => {
    document.title = "GSTMitra AI";
    const session = localStorage.getItem("gstmitra_session");
    if (session) {
      try { setUser(JSON.parse(session)); } catch { }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("gstmitra_session");
    setUser(null);
    setActive("chat");
  };

  
  if (!user) return <AuthPage onLogin={setUser} />;

  const activePanel = PANELS.find(p => p.id === active);

  const panelComponents = {
    chat:      <ChatPanel lang={lang} />,
    itc:       <ITCPanel lang={lang} />,
    penalty:   <PenaltyPanel />,
    deadlines: <DeadlinesPanel />,
    notice:    <NoticePanel lang={lang} />,
    history:   <HistoryPanel />
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${COLORS.navy}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.navyLight}; border-radius: 10px; }
        select option { background: ${COLORS.navy}; color: #fff; }
        input::placeholder { color: #64748B; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{
          width: 220, background: COLORS.navy,
          borderRight: "1px solid #ffffff10",
          display: "flex", flexDirection: "column",
          padding: "0 12px 24px"
        }}>
          {/* Logo */}
          <div style={{ padding: "24px 8px 20px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.saffron }}>GST</span>
              <span style={{ color: "#fff" }}>Mitra</span>
              <span style={{ color: COLORS.saffron }}> AI</span>
            </div>
            <div style={{ fontSize: 11, color: COLORS.slateLight, marginTop: 3, letterSpacing: 0.5 }}>
              AI COMPLIANCE ASSISTANT
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            {PANELS.map(p => (
              <NavItem key={p.id} icon={p.icon} label={p.label}
                active={active === p.id} onClick={() => setActive(p.id)} />
            ))}
          </nav>

          {/* Language */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: COLORS.slateLight, marginBottom: 8, paddingLeft: 4, letterSpacing: 0.5 }}>
              LANGUAGE
            </div>
            <LangSelect value={lang} onChange={setLang} />
          </div>

          {/* User info + logout */}
          <div style={{
            background: COLORS.navyLight, borderRadius: 12,
            padding: "12px 14px", border: "1px solid #ffffff10"
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
              👤 {user.name}
            </div>
            <div style={{ fontSize: 11, color: COLORS.slateLight, marginBottom: 10 }}>
              {user.email}
            </div>
            <button onClick={handleLogout} style={{
              width: "100%", padding: "8px", background: "transparent",
              border: `1px solid ${COLORS.rose}44`, borderRadius: 8,
              color: COLORS.rose, fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 14, fontSize: 11, color: "#ffffff25", paddingLeft: 4, lineHeight: 1.8 }}>
                  Powered by LangChain + ChromaDB<br />
                  ⚠️ Always consult a CA for legal decisions
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Header —  */}
          <div style={{
            padding: "20px 32px", borderBottom: "1px solid #ffffff10",
            background: COLORS.navy
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
              {activePanel?.icon} {activePanel?.label}
            </div>
            <div style={{ fontSize: 12, color: COLORS.slateLight, marginTop: 2 }}>
              Answers sourced from official CBIC GST circulars & FAQs
            </div>
          </div>

          {/* Panel body */}
          <div style={{
            flex: 1, overflow: "auto", padding: "28px 32px",
            background: "#F1F5F9"
          }}>
            <div style={{
              maxWidth: 820, margin: "0 auto",
              height: active === "chat" ? "calc(100vh - 130px)" : "auto",
              display: "flex", flexDirection: "column"
            }}>
              {panelComponents[active]}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}