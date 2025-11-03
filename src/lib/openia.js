import OpenAI from "openai";

export function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY missing");
    return new OpenAI({ apiKey });
}

export const CHAT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
export const EMBEDDING_MODEL =
    process.env.EMBEDDING_MODEL || "text-embedding-3-small";
