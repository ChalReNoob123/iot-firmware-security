'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSentinelStore } from '@/lib/store';
import { queryCopilot } from '@/lib/api';
import { CopilotChatMessage } from '@sentinelforge/shared-types';

export default function CopilotPage() {
  const { copilotMessages, addCopilotMessage } = useSentinelStore();
  const [inputPrompt, setInputPrompt] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages, isQuerying]);

  const handleSend = async (promptToSend?: string) => {
    const prompt = promptToSend || inputPrompt;
    if (!prompt.trim() || isQuerying) return;

    const userMsg: CopilotChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'USER',
      timestamp: new Date().toISOString(),
      content: prompt
    };
    addCopilotMessage(userMsg);
    setInputPrompt('');
    setIsQuerying(true);

    try {
      const result = await queryCopilot({
        prompt,
        scanId: 'scan_gw9842_arm_prod'
      });

      const copilotMsg: CopilotChatMessage = {
        id: `cop_${Date.now()}`,
        sender: 'COPILOT',
        timestamp: new Date().toISOString(),
        content: result.response,
        toolCallsExecuted: result.toolCallsExecuted
      };
      addCopilotMessage(copilotMsg);
    } catch (err) {
      console.error('Failed to query copilot:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const samplePrompts = [
    'Explain the zero-day buffer overflow in BLE and show the taint trace',
    'What is the shortest attack chain to root in the knowledge graph?',
    'Calculate CISA SSVC decision and EPSS scores for CVE-2024-38912',
    'Perform Post-Quantum Crypto audit against NIST standards'
  ];

  return (
    <div className="flex flex-col gap-6 font-mono h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-purple animate-pulse" />
            <h1 className="text-lg font-bold text-white">AI SECURITY COPILOT & MCP TOOL LAYER</h1>
          </div>
          <p className="text-xs text-cyber-muted">
            Ground-Truth Model Context Protocol (MCP) Agent &bull; 6 Autonomous Tool Servers Active
          </p>
        </div>

        {/* Active MCP Tool Server Badges */}
        <div className="hidden md:flex items-center gap-1.5 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">binwalk-mcp</span>
          <span className="px-2 py-0.5 rounded bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald">qemu-mcp</span>
          <span className="px-2 py-0.5 rounded bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple">symbolic-exec-mcp</span>
          <span className="px-2 py-0.5 rounded bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue">fuzz-orchestrator-mcp</span>
          <span className="px-2 py-0.5 rounded bg-cyber-amber/10 border border-cyber-amber/30 text-cyber-amber">cve-epss-mcp</span>
          <span className="px-2 py-0.5 rounded bg-cyber-rose/10 border border-cyber-rose/30 text-cyber-rose">graph-query-mcp</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 glass-panel rounded-2xl p-4 flex flex-col justify-between overflow-hidden border border-cyber-border/60">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {copilotMessages.map((msg) => {
            const isUser = msg.sender === 'USER';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1.5`}
              >
                <div className="flex items-center gap-2 text-[10px] text-cyber-muted">
                  <span>{isUser ? 'ANALYST' : 'SENTINELFORGE COPILOT (MCP)'}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>

                <div
                  className={`p-4 rounded-xl text-xs max-w-3xl leading-relaxed ${
                    isUser
                      ? 'bg-cyber-cyan/20 text-white border border-cyber-cyan/40 rounded-tr-none'
                      : 'bg-cyber-surface/90 text-slate-200 border border-cyber-border rounded-tl-none'
                  }`}
                >
                  {/* Tool Execution Badges */}
                  {msg.toolCallsExecuted && msg.toolCallsExecuted.length > 0 && (
                    <div className="mb-3 space-y-2 border-b border-cyber-border/40 pb-3">
                      <div className="text-[10px] text-cyber-purple font-bold flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        EXECUTED MCP TOOL CALLS:
                      </div>
                      {msg.toolCallsExecuted.map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-cyber-bg/90 border border-cyber-border/60 text-[10px]"
                        >
                          <div className="flex items-center justify-between text-cyber-cyan">
                            <span>{tc.server} &rarr; <strong>{tc.toolName}()</strong></span>
                          </div>
                          <div className="text-cyber-muted mt-0.5">{tc.resultSummary}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            );
          })}

          {isQuerying && (
            <div className="flex items-center gap-2 text-xs text-cyber-cyan font-mono py-2">
              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
              <span>Querying MCP Servers (angr, QEMU, Neo4j) & evaluating telemetry...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sample Prompt Shortcuts */}
        <div className="pt-3 border-t border-cyber-border/40 flex flex-wrap gap-2 mb-2">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-md bg-cyber-surface/70 hover:bg-cyber-card text-[10px] text-cyber-muted hover:text-cyber-cyan border border-cyber-border transition-colors truncate max-w-xs"
            >
              &ldquo;{p}&rdquo;
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Security Copilot about zero-days, taint traces, attack chains, or mitigations..."
            className="flex-1 bg-cyber-surface/90 border border-cyber-border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-cyber-muted focus:outline-none focus:border-cyber-cyan"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isQuerying}
            className="px-5 py-2.5 rounded-xl bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,245,212,0.25)]"
          >
            Ask MCP
          </button>
        </form>
      </div>
    </div>
  );
}
