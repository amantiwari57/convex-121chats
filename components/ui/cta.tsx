"use client"

import { MoveRight, PhoneCall } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

export function CTA() {
  const { user, isLoaded } = useUser()

  return (
    <div className="w-full py-20 lg:py-40 bg-white">
      <div className="container mx-auto">
        <div className="flex flex-col text-center bg-gray-50 rounded-2xl p-4 lg:p-14 gap-8 items-center border border-gray-200">
          <div>
            <Badge variant="outline" className="bg-white text-gray-900 border-gray-300">
              Get started
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-gray-900">
              Ready to Transform Your Communication?
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-gray-600 max-w-xl">
              Join thousands of teams who have upgraded to professional messaging. 
              Experience seamless real-time communication with AI assistance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {!isLoaded ? (
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
            ) : user ? (
              <Button asChild className="gap-4 bg-gray-900 text-white hover:bg-gray-800">
                <Link href="/chat">
                  Continue to Chat <MoveRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="gap-4 border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Link href="/auth/signin">
                    Sign In <PhoneCall className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild className="gap-4 bg-gray-900 text-white hover:bg-gray-800">
                  <Link href="/auth/signup">
                    Sign up here <MoveRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
