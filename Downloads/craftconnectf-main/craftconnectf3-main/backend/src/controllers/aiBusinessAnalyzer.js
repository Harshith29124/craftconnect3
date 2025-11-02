// src/controllers/aiBusinessAnalyzer.js
// Complete controller — drop-in replacement for your backend

const speech = require("@google-cloud/speech");
const BusinessAnalysis = require("../models/BusinessAnalysis");
const Ajv = require("ajv");

// Lazy import VertexAI to avoid hard failure during static analysis
let VertexAI;
try {
  VertexAI = require("@google-cloud/vertexai").VertexAI;
} catch (e) {
  VertexAI = null;
}

/* ---------------------------
   Compact schema + template
   --------------------------- */
const COMPACT_TEMPLATE = {
  businessType: "",
  businessStage: "",
  topProblems: [],
  topPlans: [],
};

const COMPACT_AJV_SCHEMA = {
  type: "object",
  properties: {
    businessType: { type: "string" },
    businessStage: { type: "string" },
    topProblems: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          problem: { type: "string" },
          severity: { type: "string" },
        },
        required: ["problem", "severity"],
      },
    },
    topPlans: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          priority: { type: "string" },
        },
        required: ["id", "title", "priority"],
      },
    },
  },
  additionalProperties: true,
};

/* ---------------------------
   Sanitizer: extract likely JSON chunk
   --------------------------- */
