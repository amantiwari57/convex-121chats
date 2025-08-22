"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { HeroSection } from "@/components/ui/hero-section";
import { HowItWorks } from "@/components/ui/how-it-works";
import { CTA } from "@/components/ui/cta";

export default function LandingPage() {
  const { user, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Built for Modern Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every feature designed with productivity and professionalism in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Real-time Messaging"
              description="Instant message delivery with live typing indicators and seamless synchronization across all devices."
              icon="⚡"
            />
            <FeatureCard
              title="Read Receipts"
              description="Know exactly when your messages are read with professional delivery confirmations and status indicators."
              icon="✓"
            />
            <FeatureCard
              title="Professional Design"
              description="Clean, minimal interface that keeps your team focused on what matters most - communication."
              icon="🎨"
            />
            <FeatureCard
              title="Secure Authentication"
              description="Enterprise-grade security with Clerk authentication ensuring your conversations stay private."
              icon="🔒"
            />
            <FeatureCard
              title="Team Invitations"
              description="Easily invite team members and manage group conversations with simple invitation system."
              icon="👥"
            />
            <FeatureCard
              title="Cross-Platform"
              description="Access your conversations from any device with responsive design that works everywhere."
              icon="📱"
            />
            <FeatureCard
              title="Perplexico AI"
              description="AI-powered research assistant that searches the web and provides comprehensive answers with reliable sources."
              icon="🤖"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* CTA Section */}
      <CTA />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">ChatApp</div>
            <p className="text-gray-400 mb-6">Professional communication made simple</p>
            <div className="flex justify-center space-x-8 text-sm">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Support</a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
              © 2024 ChatApp. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white border border-gray-200 p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-6">{icon}</div>
      <h3 className="text-xl font-semibold text-black mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
