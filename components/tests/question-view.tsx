"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Mic, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

const parseBlanks = (text: string) => {
    const parts: Array<
        { type: "text"; value: string } | { type: "blank"; id: string }
    > = [];
    const regex = /__\d+__/g;
    let lastIndex = 0;

    for (const match of text.matchAll(regex)) {
        const index = match.index ?? 0;
        if (index > lastIndex) {
            parts.push({ type: "text", value: text.slice(lastIndex, index) });
        }
        const placeholder = match[0];
        const id = placeholder.replace(/__/g, "");
        parts.push({ type: "blank", id });
        lastIndex = index + placeholder.length;
    }

    if (lastIndex < text.length) {
        parts.push({ type: "text", value: text.slice(lastIndex) });
    }

    return parts;
};

type SpeechRecognitionConstructor = new () => {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    start: () => void;
    stop: () => void;
    onresult: ((event: any) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: any) => void) | null;
};

type SpeechInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

function SpeechInput({ value, onChange, placeholder }: SpeechInputProps) {
    const recognitionRef =
        useRef<InstanceType<SpeechRecognitionConstructor> | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        const speechConstructor =
            (
                window as unknown as {
                    SpeechRecognition?: SpeechRecognitionConstructor;
                }
            ).SpeechRecognition ||
            (
                window as unknown as {
                    webkitSpeechRecognition?: SpeechRecognitionConstructor;
                }
            ).webkitSpeechRecognition;
        setIsSupported(Boolean(speechConstructor));
    }, []);

    const handleStart = () => {
        const speechConstructor =
            (
                window as unknown as {
                    SpeechRecognition?: SpeechRecognitionConstructor;
                }
            ).SpeechRecognition ||
            (
                window as unknown as {
                    webkitSpeechRecognition?: SpeechRecognitionConstructor;
                }
            ).webkitSpeechRecognition;

        if (!speechConstructor) {
            return;
        }

        const recognition = new speechConstructor();
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = 0; i < event.results.length; i += 1) {
                transcript += event.results[i][0].transcript;
            }
            onChange(transcript.trim());
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        recognition.onerror = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        setIsListening(true);
        recognition.start();
    };

    const handleStop = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    return (
        <div className="flex flex-col gap-3">
            <textarea
                className="min-h-[140px] w-full rounded-xl border border-border/60 bg-background p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    variant={isListening ? "secondary" : "outline"}
                    size="sm"
                    onClick={isListening ? handleStop : handleStart}
                    disabled={!isSupported}
                >
                    {isListening ? (
                        <Square className="size-4" />
                    ) : (
                        <Mic className="size-4" />
                    )}
                    {isListening ? "Stop dictation" : "Use speech-to-text"}
                </Button>
                {!isSupported ? (
                    <span className="text-xs text-muted-foreground">
                        Speech recognition is not supported in this browser.
                    </span>
                ) : null}
            </div>
        </div>
    );
}

type QuestionViewProps = {
    question: Doc<"questions">;
    value: any;
    onChange: (value: any) => void;
};

