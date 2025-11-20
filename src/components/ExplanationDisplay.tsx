import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, BookOpen, ListOrdered, Lightbulb, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ExplanationDisplayProps {
  sections: {
    explanation: string;
    steps: string;
    example: string;
    summary: string;
  } | null;
}

const ExplanationDisplay = ({ sections }: ExplanationDisplayProps) => {
  const handleCopy = () => {
    if (!sections) return;
    
    const text = `EXPLANATION:\n${sections.explanation}\n\nSTEPS:\n${sections.steps}\n\nEXAMPLE:\n${sections.example}\n\nSUMMARY:\n${sections.summary}`;
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  const handleDownload = () => {
    if (!sections) return;
    
    const text = `EXPLANATION:\n${sections.explanation}\n\nSTEPS:\n${sections.steps}\n\nEXAMPLE:\n${sections.example}\n\nSUMMARY:\n${sections.summary}`;
    
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "explanation.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Answer</h2>
        {sections && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        )}
      </div>

      <div className="bg-gradient-subtle rounded-lg border border-border min-h-[300px] p-5">
        {!sections ? (
          <div className="text-muted-foreground text-sm">
            Answers will appear here. Click <strong>Explain</strong> to get a detailed explanation split into sections.
          </div>
        ) : (
          <div className="space-y-6">
            <Section
              icon={<BookOpen className="h-5 w-5 text-learning-blue" />}
              title="Clear Explanation"
              content={sections.explanation}
            />
            <Section
              icon={<ListOrdered className="h-5 w-5 text-learning-blue" />}
              title="Step-by-step Breakdown"
              content={sections.steps}
            />
            <Section
              icon={<Lightbulb className="h-5 w-5 text-learning-blue" />}
              title="Example"
              content={sections.example}
            />
            <Section
              icon={<CheckCircle2 className="h-5 w-5 text-learning-blue" />}
              title="Summary"
              content={sections.summary}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

const Section = ({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) => {
  if (!content) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-base">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground pl-7">
        {content}
      </div>
    </div>
  );
};

export default ExplanationDisplay;
