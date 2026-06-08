import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Bot } from "lucide-react";

/*
  LOCAL COMPUTER:
  http://localhost:5000

  LOCAL MOBILE:
  If frontend is opened using laptop Network URL,
  window.location.hostname automatically becomes laptop IP.

  DEPLOYMENT:
  VITE_API_URL environment variable will be used.
*/
const API_BASE_URL = import.meta.env.PROD
  ? ""
  : `http://${window.location.hostname}:5000`;

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi 👋\nI am your AI Solar Assistant.\nAap solar survey, subsidy, ROI, panel capacity ya roof analysis ke baare me kuch bhi pooch sakte ho.",
    },
  ]);

  /* AUTO-SCROLL */
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, loading, open]);

  async function sendMessage(event) {
    event.preventDefault();

    const userMessage = input.trim();

    if (!userMessage || loading) return;

    /*
      Important:
      old messages request ke saath Gemini ko bheje jayenge.
    */
    const previousMessages = [...messages];

    setMessages((oldMessages) => [
      ...oldMessages,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: userMessage,
          history: previousMessages,
        }),
      });

      const data = await response.json();

      /*
        Gemini busy error bhi user ko proper reply ki tarah show hoga.
      */
      if (!response.ok) {
        setMessages((oldMessages) => [
          ...oldMessages,
          {
            role: "bot",
            text:
              data.reply ||
              "AI assistant abhi available nahi hai. Please thodi der baad try karo.",
          },
        ]);

        return;
      }

      setMessages((oldMessages) => [
        ...oldMessages,
        {
          role: "bot",
          text:
            data.reply ||
            "Sorry, response generate nahi ho paya. Please dobara try karo.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot Connection Error:", error);

      setMessages((oldMessages) => [
        ...oldMessages,
        {
          role: "bot",
          text:
            "Backend se connection nahi ho pa raha hai. Agar mobile par local testing kar rahe ho to laptop aur mobile same Wi-Fi par hone chahiye.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            right: "12px",
            bottom: "94px",

            width: "min(410px, calc(100vw - 24px))",
            height: "min(620px, calc(100dvh - 120px))",

            borderRadius: "24px",

            background:
              "linear-gradient(180deg, #052e16 0%, #064e3b 100%)",

            border: "1px solid rgba(255,255,255,0.1)",

            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",

            overflow: "hidden",

            zIndex: 9999,

            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              background:
                "linear-gradient(90deg, #047857 0%, #16a34a 100%)",

              padding: "15px 16px",

              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",

              borderBottom: "1px solid rgba(255,255,255,0.1)",

              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
              }}
            >
              <div
                style={{
                  width: "43px",
                  height: "43px",

                  borderRadius: "50%",

                  background: "#ffffff",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  flexShrink: 0,
                }}
              >
                <Bot size={24} color="#15803d" />
              </div>

              <div>
                <h3
                  style={{
                    fontWeight: "800",
                    fontSize: "16px",
                    color: "#ffffff",
                    margin: 0,
                  }}
                >
                  Solar Assistant
                </h3>

                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.82)",
                    margin: "2px 0 0",
                  }}
                >
                  Online • Gemini AI
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
              style={{
                width: "38px",
                height: "38px",
                minWidth: "38px",
                minHeight: "38px",

                borderRadius: "50%",

                border: "2px solid rgba(255,255,255,0.9)",

                background: "#064e3b",

                color: "#ffffff",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                cursor: "pointer",

                fontSize: "28px",
                fontWeight: "700",
                lineHeight: "1",

                touchAction: "manipulation",
              }}
            >
              ×
            </button>
          </div>

          {/* CHAT AREA */}
          <div
            style={{
              flex: 1,

              padding: "16px",

              overflowY: "auto",

              background:
                "linear-gradient(180deg, #052e16 0%, #064e3b 100%)",

              WebkitOverflowScrolling: "touch",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: "flex",

                  justifyContent:
                    message.role === "user"
                      ? "flex-end"
                      : "flex-start",

                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    background:
                      message.role === "user"
                        ? "linear-gradient(135deg, #15803d 0%, #22c55e 100%)"
                        : "rgba(255,255,255,0.1)",

                    border: "1px solid rgba(255,255,255,0.1)",

                    padding: "12px 15px",

                    borderRadius:
                      message.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",

                    width: "fit-content",
                    maxWidth: "86%",

                    color: "#ecfdf5",

                    fontSize: "14px",
                    lineHeight: "1.6",

                    whiteSpace: "pre-line",
                    overflowWrap: "anywhere",

                    boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.1)",

                    border: "1px solid rgba(255,255,255,0.1)",

                    padding: "11px 14px",

                    borderRadius: "18px 18px 18px 4px",

                    color: "#bbf7d0",

                    fontSize: "13px",
                  }}
                >
                  Solar Assistant typing...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <form
            onSubmit={sendMessage}
            style={{
              padding: "12px",

              background: "rgba(0,0,0,0.18)",

              borderTop: "1px solid rgba(255,255,255,0.1)",

              display: "flex",
              alignItems: "center",
              gap: "9px",

              flexShrink: 0,
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message..."
              autoComplete="off"
              style={{
                flex: 1,
                minWidth: 0,

                background: "rgba(255,255,255,0.1)",

                color: "#ffffff",

                border: "1px solid rgba(255,255,255,0.12)",

                outline: "none",

                padding: "13px 15px",

                borderRadius: "999px",

                fontSize: "14px",
              }}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              style={{
                width: "48px",
                height: "48px",

                minWidth: "48px",
                minHeight: "48px",

                borderRadius: "50%",

                border: "none",

                background:
                  loading || !input.trim()
                    ? "#4b5563"
                    : "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                cursor:
                  loading || !input.trim()
                    ? "not-allowed"
                    : "pointer",

                boxShadow: "0 6px 18px rgba(0,0,0,0.25)",

                flexShrink: 0,

                touchAction: "manipulation",
              }}
            >
              <Send size={18} color="#ffffff" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING BUTTON */}
      {!open && (
        <div
          style={{
            position: "fixed",
            right: "18px",
            bottom: "18px",

            zIndex: 9999,

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open chatbot"
            style={{
              width: "64px",
              height: "64px",

              borderRadius: "50%",

              border: "none",

              background:
                "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",

              boxShadow: "0 14px 35px rgba(0,0,0,0.35)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              cursor: "pointer",

              touchAction: "manipulation",
            }}
          >
            <MessageCircle size={30} color="#ffffff" />
          </button>

          <span
            style={{
              marginTop: "7px",

              fontSize: "12px",
              fontWeight: "700",

              background: "#064e3b",

              color: "#ffffff",

              padding: "5px 11px",

              borderRadius: "999px",

              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            }}
          >
            Need Help
          </span>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;