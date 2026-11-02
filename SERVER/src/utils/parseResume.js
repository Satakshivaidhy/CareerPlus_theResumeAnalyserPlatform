import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey.includes("your_gemini_api_key")) {
    throw new Error("GEMINI_API_KEY is not configured or is a placeholder in .env");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini API failed");
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const extractFallbackDetails = (rawText) => {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

  const emailMatch = rawText.match(emailRegex);
  const phoneMatch = rawText.match(phoneRegex);

  // Extract name: first non-empty line that isn't an email or URL
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const nameCandidate = lines.find(l => l.length < 50 && !l.includes("@") && !l.startsWith("http")) || "Candidate";

  // Common tech skills dictionary to extract skills from text
  const commonSkills = [
    "JavaScript", "TypeScript", "React", "Node.js", "Express", "HTML", "CSS", "Python",
    "Java", "C++", "C#", "SQL", "MongoDB", "PostgreSQL", "Git", "GitHub", "AWS", "Docker",
    "TailwindCSS", "Redux", "REST API", "GraphQL", "Next.js", "Vue", "Angular"
  ];

  const foundSkills = commonSkills.filter(skill => 
    new RegExp(`\\b${skill.replace(/[.+]/g, "\\$&")}\\b`, "i").test(rawText)
  );

  return {
    name: nameCandidate,
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0] : "",
    summary: lines.slice(1, 4).join(" "),
    skills: foundSkills,
    experience: [],
    education: [],
    projects: [],
    raw_text: rawText,
  };
};

const parseResume = async (file) => {
  let text = "";

  if (file.mimetype === "application/pdf") {
    try {
      const parserFn = typeof pdfParse === "function" ? pdfParse : pdfParse?.default;
      if (typeof parserFn === "function") {
        const pdfData = await parserFn(file.buffer);
        text = pdfData.text || "";
      } else {
        text = file.buffer.toString("latin1").replace(/[^\x20-\x7E\n\r\t]/g, " ");
      }
    } catch (pdfErr) {
      console.warn("⚠️ PDF text extraction warning:", pdfErr.message);
      // Fallback: extract plaintext pieces and zlib streams directly from the PDF buffer
      try {
        const rawStr = file.buffer.toString("latin1");
        const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
        let match;
        let streamText = "";
        const zlib = (await import("zlib")).default;
        while ((match = streamRegex.exec(rawStr)) !== null) {
          try {
            const decompressed = zlib.inflateSync(Buffer.from(match[1], "binary"));
            streamText += " " + decompressed.toString("utf-8");
          } catch {
            try {
              const decompressed = zlib.inflateRawSync(Buffer.from(match[1], "binary"));
              streamText += " " + decompressed.toString("utf-8");
            } catch {
              // Ignore invalid stream
            }
          }
        }
        text = (streamText + " " + rawStr).replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
      } catch {
        text = file.buffer.toString("latin1").replace(/[^\x20-\x7E\n\r\t]/g, " ");
      }
    }
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "application/msword"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });
    text = result.value || "";
  } else {
    throw new Error("Only PDF and DOCX files are supported");
  }

  const prompt = `
    Extract resume details into valid JSON only.
    Use this exact structure:
    {
      "name": "",
      "email": "",
      "phone": "",
      "summary": "",
      "skills": [],
      "experience": [
        { "title": "", "company": "", "duration": "", "description": "" }
      ],
      "education": [],
      "projects": []
    }

    Resume text:
    ${text}
  `;

  try {
    const aiOutput = await callGemini(prompt);
    // Clean Markdown JSON code fences if present
    const cleanOutput = aiOutput.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanOutput);
    return { ...parsed, raw_text: text };
  } catch (err) {
    console.warn("⚠️ AI resume parsing unavailable, using local fallback parser:", err.message);
    return extractFallbackDetails(text);
  }
};

export default parseResume;
