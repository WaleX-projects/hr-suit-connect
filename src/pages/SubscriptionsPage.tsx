import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { toast } from "sonner";

// ================= PLAN DATA =================
const plans = [
  {
    name: "Starter",
    price: "₦10,000",
    description: "For small teams",
    features: [
      "Up to 5 employees",
      "Basic payroll",
      "Attendance tracking",
      "Payslips",
    ],
  },
  {
    name: "Growth",
    price: "₦25,000",
    description: "Best for growing companies",
    popular: true,
    features: [
      "Up to 25 employees",
      "Tax calculation",
      "Payslip PDF",
      "Reports & export",
      "Leave + attendance",
    ],
  },
  {
    name: "Business",
    price: "₦60,000",
    description: "For serious businesses",
    features: [
      "Up to 100 employees",
      "Advanced payroll",
      "Role permissions",
      "Audit logs",
      "Priority support",
    ],
  },
];

// ================= COMPONENT =================
export default function SubscriptionsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    setLoading(planName);

    try {
      // 🔥 CONNECT TO YOUR BACKEND HERE
      // await subscriptionApi.subscribe(planName);

      toast.success(`Subscribed to ${planName}`);
    } catch {
      toast.error("Failed to subscribe");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted/40">
      
      {/* HEADER */}
      <div className="text-center mb-10 max-w-xl">
        <h1 className="text-3xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground mt-2">
          Choose a plan that fits your business. No hidden fees.
        </p>
      </div>

      {/* PLANS */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative border transition-all duration-300 hover:shadow-xl ${
              plan.popular ? "border-primary scale-105" : ""
            }`}
          >
            {/* POPULAR BADGE */}
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-xl">
                Most Popular
              </div>
            )}

            <CardContent className="p-6 flex flex-col h-full">
              
              {/* TITLE */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* PRICE */}
              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">
                  {" "} / month
                </span>
              </div>

              {/* FEATURES */}
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* BUTTON */}
              <Button
                onClick={() => handleSubscribe(plan.name)}
                disabled={loading === plan.name}
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                {loading === plan.name ? "Processing..." : "Get Started"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FOOTER */}
      <p className="text-xs text-muted-foreground mt-8">
        No contracts. Cancel anytime.
      </p>
    </div>
  );
}