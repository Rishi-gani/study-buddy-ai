import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuestionFormProps {
  onExplanationGenerated: (sections: {
    explanation: string;
    steps: string;
    example: string;
    summary: string;
  }) => void;
}

const QuestionForm = ({ onExplanationGenerated }: QuestionFormProps) => {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("general");
  const [detailLevel, setDetailLevel] = useState("detailed");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke(
        "explain-question",
        {
          body: {
            question: question.trim(),
            subject,
            detailLevel,
          },
        }
      );

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      onExplanationGenerated(data);
      toast.success("Explanation generated!");
    } catch (error) {
      console.error("Error generating explanation:", error);
      toast.error("Failed to generate explanation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    setQuestion("Explain the formula for the area of a circle and show a solved example.");
  };

  const handleClear = () => {
    setQuestion("");
  };

  return (
    <Card className="p-6 shadow-card">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-learning-blue-light border border-learning-blue/20 rounded-lg p-3">
          <p className="text-sm text-learning-muted">
            <span className="font-medium">Try example:</span> "Explain the formula for area of a circle and show one solved example."
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject (optional)</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger id="subject">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General / Any</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="biology">Biology</SelectItem>
              <SelectItem value="computer-science">Computer Science</SelectItem>
              <SelectItem value="english">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question">Your question</Label>
          <Textarea
            id="question"
            placeholder="Type a question like: 'Explain Newton's second law with example'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[140px] resize-none"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="detail-level">Detail level</Label>
            <Select value={detailLevel} onValueChange={setDetailLevel}>
              <SelectTrigger id="detail-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="detailed">Detailed (steps + example)</SelectItem>
                <SelectItem value="very-detailed">Very detailed (teacher-level)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Explain
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={handleClear} size="sm">
            Clear
          </Button>
          <Button type="button" variant="outline" onClick={handleDemo} size="sm">
            Run Demo
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default QuestionForm;
