import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, subject, detailLevel } = await req.json();
    
    console.log("Processing question:", { question, subject, detailLevel });

    if (!question || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = buildSystemPrompt(subject, detailLevel);
    const userPrompt = buildUserPrompt(question);

    console.log("Calling Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add more credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate explanation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response received, parsing sections...");
    
    const sections = parseSections(content);

    return new Response(
      JSON.stringify(sections),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in explain-question function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildSystemPrompt(subject: string, detailLevel: string): string {
  const subjectContext = subject && subject !== "general" 
    ? `You are teaching ${subject}.` 
    : "You are teaching across various subjects.";
  
  let detailContext = "";
  if (detailLevel === "concise") {
    detailContext = "Keep your explanation brief and to the point.";
  } else if (detailLevel === "detailed") {
    detailContext = "Provide a detailed explanation with clear steps and examples.";
  } else if (detailLevel === "very-detailed") {
    detailContext = "Provide a comprehensive, teacher-level explanation with multiple examples and detailed reasoning.";
  }

  return `You are a friendly, knowledgeable teacher helping students understand concepts clearly. ${subjectContext} ${detailContext}

Your response MUST be structured in exactly four sections with these exact headers:

**EXPLANATION:**
(Provide a clear conceptual explanation of the topic)

**STEPS:**
(Break down the solution into numbered steps)

**EXAMPLE:**
(Show at least one fully solved example with calculations)

**SUMMARY:**
(Provide a 2-3 sentence recap of the key points)

Use simple, student-friendly language. Make it engaging and easy to understand.`;
}

function buildUserPrompt(question: string): string {
  return `Please explain this question: ${question}`;
}

function parseSections(content: string): {
  explanation: string;
  steps: string;
  example: string;
  summary: string;
} {
  const sections = {
    explanation: "",
    steps: "",
    example: "",
    summary: "",
  };

  try {
    // Split by markdown headers
    const explanationMatch = content.match(/\*\*EXPLANATION:\*\*([\s\S]*?)(?=\*\*STEPS:|$)/i);
    const stepsMatch = content.match(/\*\*STEPS:\*\*([\s\S]*?)(?=\*\*EXAMPLE:|$)/i);
    const exampleMatch = content.match(/\*\*EXAMPLE:\*\*([\s\S]*?)(?=\*\*SUMMARY:|$)/i);
    const summaryMatch = content.match(/\*\*SUMMARY:\*\*([\s\S]*?)$/i);

    sections.explanation = explanationMatch?.[1]?.trim() || "";
    sections.steps = stepsMatch?.[1]?.trim() || "";
    sections.example = exampleMatch?.[1]?.trim() || "";
    sections.summary = summaryMatch?.[1]?.trim() || "";

    // Fallback: if sections are empty, try alternative parsing
    if (!sections.explanation && !sections.steps) {
      sections.explanation = content;
    }
  } catch (error) {
    console.error("Error parsing sections:", error);
    sections.explanation = content;
  }

  return sections;
}