function sanitizeRawText(raw) {
  if (!raw) return "";

  let s = String(raw);

  // If there's a fenced block, pick its content
  const fenceMatch = s.match(/```(?:json|js|text|txt)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    s = fenceMatch[1].trim();
  }

  // Remove common leading phrases
  s = s.replace(
    /^[\s\n\r\t]*(?:here is the json|here's the json|here is the json requested|output:|answer:|here is the output)[:\s-]*/i,
    ""
  );

  // Remove leading backticks if any remain and trailing backticks
  s = s.replace(/^[`]+/, "").replace(/[`]+$/, "");

  // Remove everything before the first { or [
  const firstBrace = s.indexOf("{");
  const firstBracket = s.indexOf("[");
  let startPos = -1;
  if (firstBrace !== -1 && firstBracket !== -1)
    startPos = Math.min(firstBrace, firstBracket);
  else startPos = Math.max(firstBrace, firstBracket);

  if (startPos > 0) s = s.slice(startPos);

  // Remove leading "json:" words
  s = s.replace(/^[\s\n\r\t]*json[:\s-]*/i, "");

  s = s.trim();

  // If there's still a long block with JSON later, attempt to extract the longest balanced JSON chunk
  function extractLongestBalanced(text) {
    let best = null;
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== "{" && text[i] !== "[") continue;
      const openChar = text[i];
      const closeChar = openChar === "{" ? "}" : "]";
      let depth = 0;
      for (let j = i; j < text.length; j++) {
        if (text[j] === openChar) depth++;
        else if (text[j] === closeChar) depth--;
        if (depth === 0) {
          const cand = text.slice(i, j + 1);
          if (!best || cand.length > best.length) best = cand;
          break;
        }
      }
    }
    return best;
  }

  const candidate = extractLongestBalanced(s);
  if (candidate) s = candidate.trim();

  return s.trim();
}

/* ---------------------------
   Aggressive JSON repair
   --------------------------- */
function aggressivelyRepairRawJson(raw) {
  if (typeof raw !== "string") raw = String(raw || "");
  let s = raw.replace(/[\u0000-\u001F]+/g, "").trim();

  // Trim leading non-json characters (defensive)
  const firstBrace = s.indexOf("{");
  const firstBracket = s.indexOf("[");
  if (firstBrace > 0 || firstBracket > 0) {
    const startPos =
      firstBrace === -1
        ? firstBracket
        : firstBracket === -1
        ? firstBrace
        : Math.min(firstBrace, firstBracket);
    if (startPos > 0) s = s.slice(startPos);
  }

  let prev = null;
  const maxPasses = 8;
  let pass = 0;
  while (s !== prev && pass < maxPasses) {
    prev = s;

    // keys with missing values -> provide empty string
    s = s.replace(/"([A-Za-z0-9 _-]+)"\s*:\s*(?=[}\]])/g, '"$1": ""');
    s = s.replace(/"([A-Za-z0-9 _-]+)"\s*:\s*,/g, '"$1": "" ,');
    s = s.replace(/:\s*,\s*,+/g, ': "" ,');

    // trailing commas
    s = s.replace(/,\s*([}\]])/g, "$1");

    // remove dangling open string
    s = s.replace(/"[^"]*$/g, "");

    pass++;
  }

  // Balance braces & brackets
  const openCurly = (s.match(/{/g) || []).length;
  const closeCurly = (s.match(/}/g) || []).length;
  if (openCurly > closeCurly) s += "}".repeat(openCurly - closeCurly);

  const openSq = (s.match(/\[/g) || []).length;
  const closeSq = (s.match(/]/g) || []).length;
  if (openSq > closeSq) s += "]".repeat(openSq - closeSq);

  return s.trim();
}

/* ---------------------------
   Fill missing fields from template
   --------------------------- */
function fillMissingWithTemplate(target, template) {
  if (!template || typeof template !== "object") return target;
  if (!target || typeof target !== "object")
    return JSON.parse(JSON.stringify(template));
  const out = JSON.parse(JSON.stringify(template));
  for (const k of Object.keys(target)) {
    if (k in out) {
      if (Array.isArray(out[k])) {
        out[k] = Array.isArray(target[k]) ? target[k] : out[k];
      } else if (typeof out[k] === "object" && out[k] !== null) {
        out[k] = fillMissingWithTemplate(target[k] || {}, out[k]);
      } else {
        out[k] = target[k];
      }
    } else {
      out[k] = target[k];
    }
  }
  return out;
}

/* ---------------------------
   Synthesize solutions when parsing fails or partial
   --------------------------- */
function synthesizeSolutions(transcript, parsedFragment, rawText) {
  const fallback = [
    {
      type: "whatsapp",
      title: "Engage via WhatsApp",
      reason: "Direct chat helps resolve customer queries quickly.",
    },
    {
      type: "instagram",
      title: "Boost with Instagram",
      reason: "Visual posts increase discoverability and engagement.",
    },
    {
      type: "website",
      title: "Launch a website",
      reason: "A permanent storefront to showcase products and capture orders.",
    },
  ];

  const t = (transcript || "").toLowerCase();

  // If model returned a proper solutions array, use it
  if (
    parsedFragment &&
    Array.isArray(parsedFragment.solutions) &&
    parsedFragment.solutions.length >= 1
  ) {
    return parsedFragment.solutions.slice(0, 3);
  }

  // Heuristics: detect channel mentions in the transcript
  if (t.includes("whatsapp")) {
    return [fallback[0], fallback[1], fallback[2]];
  } else if (
    t.includes("instagram") ||
    t.includes("insta") ||
    t.includes("photo") ||
    t.includes("post")
  ) {
    return [fallback[1], fallback[0], fallback[2]];
  } else if (
    t.includes("website") ||
    t.includes("site") ||
    t.includes("online store") ||
    t.includes("storefront")
  ) {
    return [fallback[2], fallback[0], fallback[1]];
  }

  // Try to extract businessType or indications from raw JSON fragment
  if (rawText) {
    const btMatch = rawText.match(/"businessType"\s*:\s*"([^"]+)"/i);
    if (btMatch) {
      const bt = btMatch[1].toLowerCase();
      if (
        bt.includes("retail") ||
        bt.includes("shop") ||
        bt.includes("store")
      ) {
        return [fallback[2], fallback[0], fallback[1]]; // website first for retailers
      } else if (bt.includes("service")) {
        return [fallback[0], fallback[1], fallback[2]]; // whatsapp first for services
      }
    }
  }

  // Default fallback: whatsapp first (fastest, highest conversion)
  return fallback;
}

/* ---------------------------
   Normalize solutions to required 3 fixed types
   --------------------------- */
function normalizeSolutions(data) {
  const fallback = [
    {
      type: "whatsapp",
      title: "Engage via WhatsApp",
      reason: "Direct conversations build trust quickly.",
    },
    {
      type: "instagram",
      title: "Boost with Instagram",
      reason: "Visual storytelling drives reach and discovery.",
    },
    {
      type: "website",
      title: "Launch a website",
      reason: "Permanent digital presence to showcase products.",
    },
  ];

  if (!data || !Array.isArray(data.solutions)) {
    return fallback;
  }

  const types = ["whatsapp", "instagram", "website"];
  return types.map(
    (t, i) => data.solutions.find((s) => s && s.type === t) || fallback[i]
  );
}

/* ---------------------------
   Controller Class
   --------------------------- */
class AIBusinessAnalyzer {
  constructor() {
    this.speechClient = new speech.SpeechClient();
    if (VertexAI) {
      this.vertexAI = new VertexAI({
        project: process.env.GOOGLE_PROJECT_ID,
        location: process.env.VERTEX_LOCATION || "us-central1",
      });
      this.model = null;
    } else {
      this.vertexAI = null;
      this.model = null;
    }
    this.ajv = new Ajv({ allErrors: true, strict: false });
    this.validateCompact = this.ajv.compile(COMPACT_AJV_SCHEMA);
  }

  async getModel() {
    if (!this.vertexAI) throw new Error("Vertex AI SDK not configured");
    if (!this.model) {
      this.model = this.vertexAI.getGenerativeModel({
        model: process.env.VERTEX_MODEL || "gemini-2.5-flash",
      });
    }
    return this.model;
  }

  /* ---------------------------
     Main controller: analyzeBusinessFromVoice
     --------------------------- */
  async analyzeBusinessFromVoice(req, res) {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "Audio file is required" });
      }

      const transcription = await this.transcribeAudio(req.file.buffer);
      if (!transcription.success) {
        return res.status(500).json({ error: "Failed to transcribe audio" });
      }

      if (!transcription.text || transcription.text.trim().length === 0) {
        console.warn("Empty transcription received from speech-to-text");
        return res.status(400).json({
          error:
            "No speech detected in audio. Please ensure you speak clearly and the microphone is working.",
        });
      }

      const analysisResult = await this.analyzeBusinessWithVertexAI(
        transcription.text
      );

      if (!analysisResult.success) {
        // Save a minimal record and return an error to the client
        try {
          const doc = new BusinessAnalysis({
            inputText: transcription.text,
            analysis: null,
            analysisRaw:
              analysisResult.raw ||
              (analysisResult.data ? JSON.stringify(analysisResult.data) : ""),
            partial: true,
            savedFallback: true,
            timestamp: new Date(),
          });
          await doc.save();
        } catch (saveErr) {
          console.warn(
            "Failed to persist fallback record:",
            saveErr && saveErr.message ? saveErr.message : saveErr
          );
        }
        return res
          .status(500)
          .json({ error: analysisResult.error || "Vertex AI analysis failed" });
      }

      // Save to DB always (store partials too) - keeps audit trail
      try {
        const doc = new BusinessAnalysis({
          inputText: transcription.text,
          analysis:
            analysisResult.data && Object.keys(analysisResult.data).length > 0
              ? analysisResult.data
              : null,
          analysisRaw:
            analysisResult.raw ||
            (analysisResult.data ? JSON.stringify(analysisResult.data) : ""),
          parseErrors: analysisResult.partial
            ? analysisResult.errors || null
            : null,
          partial: !!analysisResult.partial,
          savedFallback: !(
            analysisResult.data && Object.keys(analysisResult.data).length > 0
          ),
          timestamp: new Date(),
        });
        await doc.save();
        console.log(
          "Analysis record saved (partial:",
          !!analysisResult.partial,
          ")"
        );
      } catch (saveErr) {
        console.warn(
          "Failed to persist analysis record:",
          saveErr && saveErr.message ? saveErr.message : saveErr
        );
      }

      // Build synthesized fields (problemText & solutions) so frontend has data even if parsed was partial
      const parsedFragment =
        analysisResult.data && typeof analysisResult.data === "object"
          ? analysisResult.data
          : null;
      const synthesizedSolutions = synthesizeSolutions(
        transcription.text,
        parsedFragment,
        analysisResult.raw || ""
      );
      const normalized = {
        ...(parsedFragment || {}),
        problemText: transcription.text,
        businessType: (parsedFragment && parsedFragment.businessType) || null,
        solutions: normalizeSolutions({ solutions: synthesizedSolutions }),
        partial: !!analysisResult.partial,
        raw: analysisResult.raw || null,
      };

      return res.json({
        success: true,
        transcription: transcription.text,
        analysis: normalized,
        partial: !!analysisResult.partial,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("❌ Analysis error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /* ---------------------------
     Convert Hindi script to English
     --------------------------- */
  convertHindiToEnglish(text) {
    if (!text) return text;

    const hindiToEnglishMap = {
      ही: "Hi",
      माय: "my",
      नेम: "name",
      इस: "is",
      राजू: "Raju",
      ए: "a",
      सेल: "sell",
      पार्ट्स: "parts",
      का: "of",
      इलेवन: "eleven",
      आई: "I",
      एम: "am",
      फ्रॉम: "from",
      बैंगलोर: "Bangalore",
      वांट: "want",
      टू: "to",
      ग्रो: "grow",
      ऑनलाइन: "online",
      प्रिजंस: "pricing",
      हेल्प: "help",
      बिजनेस: "business",
      क्राफ्ट: "craft",
      हैंडमেড: "handmade",
      ट्रेडिशनल: "traditional",
      कस्टमर: "customer",
      प्रोडक्ट: "product",
      प्राइस: "price",
      मार्केट: "market",
      ऑर्डर: "order",
      शिपिंग: "shipping",
      पेमेंट: "payment",
    };

    let convertedText = text;
    for (const [hindi, english] of Object.entries(hindiToEnglishMap)) {
      const regex = new RegExp(hindi, "gi");
      convertedText = convertedText.replace(regex, english);
    }

    convertedText = convertedText.replace(/[\u0900-\u097F]/g, "");
    convertedText = convertedText.replace(/\s+/g, " ").trim();
    convertedText = convertedText.replace(/\s+([.!?])/g, "$1");
    convertedText = convertedText.replace(/([.!?])\s*([a-z])/g, "$1 $2");
    convertedText =
      convertedText.charAt(0).toUpperCase() + convertedText.slice(1);

    return convertedText;
  }

  /* ---------------------------
     Transcription using Google Speech-to-Text
     --------------------------- */
  async transcribeAudio(audioBuffer) {
    try {
      console.log("Starting audio transcription...");
      console.log("Audio buffer size:", audioBuffer.length, "bytes");

      const encodings = ["WEBM_OPUS", "MP3", "WAV"];
      let lastError = null;

      for (const encoding of encodings) {
        try {
          const request = {
            audio: { content: audioBuffer.toString("base64") },
            config: {
              encoding: encoding,
              sampleRateHertz: 48000,
              languageCode: "en-US",
              enableAutomaticPunctuation: true,
              model: "latest_short",
              speechContexts: [
                {
                  phrases: [
                    "business",
                    "craft",
                    "artisan",
                    "online",
                    "marketplace",
                    "customers",
                    "products",
                    "pricing",
                    "growth",
                    "help",
                    "traditional",
                    "handmade",
                    "sell",
                    "marketing",
                    "digital",
                    "my name is",
                    "I am from",
                    "I want to",
                    "help me",
                    "grow online",
                  ],
                  boost: 20.0,
                },
              ],
              enableWordTimeOffsets: false,
              enableWordConfidence: false,
            },
          };

          console.log(`Trying encoding: ${encoding}`);
          const [response] = await this.speechClient.recognize(request);

          const transcription = (response.results || [])
            .map(
              (r) =>
                (r.alternatives &&
                  r.alternatives[0] &&
                  r.alternatives[0].transcript) ||
                ""
            )
            .join(" ")
            .trim();

          if (transcription && transcription.length > 0) {
            console.log(`Success with encoding: ${encoding}`);
            let cleanTranscription = this.convertHindiToEnglish(transcription);
            console.log("Cleaned transcription result:", cleanTranscription);
            return { success: true, text: cleanTranscription };
          }
        } catch (err) {
          console.log(`Failed with encoding ${encoding}:`, err.message || err);
          lastError = err;
          continue;
        }
      }

      console.error("All encoding attempts failed");
      return {
        success: false,
        error: `Speech recognition failed. Last error: ${
          lastError?.message || "Unknown"
        }`,
      };
    } catch (err) {
      console.error("Speech-to-Text error:", err);
      return { success: false, error: err.message || String(err) };
    }
  }

  /* ---------------------------
     Analyze using Vertex AI (Gemini 2.5 Flash)
     --------------------------- */
  async analyzeBusinessWithVertexAI(transcript) {
    try {
      if (!this.vertexAI) {
        throw new Error("Vertex AI not configured");
      }

      const model = await this.getModel();
      console.log(
        "Using Vertex AI model:",
        process.env.VERTEX_MODEL || "gemini-2.5-flash"
      );
      console.log("Transcript for analysis:", transcript);

      const prompt = `
Analyze this business description and return ONLY a valid JSON object with no additional text, explanations, or formatting.

Required JSON format:
{
  "businessType": "string",
  "businessStage": "string", 
  "topProblems": [ { "problem": "string", "severity": "high|medium|low" } ],
  "topPlans": [ { "id": "string", "title": "string", "priority": "high|medium|low" } ],
  "solutions": [
    { "type": "whatsapp", "title": "string", "reason": "string" },
    { "type": "instagram", "title": "string", "reason": "string" },
    { "type": "website", "title": "string", "reason": "string" }
  ]
}

Business Description: ${transcript}

CRITICAL: Return ONLY the JSON object. No introductory text, no explanations, no markdown formatting.
`;

      const genConfig = {
        temperature: 0.0,
        maxOutputTokens: Number(process.env.MAX_OUTPUT_TOKENS) || 1024,
        responseMimeType: "application/json",
      };

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: genConfig,
      });

      // Extract raw text robustly
      let rawText = "";

      if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        rawText = result.response.candidates[0].content.parts[0].text;
      } else if (result?.response?.candidates?.[0]?.text) {
        rawText = result.response.candidates[0].text;
      } else if (typeof result?.response?.text === "function") {
        rawText = result.response.text();
      } else if (result?.response?.text) {
        rawText = result.response.text;
      } else if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        rawText = result.candidates[0].content.parts[0].text;
      } else {
        console.error(
          "No response text found from Vertex AI. Keys:",
          Object.keys(result || {})
        );
        if (result?.response)
          console.error("Response keys:", Object.keys(result.response));
        throw new Error("No response text from Vertex AI");
      }

      // Sanitize and repair
      const sanitized = sanitizeRawText(rawText);
      const repaired = aggressivelyRepairRawJson(sanitized);

      // Try parse + fallback
      let parsed = null;
      try {
        parsed = JSON.parse(repaired);
      } catch (e1) {
        // second attempt: further trimming & balancing
        let attempt = repaired.replace(/,\s*([}\]])/g, "$1");
        attempt = attempt.replace(/"[^"]*$/g, "");
        const openC = (attempt.match(/{/g) || []).length;
        const closeC = (attempt.match(/}/g) || []).length;
        if (openC > closeC) attempt += "}".repeat(openC - closeC);
        const openS = (attempt.match(/\[/g) || []).length;
        const closeS = (attempt.match(/]/g) || []).length;
        if (openS > closeS) attempt += "]".repeat(openS - closeS);

        try {
          parsed = JSON.parse(attempt);
        } catch (e2) {
          console.error("Final JSON repair failed. Raw output:", rawText);
          return {
            success: true,
            data: { partial: true, raw: rawText },
            raw: rawText,
            partial: true,
          };
        }
      }

      // Validate using compact schema
      if (this.validateCompact(parsed)) {
        return { success: true, data: parsed, raw: rawText };
      }

      // Try filling missing fields and validate again
      const filled = fillMissingWithTemplate(parsed, COMPACT_TEMPLATE);
      if (this.validateCompact(filled)) {
        return { success: true, data: filled, raw: rawText };
      }

      // Last resort: return partial with parsed and AJV errors
      return {
        success: true,
        data: { partial: true, parsed, errors: this.validateCompact.errors },
        raw: rawText,
        partial: true,
      };
    } catch (err) {
      console.error("Vertex AI analysis error:", err);
      return { success: false, error: err.message || String(err) };
    }
  }
} // end class

module.exports = new AIBusinessAnalyzer();
