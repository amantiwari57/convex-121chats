"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function LandingPage() {
  const { user, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">ChatApp</div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-gray-300 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-gray-300 transition-colors">How It Works</a>
              {!isLoaded ? (
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : user ? (
                <Link 
                  href="/chat"
                  className="bg-white text-black hover:bg-gray-100 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Go to Chat
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/auth/signin"
                    className="hover:text-gray-300 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="bg-white text-black hover:bg-gray-100 px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
            Professional
            <br />
            <span className="text-gray-600">Communication</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Experience seamless real-time messaging with read receipts, professional design, 
            and secure conversations for modern teams.
          </p>
          
          {!isLoaded ? (
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          ) : user ? (
            <div className="space-y-6">
              <p className="text-lg text-gray-600">Welcome back, {user.fullName || user.emailAddresses[0]?.emailAddress}!</p>
              <Link 
                href="/chat"
                className="bg-black hover:bg-gray-800 text-white font-semibold py-4 px-12 rounded-xl transition-colors inline-block text-lg"
              >
                Continue to Chat
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/signup"
                className="bg-black hover:bg-gray-800 text-white font-semibold py-4 px-12 rounded-xl transition-colors text-lg"
              >
                Start Free Trial
              </Link>
              <Link 
                href="/auth/signin"
                className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold py-4 px-12 rounded-xl transition-colors text-lg"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

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
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple onboarding process gets your team chatting in no time
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Create Account"
              description="Sign up with your email address and verify your account securely"
            />
            <StepCard
              number="2"
              title="Start Conversation"
              description="Create your first chat room or join an existing conversation"
            />
            <StepCard
              number="3"
              title="Invite Your Team"
              description="Send invitations to team members and build your communication network"
            />
            <StepCard
              number="4"
              title="Chat Professionally"
              description="Enjoy seamless messaging with read receipts and professional features"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Communication?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of teams who have upgraded to professional messaging
          </p>
          
          {!isLoaded ? (
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          ) : user ? (
            <Link 
              href="/chat"
              className="bg-white text-black hover:bg-gray-100 font-semibold py-4 px-12 rounded-xl transition-colors inline-block text-lg"
            >
              Continue to Chat
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/signup"
                className="bg-white text-black hover:bg-gray-100 font-semibold py-4 px-12 rounded-xl transition-colors text-lg"
              >
                Start Free Trial
              </Link>
              <Link 
                href="/auth/signin"
                className="border-2 border-white text-white hover:bg-white hover:text-black font-semibold py-4 px-12 rounded-xl transition-colors text-lg"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

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

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-black mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
