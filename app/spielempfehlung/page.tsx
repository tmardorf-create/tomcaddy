"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type SpeechRecognitionEventLike = Event & {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function SpielempfehlungPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const nextMessageId = useRef(1);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function toggleVoiceInput() {
    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      setError(
        "Spracheingabe wird auf diesem Browser nicht unterstützt. Bitte Safari aktualisieren oder die Frage eintippen.",
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new Recognition();

    recognition.lang = "de-DE";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript =
        event.results[0]?.[0]?.transcript || "";

      setQuestion(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      setError(
        "Die Spracheingabe konnte nicht gestartet werden.",
      );
    };

    recognitionRef.current = recognition;
    setError("");
    setListening(true);
    recognition.start();
  }

  async function askCaddy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Bitte gib zuerst eine Frage ein.");
      return;
    }

    if (trimmedQuestion.length > 1000) {
      setError("Die Frage ist zu lang.");
      return;
    }

    const userMessage: Message = {
      id: nextMessageId.current++,
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/caddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Keine Antwort vom Caddy erhalten.",
        );
      }

      const assistantMessage: Message = {
        id: nextMessageId.current++,
        role: "assistant",
        content:
          data.answer || "Ich konnte leider keine Antwort erzeugen.",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Der Caddy ist momentan nicht erreichbar.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f4] px-4 py-6">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="text-sm font-semibold text-[#075b3b]"
        >
          ← Zurück zur Übersicht
        </Link>

        <header className="mt-5">
          <p className="text-sm font-semibold text-[#075b3b]">
            ⛳ TomCaddy
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Manni der Golfpro
          </h1>

          <p className="mt-2 text-gray-600">
            Stelle eine konkrete Frage zu deinem nächsten Schlag,
            den Regeln oder deiner Runde.
          </p>
        </header>

        <section className="mt-6 space-y-3">
          {messages.length === 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-semibold text-[#075b3b]">
                Beispiele
              </p>

              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>„Ball liegt 30 Meter vor dem Grün im Rough.“</li>
                <li>„Darf ich den Ball hier besserlegen?“</li>
                <li>„Wie spiele ich diesen Bunkerschlag?“</li>
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-8 rounded-2xl rounded-br-sm bg-[#075b3b] p-4 text-white"
                  : "mr-8 rounded-2xl rounded-bl-sm bg-white p-4 text-gray-800 shadow-sm"
              }
            >
              <p className="mb-1 text-xs font-bold opacity-70">
                {message.role === "user"
                  ? "Du"
                  : "Manni der Golfpro"}
              </p>

              <p className="whitespace-pre-wrap text-sm leading-6">
                {message.content}
              </p>
            </div>
          ))}

          {loading && (
            <div className="mr-8 rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm">
              Manni überlegt kurz …
            </div>
          )}
        </section>

        <form
          onSubmit={askCaddy}
          className="sticky bottom-3 mt-6 rounded-2xl bg-white p-3 shadow-lg"
        >
          <textarea
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setError("");
            }}
            placeholder="Deine Frage an Manni …"
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-gray-300 p-3 text-base text-gray-900 outline-none focus:border-[#075b3b]"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex-1 rounded-xl py-3 font-bold ${
                listening
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {listening ? "🔴 Aufnahme stoppen" : "🎙️ Sprechen"}
            </button>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex-1 rounded-xl bg-[#075b3b] py-3 font-bold text-white disabled:bg-gray-400"
            >
              {loading ? "Wird gesendet …" : "Fragen"}
            </button>
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-red-100 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
