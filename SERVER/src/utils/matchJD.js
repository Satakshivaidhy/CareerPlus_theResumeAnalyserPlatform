const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey.includes("your_gemini_api_key")) {
    throw new Error("GEMINI_API_KEY is missing or placeholder in .env");
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
      generationConfig: {
        temperature: 0,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini API failed");
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const normalizeKeywords = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
};

const stopWords = new Set([
  "with", "from", "this", "that", "role", "team", "work", "about",
  "skills", "experience", "job", "description", "responsibilities",
  "must", "will", "looking", "strong", "good", "your", "the", "and",
  "for", "are", "you", "our", "all", "can", "have", "has", "had",
  "was", "were", "been", "being", "which", "who", "whom", "what",
  "where", "when", "why", "how", "any", "both", "each", "few",
  "more", "most", "other", "some", "such", "no", "nor", "not",
  "only", "own", "same", "so", "than", "too", "very", "just",
  "should", "now", "into", "through", "during", "before", "after",
  "above", "below", "summary", "candidate", "responsibilities",
  "requirements", "preferred", "qualifications", "years", "plus",
  "ability", "working", "knowledge", "including", "across", "within",
  "help", "build", "plans", "lead", "leading", "ensure", "meet"
]);

const matchJD = async (resumeObj, jobDescription) => {
  const resumeText = (
    (resumeObj?.raw_text || "") +
    " " +
    (resumeObj?.skills || []).join(" ") +
    " " +
    (resumeObj?.summary || "")
  ).toLowerCase();

  const jdWords = normalizeKeywords(jobDescription);
  const jdKeywords = [...new Set(jdWords.filter((w) => !stopWords.has(w) && isNaN(w)))];

  const matchedKeywords = [];
  const missingKeywords = [];

  for (const kw of jdKeywords) {
    if (resumeText.includes(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  const matchRatio = totalKeywords > 0 ? matchedKeywords.length / totalKeywords : 0.5;
  const computedScore = Math.max(35, Math.min(95, Math.round(matchRatio * 100)));

  let suitability = "Moderate Fit";
  if (computedScore >= 80) suitability = "Strong Fit";
  else if (computedScore >= 65) suitability = "Good Fit";
  else if (computedScore < 50) suitability = "Needs Alignment";

  const prompt = `
    Compare the resume against the job description.
    Return valid JSON only in this exact format:
    {
      "match_score": ${computedScore},
      "job_suitability": "${suitability}",
      "summary": "",
      "matched_keywords": [],
      "missing_keywords": [],
      "actionable_suggestions": []
    }

    Resume:
    ${JSON.stringify(resumeObj, null, 2)}

    Job Description:
    ${jobDescription}
  `;

  let aiOutput;
  try {
    aiOutput = await callGemini(prompt);
    const cleanOutput = aiOutput.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedResult = JSON.parse(cleanOutput);
    return {
      match_score: parsedResult.match_score || computedScore,
      job_suitability: parsedResult.job_suitability || suitability,
      summary: parsedResult.summary || "AI analysis completed.",
      matched_keywords: parsedResult.matched_keywords?.length ? [...new Set(parsedResult.matched_keywords)] : matchedKeywords.slice(0, 10),
      missing_keywords: parsedResult.missing_keywords?.length ? [...new Set(parsedResult.missing_keywords)] : missingKeywords.slice(0, 10),
      actionable_suggestions: parsedResult.actionable_suggestions?.length ? parsedResult.actionable_suggestions : [
        `Consider incorporating targeted keywords like ${missingKeywords.slice(0, 3).join(", ")} into your experience bullet points.`,
        "Quantify your accomplishments with measurable impact and metrics.",
        "Tailor your professional summary to highlight the core requirements of this role."
      ],
    };
  } catch (error) {
    console.warn("Gemini JD Match API unavailable, using intelligent local ATS engine:", error.message);
    return {
      match_score: computedScore,
      job_suitability: suitability,
      summary: `Automated ATS analysis found ${matchedKeywords.length} matching core keywords. For deeper generative suggestions, configure a valid GEMINI_API_KEY in .env.`,
      matched_keywords: matchedKeywords.slice(0, 12),
      missing_keywords: missingKeywords.slice(0, 12),
      actionable_suggestions: [
        missingKeywords.length > 0
          ? `Add concrete experience with ${missingKeywords.slice(0, 3).join(", ")} to your skill list and project descriptions.`
          : "Highlight specific leadership achievements relevant to this role.",
        "Include quantifiable metrics (e.g. % increase, $ saved, team size) in your achievements.",
        "Align your resume headline with the exact target job title."
      ],
    };
  }
};

export default matchJD;
