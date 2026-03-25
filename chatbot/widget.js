/* ============================================================
   KYNTHOR CHATBOT WIDGET — widget.js
   Osadzenie: <link rel="stylesheet" href="widget.css">
              <script src="widget.js"></script>
   ============================================================ */

(function () {
  "use strict";

  // ---- CONFIG ----
  const API_URL = "https://kynthor.pl/.netlify/functions/chat";
  const BOT_NAME = "Darnok";
  const WELCOME_MSG =
    "Cześć! Jestem Darnok, asystent AI KYNTHOR. W czym mogę Ci pomóc?";
  const MAX_HISTORY = 10;

  // ---- STATE ----
  let isOpen = false;
  let isLoading = false;
  const messages = []; // {role, content}

  // ---- SVG ICONS ----
  const ICON_CHAT =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>';

  const ICON_CLOSE =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

  const ICON_SEND =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  // ---- BUILD DOM ----
  function buildWidget() {
    // Toggle button
    const toggle = document.createElement("button");
    toggle.id = "kynthor-chat-toggle";
    toggle.innerHTML = ICON_CHAT;
    toggle.setAttribute("aria-label", "Otwórz czat");
    toggle.addEventListener("click", toggleChat);
    document.body.appendChild(toggle);

    // Chat window
    const win = document.createElement("div");
    win.id = "kynthor-chat-window";
    win.innerHTML = `
      <div id="kynthor-chat-header">
        <div id="kynthor-chat-header-info">
          <div id="kynthor-chat-header-name">${BOT_NAME}</div>
          <div id="kynthor-chat-header-status">Asystent AI KYNTHOR</div>
        </div>
        <button id="kynthor-chat-close" aria-label="Zamknij czat">&times;</button>
      </div>
      <div id="kynthor-chat-messages">
        <div class="kynthor-welcome">${WELCOME_MSG}</div>
      </div>
      <div id="kynthor-chat-input-area">
        <input
          id="kynthor-chat-input"
          type="text"
          placeholder="Napisz wiadomość..."
          autocomplete="off"
        />
        <button id="kynthor-chat-send" aria-label="Wyślij">${ICON_SEND}</button>
      </div>
    `;
    document.body.appendChild(win);

    // Events
    document
      .getElementById("kynthor-chat-close")
      .addEventListener("click", toggleChat);
    document
      .getElementById("kynthor-chat-send")
      .addEventListener("click", handleSend);
    document
      .getElementById("kynthor-chat-input")
      .addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
  }

  // ---- TOGGLE ----
  function toggleChat() {
    isOpen = !isOpen;
    const win = document.getElementById("kynthor-chat-window");
    const toggle = document.getElementById("kynthor-chat-toggle");

    if (isOpen) {
      win.classList.add("kynthor-visible");
      toggle.classList.add("kynthor-open");
      toggle.innerHTML = ICON_CLOSE;
      document.getElementById("kynthor-chat-input").focus();
    } else {
      win.classList.remove("kynthor-visible");
      toggle.classList.remove("kynthor-open");
      toggle.innerHTML = ICON_CHAT;
    }
  }

  // ---- ADD MESSAGE TO UI ----
  function appendMessage(role, text) {
    const container = document.getElementById("kynthor-chat-messages");
    const div = document.createElement("div");
    div.classList.add("kynthor-msg");
    div.classList.add(role === "user" ? "kynthor-msg-user" : "kynthor-msg-bot");
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  // ---- TYPING INDICATOR ----
  function showTyping() {
    const container = document.getElementById("kynthor-chat-messages");
    const typing = document.createElement("div");
    typing.classList.add("kynthor-typing");
    typing.id = "kynthor-typing-indicator";
    typing.innerHTML =
      '<div class="kynthor-typing-dot"></div><div class="kynthor-typing-dot"></div><div class="kynthor-typing-dot"></div>';
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById("kynthor-typing-indicator");
    if (el) el.remove();
  }

  // ---- SEND MESSAGE ----
  async function handleSend() {
    if (isLoading) return;

    const input = document.getElementById("kynthor-chat-input");
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    input.value = "";
    messages.push({ role: "user", content: text });
    appendMessage("user", text);

    // Disable input
    isLoading = true;
    const sendBtn = document.getElementById("kynthor-chat-send");
    sendBtn.disabled = true;
    input.disabled = true;

    showTyping();

    try {
      // Send only last MAX_HISTORY messages
      const historyToSend = messages.slice(-MAX_HISTORY);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyToSend }),
      });

      const data = await response.json();

      hideTyping();

      if (data.success && data.message) {
        messages.push({ role: "assistant", content: data.message });
        appendMessage("bot", data.message);
      } else {
        const errorText =
          data.error || "Przepraszam, coś poszło nie tak. Spróbuj ponownie.";
        appendMessage("bot", errorText);
      }
    } catch (err) {
      hideTyping();
      appendMessage(
        "bot",
        "Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie."
      );
    }

    // Re-enable input
    isLoading = false;
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
  }

  // ---- INIT ----
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
