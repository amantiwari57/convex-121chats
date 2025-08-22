"use client"

import { motion } from "framer-motion"
import { UserPlus, MessageSquare, Users, Sparkles } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up with your email address and verify your account securely",
    step: "1",
  },
  {
    icon: MessageSquare,
    title: "Start Conversation",
    description: "Create your first chat room or join an existing conversation",
    step: "2",
  },
  {
    icon: Users,
    title: "Invite Your Team",
    description: "Send invitations to team members and build your communication network",
    step: "3",
  },
  {
    icon: Sparkles,
    title: "Chat Professionally",
    description: "Enjoy seamless messaging with read receipts and professional features",
    step: "4",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Get Started in <span className="font-mono text-blue-600">Minutes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple onboarding process gets your team chatting in no time
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-card border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
