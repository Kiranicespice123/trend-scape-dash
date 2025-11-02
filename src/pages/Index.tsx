import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="mb-4 text-4xl font-bold">TrendScape Dashboard</h1>
        <p className="text-xl text-muted-foreground">Journey Page Analytics Platform</p>
        <Button onClick={() => navigate("/analytics")} size="lg" className="gap-2">
          <BarChart3 className="h-5 w-5" />
          View Analytics Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Index;
