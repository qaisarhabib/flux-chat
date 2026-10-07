import { FormEvent, useEffect, useRef, useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatResponse = {
  reply: string;
  conversationId: string;
};

const createConversationId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const conversationId = useRef<string>(createConversationId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();

    if (!message || isLoading) return;

    setMessages((current) => [...current, { role: 'user', content: message }]);
    setInput('');
    setError('');
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 25_000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId: conversationId.current,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { message?: string | string[] }
          | null;
        const detail = Array.isArray(body?.message)
          ? body.message.join(', ')
          : body?.message;
        throw new Error(detail || 'The chatbot could not respond.');
      }

      const data = (await response.json()) as ChatResponse;
      conversationId.current = data.conversationId;
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof DOMException && requestError.name === 'AbortError'
          ? 'The request timed out. Please try again.'
          : requestError instanceof Error
          ? requestError.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="chat-card" aria-label="Chatbot conversation">
        <header className="chat-header">
          <h1>Simple Chatbot</h1>
          <p>Powered by Mistral</p>
        </header>

        <div className="messages" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`message-row ${message.role}`} key={index}>
              <div className="message-bubble">
                <span className="message-label">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
                <p>{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-row assistant">
              <div className="message-bubble loading" role="status">
                Assistant is thinking…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && <p className="error-message">{error}</p>}

        <form className="chat-form" onSubmit={sendMessage}>
          <label className="sr-only" htmlFor="message-input">
            Message
          </label>
          <textarea
            id="message-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Type your message…"
            rows={2}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? 'Sending…' : 'Send'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
