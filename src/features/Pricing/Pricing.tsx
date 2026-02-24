"use client";

import Button from "@/components/Button";

type Plan = {
  name: string;
  priceLabel: string;
  priceMonthly: number;
  description: string;
  features: string[];
  limits: {
    searchesPerDay: number;
    storesPerSearch: number;
    maxStoresUserCanAdd: number;
    contactFields: string[];
  };
  cta: string;
  recommended?: boolean;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    priceLabel: "Free",
    priceMonthly: 0,
    description: "Perfect for casual users",
    features: [
      "4 searches per day",
      "Up to 20 results per search",
      "1 store listing",
      "Basic contact info (phone only)",
      "Search history (7 days)",
    ],
    limits: {
      searchesPerDay: 4,
      storesPerSearch: 20,
      maxStoresUserCanAdd: 1,
      contactFields: ["phone"],
    },
    cta: "Start Free",
  },
  {
    name: "Pro",
    priceLabel: "$10",
    priceMonthly: 10,
    description: "For active users and small businesses",
    features: [
      "20 searches per day",
      "Up to 200 results per search",
      "5 store listings",
      "Enhanced contact info (phone + email)",
      "Interactive map of search results",
      "Extended search history (30 days)",
      "Advanced search filters",
    ],
    limits: {
      searchesPerDay: 20,
      storesPerSearch: 50,
      maxStoresUserCanAdd: 5,
      contactFields: ["phone", "email"],
    },
    cta: "Upgrade to Pro",
    recommended: true,
    popular: true,
  },
  {
    name: "Business",
    priceLabel: "$18",
    priceMonthly: 18,
    description: "For businesses and power users",
    features: [
      "200 searches per day",
      "Up to 500 results per search",
      "10 store listings",
      "Complete contact info (phone, email, website)",
      "Interactive map of search results",
      "Unlimited search history",
      "Priority support",
      "Advanced search filters",
      "Export search results",
      "Advanced analytics",
      "Custom branding",
    ],
    limits: {
      searchesPerDay: 200,
      storesPerSearch: 500,
      maxStoresUserCanAdd: 10,
      contactFields: ["phone", "email", "website"],
    },
    cta: "Go Business",
  },
];

export default function Pricing() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
        <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
          Start free and upgrade as you grow. All plans include our core store search functionality.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={`relative rounded-xl border p-8 ${
              plan.popular
                ? "border-blue-500 shadow-xl ring-2 ring-blue-500/20 scale-105"
                : "border-black/10 dark:border-white/15 shadow-lg"
            }`}
            aria-label={`${plan.name} plan`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-sm text-black/60 dark:text-white/60 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.priceLabel}</span>
                {plan.priceMonthly > 0 && <span className="text-lg text-black/60 dark:text-white/60">/month</span>}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : plan.priceMonthly === 0 
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black/10 dark:border-white/15 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="border border-black/10 dark:border-white/15 p-4 text-left">Features</th>
                <th className="border border-black/10 dark:border-white/15 p-4 text-center">Starter</th>
                <th className="border border-black/10 dark:border-white/15 p-4 text-center bg-blue-50 dark:bg-blue-900/20">Pro</th>
                <th className="border border-black/10 dark:border-white/15 p-4 text-center">Business</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black/10 dark:border-white/15 p-4 font-medium">Daily Searches</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center">4</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center bg-blue-50 dark:bg-blue-900/20">20</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center">200</td>
              </tr>
              <tr>
                <td className="border border-black/10 dark:border-white/15 p-4 font-medium">Results per Search</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center">20</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center bg-blue-50 dark:bg-blue-900/20">50</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center">500</td>
              </tr>
              <tr>
                <td className="border border-black/10 dark:border-white/15 p-4 font-medium">Store Listings</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center">1</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center bg-blue-50 dark:bg-blue-900/20">5</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center">10</td>
              </tr>
              <tr>
                <td className="border border-black/10 dark:border-white/15 p-4 font-medium">Contact Fields</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center">Phone only</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center bg-blue-50 dark:bg-blue-900/20">Phone + Email</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center">All fields</td>
              </tr>
              <tr>
                <td className="border border-black/10 dark:border-white/15 p-4 font-medium">Support</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center">Basic</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center bg-blue-50 dark:bg-blue-900/20">Priority</td>
                <td className="border border-black/10 dark:border-white/15 p-4 text-center">Priority</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="border-b border-black/10 dark:border-white/15 pb-4">
            <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
            <p className="text-sm text-black/70 dark:text-white/70">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div className="border-b border-black/10 dark:border-white/15 pb-4">
            <h3 className="font-semibold mb-2">What happens if I exceed my limits?</h3>
            <p className="text-sm text-black/70 dark:text-white/70">You&apos;ll receive notifications when approaching limits. Consider upgrading for higher limits.</p>
          </div>
          <div className="border-b border-black/10 dark:border-white/15 pb-4">
            <h3 className="font-semibold mb-2">Is there a free trial for paid plans?</h3>
            <p className="text-sm text-black/70 dark:text-white/70">Start with our free plan to test all features. No credit card required for the free tier.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">When will payment integration be available?</h3>
            <p className="text-sm text-black/70 dark:text-white/70">Payment processing and plan enforcement will be added in the next development phase.</p>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-black/60 dark:text-white/60">
        <p>
          All plans include access to our store search API and community features.
          <br />
          <strong>Note:</strong> Payment integration and plan enforcement coming soon.
        </p>
      </footer>
    </section>
  );
}


