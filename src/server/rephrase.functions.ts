import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  text: z.string().min(1).max(5000),
  tone: z.enum(["clear", "formal", "friendly", "concise"]).optional(),
});

const TONE_INSTRUCTIONS: Record<string, string> = {
  clear: "ברור ומובן, בעברית תקנית",
  formal: "רשמי ומקצועי, בעברית תקנית",
  friendly: "ידידותי ונגיש, בעברית תקנית",
  concise: "תמציתי וקצר, בעברית תקנית",
};

export const rephraseText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI אינו זמין כרגע. נסה שוב מאוחר יותר." };
    }

    const tone = data.tone ?? "clear";
    const systemPrompt = `אתה עורך לשוני מומחה לעברית. נסח מחדש את הטקסט שהמשתמש שולח כך שיהיה ${TONE_INSTRUCTIONS[tone]}. שמור על המשמעות המקורית, על השפה (אם המקור באנגלית — שמור באנגלית), ועל סימני פיסוק. אל תוסיף הסברים, הקדמות או סוגריים — החזר רק את הטקסט המנוסח.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: data.text },
          ],
        }),
      });

      if (res.status === 429) {
        return { ok: false as const, error: "יותר מדי בקשות. נסה שוב בעוד רגע." };
      }
      if (res.status === 402) {
        return { ok: false as const, error: "חסרים קרדיטים ל-AI. הוסף קרדיטים בהגדרות Workspace." };
      }
      if (!res.ok) {
        const body = await res.text();
        console.error("Lovable AI error:", res.status, body);
        return { ok: false as const, error: "שגיאה בקריאה ל-AI." };
      }

      const json = await res.json();
      const rephrased: string | undefined = json?.choices?.[0]?.message?.content?.trim();
      if (!rephrased) {
        return { ok: false as const, error: "לא התקבלה תשובה מה-AI." };
      }
      return { ok: true as const, text: rephrased };
    } catch (e) {
      console.error("rephraseText failed:", e);
      return { ok: false as const, error: "תקלה ברשת בעת קריאה ל-AI." };
    }
  });