export function QuestionView({ question, value, onChange }: QuestionViewProps) {
    const blanks = question.blanks ?? [];
    const blankIndex = useMemo(
        () => new Map(blanks.map((blank, index) => [blank.id, index])),
        [blanks],
    );

    const handleBlankChange = (id: string, newValue: string) => {
        const index = blankIndex.get(id);
        if (index === undefined) {
            return;
        }
        const next = Array.isArray(value) ? [...value] : [];
        next[index] = newValue;
        onChange(next);
    };

    const handleMultiToggle = (optionId: string) => {
        const selected = new Set<string>(Array.isArray(value) ? value : []);
        if (selected.has(optionId)) {
            selected.delete(optionId);
        } else {
            selected.add(optionId);
        }
        onChange(Array.from(selected));
    };

    const handleHighlightToggle = (index: number) => {
        const selected = new Set<number>(Array.isArray(value) ? value : []);
        if (selected.has(index)) {
            selected.delete(index);
        } else {
            selected.add(index);
        }
        onChange(Array.from(selected));
    };

    const handleReorderMove = (from: number, to: number) => {
        if (from === to) {
            return;
        }
        const order = Array.isArray(value)
            ? [...value]
            : (question.options ?? []).map((option) => option.id);
        const [moved] = order.splice(from, 1);
        order.splice(to, 0, moved);
        onChange(order);
    };

    const renderInput = () => {
        switch (question.inputMode) {
            case "mcq_single":
                return (
                    <div className="grid gap-2">
                        {(question.options ?? []).map((option) => {
                            const selected = value === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => onChange(option.id)}
                                    className={cn(
                                        "flex items-start gap-3 rounded-xl border border-border/60 bg-background p-3 text-left text-sm transition",
                                        selected
                                            ? "border-primary/60 bg-primary/10"
                                            : "hover:border-primary/40",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "mt-1 inline-flex size-3 rounded-full border border-border",
                                            selected
                                                ? "border-primary bg-primary"
                                                : "bg-transparent",
                                        )}
                                    />
                                    <span>{option.text}</span>
                                </button>
                            );
                        })}
                    </div>
                );
            case "mcq_multi":
                return (
                    <div className="grid gap-2">
                        {(question.options ?? []).map((option) => {
                            const selected =
                                Array.isArray(value) &&
                                value.includes(option.id);
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleMultiToggle(option.id)}
                                    className={cn(
                                        "flex items-start gap-3 rounded-xl border border-border/60 bg-background p-3 text-left text-sm transition",
                                        selected
                                            ? "border-primary/60 bg-primary/10"
                                            : "hover:border-primary/40",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "mt-1 inline-flex size-4 items-center justify-center rounded border border-border text-[10px]",
                                            selected
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "bg-transparent",
                                        )}
                                    >
                                        {selected ? "✓" : ""}
                                    </span>
                                    <span>{option.text}</span>
                                </button>
                            );
                        })}
                    </div>
                );
            case "fill_blanks_dropdown":
                return (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {question.stimulus?.text
                            ? parseBlanks(question.stimulus.text).map(
                                  (part, index) => {
                                      if (part.type === "text") {
                                          return (
                                              <span key={`text-${index}`}>
                                                  {part.value}
                                              </span>
                                          );
                                      }
                                      const blank = blanks.find(
                                          (item) => item.id === part.id,
                                      );
                                      const blankValue = Array.isArray(value)
                                          ? (value[
                                                blankIndex.get(part.id) ?? 0
                                            ] ?? "")
                                          : "";
                                      return (
                                          <select
                                              key={`blank-${part.id}`}
                                              value={blankValue}
                                              onChange={(event) =>
                                                  handleBlankChange(
                                                      part.id,
                                                      event.target.value,
                                                  )
                                              }
                                              className="h-9 min-w-[140px] rounded-md border border-border bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                                          >
                                              <option value="">Select</option>
                                              {(blank?.choices ?? []).map(
                                                  (choice) => (
                                                      <option
                                                          key={`${part.id}-${choice}`}
                                                          value={choice}
                                                      >
                                                          {choice}
                                                      </option>
                                                  ),
                                              )}
                                          </select>
                                      );
                                  },
                              )
                            : null}
                    </div>
                );
            case "fill_blanks_text":
                return (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {question.stimulus?.text
                            ? parseBlanks(question.stimulus.text).map(
                                  (part, index) => {
                                      if (part.type === "text") {
                                          return (
                                              <span key={`text-${index}`}>
                                                  {part.value}
                                              </span>
                                          );
                                      }
                                      const blankValue = Array.isArray(value)
                                          ? (value[
                                                blankIndex.get(part.id) ?? 0
                                            ] ?? "")
                                          : "";
                                      return (
                                          <Input
                                              key={`blank-${part.id}`}
                                              value={blankValue}
                                              onChange={(event) =>
                                                  handleBlankChange(
                                                      part.id,
                                                      event.target.value,
                                                  )
                                              }
                                              className="h-9 w-24"
                                          />
                                      );
                                  },
                              )
                            : null}
                    </div>
                );
            case "reorder_paragraphs": {
                const order = Array.isArray(value)
                    ? value
                    : (question.options ?? []).map((option) => option.id);
                const optionMap = new Map(
                    (question.options ?? []).map((option) => [
                        option.id,
                        option,
                    ]),
                );
                return (
                    <div className="grid gap-3">
                        {order.map((id, index) => {
                            const option = optionMap.get(id);
                            if (!option) {
                                return null;
                            }
                            return (
                                <div
                                    key={id}
                                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3"
                                >
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() =>
                                                handleReorderMove(
                                                    index,
                                                    Math.max(index - 1, 0),
                                                )
                                            }
                                        >
                                            <ArrowUp className="size-3" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() =>
                                                handleReorderMove(
                                                    index,
                                                    Math.min(
                                                        index + 1,
                                                        order.length - 1,
                                                    ),
                                                )
                                            }
                                        >
                                            <ArrowDown className="size-3" />
                                        </Button>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Paragraph {index + 1}
                                        </p>
                                        <p className="mt-2 text-sm">
                                            {option.text}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            }
            case "highlight_words": {
                const text = question.stimulus?.text ?? "";
                const words = text.split(" ");
                const selected = new Set<number>(
                    Array.isArray(value) ? value : [],
                );
                return (
                    <div className="flex flex-wrap gap-2 text-sm">
                        {words.map((word, index) => {
                            const isSelected = selected.has(index);
                            return (
                                <button
                                    key={`${word}-${index}`}
                                    type="button"
                                    onClick={() => handleHighlightToggle(index)}
                                    className={cn(
                                        "rounded-md border border-border/60 px-2 py-1 transition",
                                        isSelected
                                            ? "border-primary/60 bg-primary/10 text-primary"
                                            : "hover:border-primary/40",
                                    )}
                                >
                                    {word}
                                </button>
                            );
                        })}
                    </div>
                );
            }
            case "short_text":
                return (
                    <Input
                        value={value ?? ""}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder="Type your answer"
                    />
                );
            case "long_text":
                return (
                    <textarea
                        className="min-h-[160px] w-full rounded-xl border border-border/60 bg-background p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        value={value ?? ""}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder="Type your response"
                    />
                );
            case "spoken_transcript":
                return (
                    <SpeechInput
                        value={value ?? ""}
                        onChange={onChange}
                        placeholder="Speak or type your response"
                    />
                );
            default:
                return (
                    <Input
                        value={value ?? ""}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder="Type your answer"
                    />
                );
        }
    };

    const wordCount =
        typeof value === "string" && value.trim().length
            ? value.trim().split(/\s+/).length
            : 0;
    const showWordCount =
        question.inputMode === "long_text" ||
        question.inputMode === "spoken_transcript";

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6">
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {question.section.replace("_", " ")}
                    </p>
                    <h2 className="text-xl font-semibold">{question.prompt}</h2>
                </div>
                <div className="mt-4 grid gap-4 text-sm">
                    {question.stimulus?.imageUrl ? (
                        <div className="rounded-xl border border-border/60 bg-background p-3">
                            <img
                                src={question.stimulus.imageUrl}
                                alt={question.stimulus.text ?? "PTE stimulus"}
                                className="w-full rounded-lg object-contain"
                            />
                            {question.stimulus.text ? (
                                <p className="mt-3 text-xs text-muted-foreground">
                                    {question.stimulus.text}
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                    {question.stimulus?.audioUrl ? (
                        <audio controls className="w-full">
                            <source src={question.stimulus.audioUrl} />
                        </audio>
                    ) : null}
                    {question.stimulus?.transcript ? (
                        <div className="rounded-xl border border-border/60 bg-background p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Audio transcript (MVP placeholder)
                            </p>
                            <p className="mt-2 text-sm">
                                {question.stimulus.transcript}
                            </p>
                        </div>
                    ) : null}
                    {question.stimulus?.text && !question.stimulus.imageUrl ? (
                        <div className="rounded-xl border border-border/60 bg-background p-3">
                            <p className="text-sm leading-6">
                                {question.stimulus.text}
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6">
                {renderInput()}
                {showWordCount ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                        Words: {wordCount}
                        {question.rubric?.minWords || question.rubric?.maxWords
                            ? ` · Target ${question.rubric?.minWords ?? 0}–${question.rubric?.maxWords ?? "∞"}`
                            : null}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
