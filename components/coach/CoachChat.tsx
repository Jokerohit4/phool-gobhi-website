'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DisclaimerGate from './DisclaimerGate';
import ConversationSidebar from './ConversationSidebar';
import MessageBubble from './MessageBubble';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ConversationSummary {
  id: number;
  title: string | null;
  updatedAt: string;
}

interface ConsentState {
  granted: boolean;
  needsReconsent: boolean;
  /** False when no model provider is configured behind the feature. The flag
   *  being on and the assistant being usable are different facts. */
  available: boolean;
  disclaimer: { title: string; body: string[]; acceptLabel: string };
}

// Optimistic user messages need an id before the server has given them one.
// Negative so they can never collide with a real one.
let tempId = -1;

export default function CoachChat() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [consentBusy, setConsentBusy] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Plain fetch + useState throughout — this codebase has no SWR/react-query
  // and introducing one for a single screen would be a decision for the whole
  // app, not for this feature.
  const loadConsent = useCallback(async () => {
    try {
      const res = await fetch('/api/fitness-assistant/consent', { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Could not load the assistant');
      setConsent(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the assistant');
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/fitness-assistant/conversations', { cache: 'no-store' });
      if (!res.ok) return; // a missing history list is not worth an error banner
      const body = await res.json();
      setConversations(body.data ?? []);
    } catch {
      /* ignore — the chat still works without the sidebar */
    }
  }, []);

  useEffect(() => {
    loadConsent();
  }, [loadConsent]);

  useEffect(() => {
    if (consent?.granted) loadConversations();
  }, [consent?.granted, loadConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, sending]);

  async function acceptDisclaimer() {
    setConsentBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/fitness-assistant/consent', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Could not save that');
      await loadConsent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that');
    } finally {
      setConsentBusy(false);
    }
  }

  async function openConversation(id: number) {
    setError(null);
    setErrorCode(null);
    try {
      const res = await fetch(`/api/fitness-assistant/conversations/${id}`, { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Could not open that conversation');
      setConversationId(id);
      setMessages(body.data?.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open that conversation');
    }
  }

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
    setError(null);
    setErrorCode(null);
  }

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;

    const optimistic: Message = {
      id: tempId--,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    setSending(true);
    setError(null);
    setErrorCode(null);

    try {
      const res = await fetch('/api/fitness-assistant/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId }),
      });
      const body = await res.json();

      if (!res.ok) {
        setErrorCode(body?.code ?? null);
        // The message IS saved server-side on a 503, so the optimistic bubble
        // is left in place — removing it would suggest the text was lost when
        // it wasn't. Every other failure means it never landed, so it goes.
        if (body?.code !== 'ASSISTANT_UNAVAILABLE') {
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          setDraft(text); // hand their words back rather than discarding them
        }
        if (
          body?.code === 'CONSENT_REQUIRED' ||
          body?.code === 'CONSENT_STALE' ||
          body?.code === 'ASSISTANT_NOT_CONFIGURED'
        ) {
          await loadConsent();
        }
        throw new Error(body?.error || 'Could not send that');
      }

      setConversationId(body.data.conversationId);
      setMessages((prev) => [...prev, body.data.message]);
      loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that');
    } finally {
      setSending(false);
    }
  }

  if (!consent) {
    return (
      <div className="section-padding container-custom">
        {error ? <p className="text-red-500">{error}</p> : 'Loading…'}
      </div>
    );
  }

  // Checked BEFORE the consent gate: asking someone to accept terms for a
  // thing that cannot answer them is worse than saying so plainly.
  if (!consent.available) {
    return (
      <div className="section-padding container-custom">
        <h1 className="text-3xl font-bold">Your coach</h1>
        <div className="card-premium mt-6 p-6">
          <p className="font-semibold">Not quite ready yet</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            We&apos;re still switching this on. Nothing to do on your side — check back shortly.
          </p>
        </div>
      </div>
    );
  }

  if (!consent.granted) {
    return (
      <DisclaimerGate
        disclaimer={consent.disclaimer}
        stale={consent.needsReconsent}
        busy={consentBusy}
        error={error}
        onAccept={acceptDisclaimer}
      />
    );
  }

  return (
    <div className="section-padding container-custom">
      <h1 className="text-3xl font-bold">Your coach</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Ask about training, recovery or eating around your sessions. It knows what you&apos;ve
        been doing.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
        <ConversationSidebar
          conversations={conversations}
          activeId={conversationId}
          onSelect={openConversation}
          onNew={startNewConversation}
        />

        <div className="card-premium flex min-h-[60vh] flex-col p-4">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 && !sending && (
              <p className="py-10 text-center text-sm text-gray-500">
                Ask it something — &ldquo;what should I train today?&rdquo; is a fine start.
              </p>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))}
            {sending && (
              <p className="text-sm text-gray-500" aria-live="polite">
                Thinking…
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-500" role="alert">
              <p>{error}</p>
              {errorCode === 'RATE_LIMITED' && (
                <p className="text-gray-500">
                  You&apos;ve asked a lot in a short time — this keeps the service
                  affordable for everyone.
                </p>
              )}
              {errorCode === 'ASSISTANT_UNAVAILABLE' && (
                <p className="text-gray-500">Your message was saved. Try sending again.</p>
              )}
              {errorCode === 'ASSISTANT_NOT_CONFIGURED' && (
                <p className="text-gray-500">
                  This isn&apos;t switched on yet — nothing you typed was lost.
                </p>
              )}
            </div>
          )}

          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask your coach…"
              aria-label="Message"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <button
              type="submit"
              disabled={sending || draft.trim().length === 0}
              className="btn-primary disabled:opacity-60"
            >
              Send
            </button>
          </form>

          {/* Kept visible permanently, not just at the consent gate — the
              disclaimer matters most at the moment someone is reading advice,
              which is long after they tapped "I understand". */}
          <p className="mt-2 text-xs text-gray-500">
            AI assistant, not a doctor. It can be wrong. If something hurts or worries you,
            see a qualified professional.
          </p>
        </div>
      </div>
    </div>
  );
}
