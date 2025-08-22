"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, Menu, X, MessageSquare, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedGroup } from "@/components/ui/animated-group"
import { cn } from "@/lib/utils"
import type { Variants } from "motion/react"
import { useUser } from "@clerk/nextjs"

const transitionVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(12px)",
    y: 12,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.3,
      duration: 1.5,
    },
  },
}

export function HeroSection() {
  const { user, isLoaded } = useUser()

  return (
    <>
      <HeroHeader />
      <main className="relative min-h-screen overflow-hidden bg-white">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 z-2 opacity-10">
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              animation: "gridMove 25s linear infinite",
            }}
          />
        </div>

        {/* Animation keyframes */}
        <style jsx>{`
          @keyframes gridMove {
            0% { 
              transform: translate(0, 0);
            }
            100% { 
              transform: translate(50px, 50px);
            }
          }
        `}</style>

        {/* Hero Content */}
        <section className="relative z-10 pt-24 md:pt-36">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <AnimatedGroup variants={{ item: transitionVariants }}>
                <Link
                  href="#features"
                  className="hover:bg-gray-100 bg-gray-50 backdrop-blur-sm group mx-auto flex w-fit items-center gap-4 rounded-full border border-gray-200 p-1 pl-4 shadow-lg transition-all duration-300"
                >
                  <span className="text-gray-700 text-sm">✨ Introducing AI-Powered Messaging</span>
                  <span className="block h-4 w-0.5 border-l bg-gray-300"></span>
                  <div className="bg-gray-100 group-hover:bg-gray-200 backdrop-blur-sm size-6 overflow-hidden rounded-full duration-500">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3 text-gray-600" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3 text-gray-600" />
                      </span>
                    </div>
                  </div>
                </Link>

                <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-bold text-gray-900 leading-tight">
                  Professional <span className="font-serif italic text-purple-600">Messaging</span> Redefined
                </h1>

                <p className="mx-auto mt-8 max-w-2xl text-balance text-xl text-gray-600 leading-relaxed">
                  Experience seamless communication with real-time messaging, AI assistance, and enterprise-grade
                  security. Built for teams that demand excellence.
                </p>
              </AnimatedGroup>

              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.8,
                      },
                    },
                  },
                  item: transitionVariants,
                }}
                className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row"
              >
                {!isLoaded ? (
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
                ) : user ? (
                  <div className="bg-gray-100 backdrop-blur-sm rounded-2xl border border-gray-200 p-0.5">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-xl px-8 py-3 text-base bg-gray-900 text-white hover:bg-gray-800 font-semibold"
                    >
                      <Link href="/chat">
                        <MessageSquare className="mr-2 size-5" />
                        Continue to Chat
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-100 backdrop-blur-sm rounded-2xl border border-gray-200 p-0.5">
                      <Button
                        asChild
                        size="lg"
                        className="rounded-xl px-8 py-3 text-base bg-gray-900 text-white hover:bg-gray-800 font-semibold"
                      >
                        <Link href="/auth/signup">
                          <MessageSquare className="mr-2 size-5" />
                          Start Messaging
                        </Link>
                      </Button>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-xl px-8 py-3 text-gray-700 hover:bg-gray-100 font-semibold border-gray-300"
                    >
                      <Link href="/auth/signin">
                        <Zap className="mr-2 size-5" />
                        Sign In
                      </Link>
                    </Button>
                  </>
                )}
              </AnimatedGroup>

              {/* Feature Highlights */}
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.15,
                        delayChildren: 1.2,
                      },
                    },
                  },
                  item: transitionVariants,
                }}
                className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
              >
                <div className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
                  <MessageSquare className="mx-auto mb-4 size-8 text-purple-600" />
                  <h3 className="text-gray-900 font-semibold mb-2">Real-time Sync</h3>
                  <p className="text-gray-600 text-sm">Instant message delivery across all devices</p>
                </div>
                <div className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
                  <Zap className="mx-auto mb-4 size-8 text-purple-600" />
                  <h3 className="text-gray-900 font-semibold mb-2">AI Assistant</h3>
                  <p className="text-gray-600 text-sm">Smart suggestions and automated responses</p>
                </div>
                <div className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
                  <Shield className="mx-auto mb-4 size-8 text-purple-600" />
                  <h3 className="text-gray-900 font-semibold mb-2">Enterprise Security</h3>
                  <p className="text-gray-600 text-sm">End-to-end encryption and compliance</p>
                </div>
              </AnimatedGroup>
            </div>
          </div>

          {/* App Preview */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    delayChildren: 1.5,
                  },
                },
              },
              item: transitionVariants,
            }}
          >
            <div className="relative mt-20 overflow-hidden px-2 sm:mt-24">
              <div
                aria-hidden
                className="bg-gradient-to-b to-white/90 absolute inset-0 z-10 from-transparent from-40%"
              />
              <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-white/40 backdrop-blur-sm p-4 shadow-2xl ring-1 ring-gray-100">
                <img
                  className="aspect-[16/10] relative rounded-2xl w-full"
                  src="/dark-theme-chat-ui.png"
                  alt="ChatPro messaging interface"
                  width="2700"
                  height="1440"
                />
              </div>
            </div>
          </AnimatedGroup>
        </section>

        {/* Customer Logos Section */}
        <section className="relative z-10 pt-24 pb-16">
          <div className="group relative m-auto max-w-5xl px-6">
            <div className="text-center mb-12">
              <p className="text-gray-500 text-sm uppercase tracking-wider">Trusted by industry leaders</p>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-4 gap-x-12 gap-y-8 opacity-60 hover:opacity-80 transition-opacity duration-500 sm:gap-x-16 sm:gap-y-14">
              <div className="flex">
                <img
                  className="mx-auto h-5 w-fit opacity-70"
                  src="https://html.tailus.io/blocks/customers/nvidia.svg"
                  alt="Nvidia Logo"
                  height="20"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-4 w-fit opacity-70"
                  src="https://html.tailus.io/blocks/customers/github.svg"
                  alt="GitHub Logo"
                  height="16"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-5 w-fit opacity-70"
                  src="https://html.tailus.io/blocks/customers/nike.svg"
                  alt="Nike Logo"
                  height="20"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-6 w-fit opacity-70"
                  src="https://html.tailus.io/blocks/customers/openai.svg"
                  alt="OpenAI Logo"
                  height="24"
                  width="auto"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
]

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { user, isLoaded } = useUser()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header>
      <nav data-state={menuState && "active"} className="fixed z-20 w-full px-2 group">
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled && "bg-white/90 max-w-4xl rounded-2xl border border-gray-200 backdrop-blur-lg lg:px-5 shadow-lg",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <Logo />
                <span className="text-gray-900 font-bold text-xl">ChatApp</span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200 text-gray-900" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 text-gray-900" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link href={item.href} className="text-gray-700 hover:text-purple-600 block duration-150">
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/95 backdrop-blur-sm group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-200 p-6 shadow-2xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="text-gray-700 hover:text-purple-600 block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {!isLoaded ? (
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
                ) : user ? (
                  <Button
                    asChild
                    size="sm"
                    className={cn("bg-purple-600 hover:bg-purple-700", isScrolled ? "lg:inline-flex" : "hidden")}
                  >
                    <Link href="/chat">
                      <span>Go to Chat</span>
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className={cn("border-gray-300 text-gray-700 hover:bg-gray-100", isScrolled && "lg:hidden")}
                    >
                      <Link href="/auth/signin">
                        <span>Login</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn("bg-purple-600 hover:bg-purple-700", isScrolled && "lg:hidden")}
                    >
                      <Link href="/auth/signup">
                        <span>Sign Up</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn("bg-purple-600 hover:bg-purple-700", isScrolled ? "lg:inline-flex" : "hidden")}
                    >
                      <Link href="/auth/signup">
                        <span>Get Started</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

const Logo = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg",
        className,
      )}
    >
      <MessageSquare className="w-5 h-5 text-white" />
    </div>
  )
}
