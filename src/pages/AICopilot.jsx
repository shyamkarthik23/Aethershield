import { useEffect, useRef, useState, useMemo } from 'react';
import { useAppState } from '../context/AppStateContext';

const WELCOME = {
  id: 'm0',
  role: 'assistant',
  text: "Welcome, Admin. I am the AetherShield AI Remediation Copilot. I can analyze multi-cloud compliance reports, explain findings, draft remediation steps, and answer questions about your security posture.",
};

export default function AICopilot() {
  const { setChaosSidebarOpen, askCopilot, assets, orgName } = useAppState();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  // Give the copilot room to breathe by collapsing the Chaos panel here.
  useEffect(() => {
    setChaosSidebarOpen(false);
    return () => setChaosSidebarOpen(true);
  }, [setChaosSidebarOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  // Built from the current org's actual findings instead of a hardcoded
  // list, so the quick actions always reference resources that exist
  // for whichever org is logged in.
  const quickActions = useMemo(() => {
    const findings = assets.filter((a) => a.severity !== 'Healthy').slice(0, 2);
    const actions = findings.map((a) => ({
      id: a.id,
      icon: '🔧',
      label: `Fix ${a.name}`,
    }));
    return [
      { id: 'qa-compliance', icon: '📊', label: 'Generate compliance posture analysis' },
      ...actions,
      { id: 'qa-auto', icon: '🛡️', label: 'Explain auto-remediation policies' },
    ];
  }, [assets]);

  const send = async (text) => {
    const content = text ?? input;
    if (!content.trim()) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: content }]);
    setInput('');
    setThinking(true);
    try {
      const res = await askCopilot(content);
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: `Error: ${err.message}` }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="page-scroll copilot-page">
      <div className="page-header">
        <h1 className="page-title">AI Security Remediation Copilot</h1>
        {orgName && <span className="page-org-tag">{orgName}</span>}
      </div>

      <div className="copilot-layout">
        <div className="card copilot-chat-card">
          <div className="copilot-messages" ref={scrollRef}>
            {messages.map((m) => (
              <div key={m.id} className={`copilot-msg ${m.role}`}>
                {m.role === 'assistant' && <span className="copilot-avatar">◈</span>}
                <p>{m.text}</p>
              </div>
            ))}
            {thinking && (
              <div className="copilot-msg assistant">
                <span className="copilot-avatar">◈</span>
                <p className="typing"><span /><span /><span /></p>
              </div>
            )}
          </div>
          <form
            className="copilot-input-row"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask how to remediate a finding, or draft a fix..."
            />
            <button type="submit" className="btn-primary" disabled={!input.trim()}>Send</button>
          </form>
        </div>

        <div className="copilot-side">
          <div className="card">
            <h3 className="side-card-title">Quick Actions &amp; Audits</h3>
            <div className="quick-actions">
              {quickActions.map((qa) => (
                <button key={qa.id} className="quick-action-btn" onClick={() => send(qa.label)}>
                  <span>{qa.icon}</span> {qa.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="side-card-title">Active Vulnerability Context</h3>
            <p className="vuln-context-text">
              Select an asset with a vulnerability from Asset Inventory and reference it here
              to load remediation context automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
