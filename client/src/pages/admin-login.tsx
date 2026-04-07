import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/login", { username, password });
      const data = await res.json();
      toast({ title: "Welcome back!", description: `Logged in as ${data.username}` });
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: "Invalid username or password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-xs gap-1.5 text-muted-foreground" data-testid="link-back-home">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalogue
          </Button>
        </Link>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg" data-testid="text-login-title">Admin Login</CardTitle>
            <CardDescription className="text-xs">Maruti Oils & Grease — Inventory Management</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="h-9 text-sm"
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="h-9 text-sm"
                  data-testid="input-password"
                />
              </div>
              <Button type="submit" className="w-full h-9 text-sm" disabled={loading} data-testid="button-login">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Default Credentials</p>
              <p>Username: <code className="bg-background px-1 py-0.5 rounded text-primary font-mono">admin</code></p>
              <p>Password: <code className="bg-background px-1 py-0.5 rounded text-primary font-mono">admin123</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
