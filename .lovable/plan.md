## מטרה
להוסיף כפתור "נסח מחדש בעזרת AI" לכל תיבת טקסט באפליקציה (כרגע: שדה החיפוש בטולבר ושדה ההערות ב-TaskPanel, וכל טקסט עתידי), שייקח את הטקסט שהמשתמש כתב, ישלח ל-Lovable AI, ויחליף אותו בגרסה מנוסחת בצורה ברורה ותקנית בעברית.

## ארכיטקטורה

1. **Edge / Server function** — `src/server/rephrase.functions.ts`
   - `createServerFn` בשם `rephraseText` שמקבל `{ text: string, tone?: "formal" | "friendly" | "concise" }`.
   - קורא ל-Lovable AI Gateway (`google/gemini-3-flash-preview`) עם system prompt בעברית: "נסח מחדש את הטקסט בצורה ברורה, תקנית ומובנת. שמור על המשמעות והשפה המקורית. החזר רק את הטקסט המנוסח, ללא הסברים."
   - מטפל ב-429/402 ומחזיר שגיאה ידידותית.
   - משתמש ב-`process.env.LOVABLE_API_KEY` (מסופק אוטומטית ע"י Lovable Cloud — נצטרך להפעיל אותו).

2. **קומפוננטה ל-UI** — `src/components/ai/AiRephraseButton.tsx`
   - כפתור קטן עם אייקון ✨ (Sparkles מ-lucide) + tooltip "נסח מחדש בעזרת AI".
   - מצבי: idle / loading (ספינר) / error (toast).
   - props: `value: string`, `onChange: (next: string) => void`, `disabled?`, `size?`.
   - בלחיצה: מפעיל את `rephraseText`, מחליף את הערך, ומציג toast עם אופציית Undo (5 שניות) שמחזירה את הטקסט המקורי.

3. **Wrapper לשימוש קל** — `src/components/ai/AiTextArea.tsx` ו-`AiTextInput.tsx`
   - עוטף `<textarea>` / `<input>` קיים ומציב את כפתור ה-AI בפינה (bottom-end ב-textarea, end ב-input).
   - שומר את כל ה-props המקוריים (placeholder, className וכו') ומקבל `value`/`onChange` נשלטים.
   - לא מציג את הכפתור כשהטקסט קצר מ-3 תווים (אין מה לנסח).

4. **שילוב במקומות הקיימים**
   - `src/components/tasks/TaskPanel.tsx` — שדה ההערות ("הוסף הערה…") יומר ל-`AiTextArea` עם state מקומי.
   - `src/routes/index.tsx` — שדה החיפוש: לא נוסיף שם AI (חיפוש לא דורש ניסוח), אבל **נכין תשתית** כך ששדות עתידיים (תיאור משימה חדשה, וכו') יקבלו את זה אוטומטית.
   - הערה: נבדוק את שאר הקוד ונוודא שכל `<textarea>` שמשמש ליצירת תוכן (לא חיפוש/סינון) מקבל את ה-Wrapper.

5. **Accessibility**
   - לכפתור: `aria-label="נסח מחדש את הטקסט בעזרת בינה מלאכותית"`, `aria-busy` במהלך טעינה, `focus-visible:ring`.
   - ה-toast של Undo נגיש למקלדת.

6. **Lovable Cloud / AI**
   - אם Lovable Cloud עדיין לא מופעל — נפעיל אותו (זה גם מספק את `LOVABLE_API_KEY` אוטומטית). אין צורך לבקש מהמשתמש מפתח.

## טכני בקצרה
- ספרייה חדשה: `src/components/ai/`
- שרת: `src/server/rephrase.functions.ts`
- שינויים: `TaskPanel.tsx` (שדה הערות), אולי הוספת toast provider אם לא קיים (sonner כבר ב-ui).
- ללא תלויות חדשות.

## מה ייצא בסוף
בכל מקום שמשתמש מקליד תוכן חופשי, יופיע כפתור ✨ קטן. לחיצה עליו → AI מחזיר ניסוח משופר → הטקסט מתעדכן במקום → אפשר לבטל ב-toast.
