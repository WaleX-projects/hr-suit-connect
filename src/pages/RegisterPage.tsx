import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/lib/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    // Company Data
    company_name: "",
    company_address: "",
    country: "",
    timezone: "UTC", // Default value as backend requires it
  });

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleNext = () => {
    if (!form.first_name || !form.last_name || !form.email || !form.phone || 
        !form.password || !form.confirm_password) {
      toast.error("Please fill in all personal information");
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.company_name || !form.company_address || !form.country) {
      toast.error("Please fill in all company details");
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        company_data: {
          name: form.company_name,
          address: form.company_address,
          country: form.country,
          timezone: form.timezone,
        },
      });

      toast.success("Registration successful! Please check your email to verify your account.");
      navigate("/login");
    } catch (err: any) {
      const errorMessage = 
        err?.response?.data?.detail ||
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.non_field_errors?.[0] ||
        "Registration failed. Please try again.";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4 py-12">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-md">
            <Briefcase className="h-8 w-8" />
          </div>
          
          <div>
            <CardTitle className="text-3xl font-semibold tracking-tight">Create your account</CardTitle>
            <CardDescription className="text-base mt-2">
              Step {step} of 2 — {step === 1 ? "Personal Information" : "Company Information"}
            </CardDescription>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <div className={`h-1.5 w-24 rounded-full transition-all ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1.5 w-24 rounded-full transition-all ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              // Step 1: Personal Info
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={form.first_name}
                      onChange={updateField("first_name")}
                      required
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={form.last_name}
                      onChange={updateField("last_name")}
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    required
                    placeholder="john@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={updateField("phone")}
                    required
                    placeholder="+234 801 234 5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={updateField("password")}
                      required
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirm_password}
                      onChange={updateField("confirm_password")}
                      required
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button type="button" onClick={handleNext} className="w-full h-12 text-base">
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : (
              // Step 2: Company Info
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={form.company_name}
                    onChange={updateField("company_name")}
                    required
                    placeholder="Acme Corporation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_address">Company Address</Label>
                  <Input
                    id="company_address"
                    value={form.company_address}
                    onChange={updateField("company_address")}
                    required
                    placeholder="123 Business Street, Lagos"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={updateField("country")}
                      required
                      placeholder="Nigeria"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={form.timezone}
                      onChange={updateField("timezone")}
                      required
                      placeholder="UTC"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 text-base" 
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}