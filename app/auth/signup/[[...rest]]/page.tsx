'use client';

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">ChatApp</h1>
          <h2 className="text-3xl font-bold text-black">
            Get started today
          </h2>
          <p className="mt-2 text-gray-600">
            Create your account and start professional messaging
          </p>
        </div>
        <SignUp 
          routing="path"
          path="/auth/signup"
          appearance={{
            elements: {
              formButtonPrimary: "bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors",
              card: "shadow-xl border border-gray-200 rounded-xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtons: "flex flex-col gap-3",
              socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50 text-black rounded-lg py-3 px-4 font-medium transition-colors",
              formFieldInput: "border border-gray-300 rounded-lg px-4 py-3 focus:border-black focus:ring-1 focus:ring-black",
              footerActionLink: "text-black hover:text-gray-700 font-medium",
            }
          }}
        />
      </div>
    </div>
  );
} 