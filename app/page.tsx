"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function LandingPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Welcome to ChatApp</h1>
          <p className="text-xl text-gray-300 mb-8">
            A modern chat application with real-time messaging and smart collaboration features
          </p>
          
          {status === "loading" ? (
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          ) : session ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-300">Welcome back, {session.user?.name || session.user?.email}!</p>
              <Link 
                href="/chat"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors inline-block"
              >
                Go to Chat
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Link 
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors inline-block mr-4"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full transition-colors inline-block"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            title="Real-time Chat"
            description="Experience instant messaging with real-time updates and message delivery confirmation."
            icon="💬"
          />
          <FeatureCard
            title="Invite System"
            description="Easily invite friends and colleagues to your chat rooms with our simple invitation system."
            icon="✉️"
          />
          <FeatureCard
            title="Secure"
            description="Secure authentication and private conversations to keep your data safe."
            icon="🔒"
          />
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StepCard
              number="1"
              title="Sign Up"
              description="Create your account using your email"
            />
            <StepCard
              number="2"
              title="Create a Chat"
              description="Start a new conversation or create a group chat"
            />
            <StepCard
              number="3"
              title="Invite Others"
              description="Invite friends using their email or username"
            />
            <StepCard
              number="4"
              title="Start Chatting"
              description="Begin your conversation in real-time"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg text-center">
      <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
