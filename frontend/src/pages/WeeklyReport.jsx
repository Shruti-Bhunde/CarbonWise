import React, { useEffect, useState } from 'react';
import { Calendar, RefreshCw, Sparkles, Send, MessageSquareText, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatApi, reportsApi } from '../utils/api';

const renderTextValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(renderTextValue).join(', ');
  }
  if (typeof value === 'object') {
    if (value.title && value.description) {
      return `${value.title}: ${value.description}`;
    }
    if (value.title) {
      return value.title;
    }
    if (value.description) {
      return value.description;
    }
    return JSON.stringify(value);
  }
  return String(value);
};

export default function WeeklyReport() {
  const { user, report, history, loading, refresh } = useAuth();
  const [activeReport, setActiveReport] = useState(report);
  const [loadingReport, setLoadingReport] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => {
    setActiveReport(report);
  }, [report]);

  useEffect(() => {
    if (!loading && !user) {
      window.location.assign('/login');
    }
  }, [loading, user]);

  useEffect(() => {
    let isMounted = true;
    const loadChatHistory = async () => {
      if (!user) {
        return;
      }
      setChatLoading(true);
      try {
        const messages = await chatApi.history();
        if (isMounted) {
          setChat(Array.isArray(messages) ? messages : []);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setChat([]);
        }
      } finally {
        if (isMounted) {
          setChatLoading(false);
        }
      }
    };

    loadChatHistory();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const totalCarbonSaved = (history || []).reduce((sum, entry) => sum + (entry.carbonSaved || 0), 0);

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
      const data = await reportsApi.generate();
      setActiveReport(data);
      await refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    setSending(true);
    const userEntry = { role: 'user', content: trimmed };
    setChat((previous) => [...previous, userEntry]);
    setMessage('');
    try {
      const reply = await chatApi.send(trimmed);
      setChat((previous) => [...previous, { role: 'assistant', content: reply.answer, sources: reply.sources || [] }]);
    } catch (error) {
      setChat((previous) => [...previous, { role: 'assistant', content: error.message || 'I could not answer that right now.' }]);
    } finally {
      setSending(false);
    }
  };

  const latestReport = activeReport || report || null;
  const metricEntries = latestReport?.metrics ? Object.entries(latestReport.metrics).filter(([key]) => key !== 'footprintBreakdown' && key !== 'breakdown') : [];

  if (loading || !user) {
    return <div className="text-center py-12 text-eco-textLight">Loading report...</div>;
  }

  return (
    <div className="flex flex-col gap-6 font-sans pb-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-4xl font-extrabold text-eco-dark">Reports & memory</h1>
        <div className="flex items-center gap-2 text-base text-eco-textLight mt-1">
          <Calendar className="w-4 h-4" />
          <span>Database-backed report history and conversational memory</span>
        </div>
      </div>

      {loadingReport ? (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[35vh] text-center">
          <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-eco-dark">Generating your report...</h2>
        </div>
      ) : latestReport ? (
        <div className="flex flex-col gap-6">
          <div className="eco-glass-card bg-white border border-eco-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm relative">
            <div className="flex items-center gap-2 text-eco-green">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-[0.28em]">AI insight</span>
            </div>

            <h3 className="text-3xl font-black text-eco-dark leading-tight">{latestReport.summaryTitle}</h3>

            <p className="text-base text-eco-textLight leading-relaxed whitespace-pre-line">
              {renderTextValue(latestReport.reportBody)}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-eco-light rounded-2xl p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-eco-textLight font-bold">Points</div>
                <div className="text-2xl font-extrabold text-eco-dark mt-1">{user.points || 0}</div>
              </div>
              <div className="bg-eco-light rounded-2xl p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-eco-textLight font-bold">Quests done</div>
                <div className="text-2xl font-extrabold text-eco-dark mt-1">{(history || []).length}</div>
              </div>
              <div className="bg-eco-light rounded-2xl p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-eco-textLight font-bold">Carbon saved</div>
                <div className="text-2xl font-extrabold text-eco-dark mt-1">{totalCarbonSaved.toFixed(1)} kg</div>
              </div>
            </div>

            <div className="border-t border-eco-border pt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-eco-textLight">This report is stored in the database and can be referenced by the chatbot.</span>
              <button
                onClick={handleGenerateReport}
                className="text-sm text-eco-green font-bold flex items-center gap-1 hover:underline"
              >
                Regenerate <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-eco-dark">Saved report context</h3>
              <div className="flex flex-col gap-3">
                {metricEntries.map(([label, value]) => (
                  <div key={label} className="bg-white border border-eco-border rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-eco-textLight capitalize">{label}</span>
                    <span className="text-sm font-bold text-eco-dark">{renderTextValue(value)}</span>
                  </div>
                ))}
                {(latestReport.nextSteps || []).map((step, index) => (
                  <div key={index} className="bg-white border border-eco-border rounded-2xl p-4">
                    <div className="text-sm font-bold text-eco-dark">Next step {index + 1}</div>
                    <div className="text-sm text-eco-textLight mt-1">{renderTextValue(step)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1E352F] text-white rounded-3xl p-5 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-5 h-5 text-eco-green" />
                <h3 className="text-xl font-extrabold">CarbonWise assistant</h3>
              </div>
              <p className="text-sm text-eco-light/85 leading-relaxed">
                Ask about your report, streak, quests, or carbon footprint trends. The assistant uses saved history plus retrieved report context.
              </p>

              <div className="flex-1 overflow-auto max-h-80 flex flex-col gap-3 pr-1">
                {chatLoading ? (
                  <div className="text-sm text-eco-light/70 bg-white/10 rounded-2xl p-4">
                    Loading conversation memory...
                  </div>
                ) : chat.length === 0 ? (
                  <div className="text-sm text-eco-light/70 bg-white/10 rounded-2xl p-4">
                    Try: “What should I improve this week?” or “Why did my score change?”
                  </div>
                ) : (
                  chat.map((entry, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl p-4 text-sm leading-relaxed ${
                        entry.role === 'user' ? 'bg-white text-eco-dark self-end' : 'bg-white/10 text-white'
                      }`}
                    >
                      {renderTextValue(entry.content)}
                      {entry.sources?.length ? (
                        <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-eco-light/70">
                          Sources: {entry.sources.join(', ')}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Ask about your report..."
                  className="flex-1 rounded-2xl px-4 py-3 text-sm text-eco-dark outline-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-eco-green hover:bg-eco-green/90 disabled:opacity-70 text-white font-bold px-4 py-3 rounded-2xl flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center bg-white border border-eco-border rounded-3xl p-6">
          <TrendingUp className="w-10 h-10 text-eco-green opacity-40" />
          <h3 className="text-xl font-bold text-eco-dark">No report yet</h3>
          <p className="text-base text-eco-textLight px-6">
            Generate a report so the chatbot has stored context to work with.
          </p>
          <button
            onClick={handleGenerateReport}
            className="mt-2 bg-eco-green hover:bg-eco-green/90 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all active:scale-95 text-sm"
          >
            Generate report
          </button>
        </div>
      )}
    </div>
  );
}
