import { useState } from "react";
import { GraduationCap } from "lucide-react";
import QuestionForm from "@/components/QuestionForm";
import ExplanationDisplay from "@/components/ExplanationDisplay";

const Index = () => {
  const [explanation, setExplanation] = useState<{
    explanation: string;
    steps: string;
    example: string;
    summary: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-card rounded-xl shadow-card p-4 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Student Tutor — Ask & Learn</h1>
              <p className="text-sm text-muted-foreground">
                Type any question and get a clear step-by-step explanation
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-4">
            <QuestionForm onExplanationGenerated={setExplanation} />
            
            {/* Info Card */}
            <div className="bg-card rounded-lg shadow-card p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Powered by Lovable Cloud</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>AI-powered explanations using advanced language models</li>
                <li>Structured learning with clear sections</li>
                <li>Supports multiple subjects and detail levels</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Output */}
          <div>
            <ExplanationDisplay sections={explanation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
