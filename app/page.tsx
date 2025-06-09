"use client"

import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  CreditCard,
  Facebook,
  FileText,
  Instagram,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Smartphone,
  Star,
  Twitter,
  Users,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible"
import { Input } from "../components/ui/input"
import { default as NextImage } from "next/image"
import { Textarea } from "../components/ui/textarea"
import { TypewriterEffect } from "../components/typewriter-effect"
import { MainNav } from "../components/main-nav"
import { ToolReplacement } from "../components/tool-replacement"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-light via-white to-lavender-light">
      {/* Navigation */}
      <MainNav />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-charcoal leading-tight">
                Therapy infrastructure to <span className="text-mint-dark">simplify your practice</span>
              </h1>
              {/* <p className="text-xl text-charcoal/70 leading-relaxed">
                SereneNow replaces WhatsApp chats, scattered emails, calendar chaos, and messy notes — with one private,
                organized platform.
              </p> */}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-mint-dark hover:bg-mint-dark/90 text-white px-8 py-4 text-lg"
                asChild
              >
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSc49XBBZDbeNVC7y_WdXhYjCxjaOwK66KOBH6Ty_4XrzWMYvQ/viewform?usp=dialog" target="_blank" rel="noopener noreferrer">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-mint-dark text-mint-dark hover:bg-mint-dark hover:text-white px-8 py-4 text-lg"
                asChild
              >
                <a href="https://www.youtube.com/watch?v=K1A7mS9CFXQ" target="_blank" rel="noopener noreferrer">
                  Watch Demo
                </a>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-mint/10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-charcoal">SereneNow Dashboard</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-coral rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-mint/10 p-4 rounded-lg">
                    <Users className="h-6 w-6 text-mint-dark mb-2" />
                    <p className="text-sm font-medium text-charcoal">24 Active Clients</p>
                  </div>
                  <div className="bg-coral/5 p-4 rounded-lg">
                    <Calendar className="h-6 w-6 text-coral mb-2" />
                    <p className="text-sm font-medium text-charcoal">8 Appointments Today</p>
                  </div>
                  <div className="bg-mint/10 p-4 rounded-lg">
                    <CreditCard className="h-6 w-6 text-mint-dark mb-2" />
                    <p className="text-sm font-medium text-charcoal">$2,400 This Month</p>
                  </div>
                  <div className="bg-coral/5 p-4 rounded-lg">
                    <Lock className="h-6 w-6 text-coral mb-2" />
                    <p className="text-sm font-medium text-charcoal">100% Secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typing Animation Section */}
      <section className="container mx-auto px-6 py-16 bg-gradient-to-r from-mint/20 via-white to-mint/20 rounded-3xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">What can I do with SereneNow?</h2>
          <div className="h-24 text-xl md:text-2xl">
            <TypewriterEffect />
          </div>
        </div>
      </section>

      {/* Before vs After Comparison */}
      <ToolReplacement />

      {/* Feature Highlights */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal mb-4">Built for modern therapists</h2>
          <p className="text-xl text-charcoal/70">Everything you need to run a successful practice</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-6 border-mint/10 hover:border-mint-dark/30 transition-colors">
            <CardContent className="p-0 space-y-4">
              <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-mint-dark" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal">Organize Client Data</h3>
              <p className="text-charcoal/70">Keep all client information, notes, and progress in one secure place.</p>
            </CardContent>
          </Card>

          <Card className="p-6 border-coral/10 hover:border-coral/30 transition-colors">
            <CardContent className="p-0 space-y-4">
              <div className="w-12 h-12 bg-coral/10 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-coral" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal">Streamline Payments</h3>
              <p className="text-charcoal/70">Accept payments securely with automated invoicing and receipts.</p>
            </CardContent>
          </Card>

          <Card className="p-6 border-mint/10 hover:border-mint-dark/30 transition-colors">
            <CardContent className="p-0 space-y-4">
              <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-mint-dark" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal">Manage Appointments</h3>
              <p className="text-charcoal/70">Smart scheduling with automated reminders and easy rescheduling.</p>
            </CardContent>
          </Card>

          <Card className="p-6 border-coral/10 hover:border-coral/30 transition-colors">
            <CardContent className="p-0 space-y-4">
              <div className="w-12 h-12 bg-coral/10 rounded-lg flex items-center justify-center">
                <Lock className="h-6 w-6 text-coral" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal">Built-In Privacy & Security</h3>
              <p className="text-charcoal/70">HIPAA-compliant with end-to-end encryption for complete peace of mind.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal mb-4">Simple, flexible pricing</h2>
          <p className="text-xl text-charcoal/70">Start for free. Upgrade when you're ready.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Free Forever Plan */}
          <Card className="relative p-8 border-2 border-mint/20 bg-gradient-to-br from-mint/5 to-white">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-mint-dark text-white px-4 py-2 rounded-full text-sm font-semibold">Free Forever</span>
            </div>
            <CardContent className="p-0 space-y-6">
              <div className="text-center pt-4">
                <h3 className="text-2xl font-bold text-charcoal mb-2">Free Forever</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-mint-dark">₹0</span>
                  <span className="text-charcoal/60 ml-2">/month</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-mint-dark mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Manage clients and appointments</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-mint-dark mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Secure notes and session history</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-mint-dark mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Offer one service</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-mint-dark mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Built-in privacy and data security</span>
                </div>
              </div>

              <Button 
                className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white py-3"
                asChild
              >
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSc49XBBZDbeNVC7y_WdXhYjCxjaOwK66KOBH6Ty_4XrzWMYvQ/viewform?usp=dialog" target="_blank" rel="noopener noreferrer">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative p-8 border-2 border-coral/20 bg-gradient-to-br from-coral/5 to-white">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-coral text-white px-4 py-2 rounded-full text-sm font-semibold">Most Popular</span>
            </div>
            <CardContent className="p-0 space-y-6">
              <div className="text-center pt-4">
                <h3 className="text-2xl font-bold text-charcoal mb-2">Pro</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-coral">₹499</span>
                  <span className="text-charcoal/60 ml-2">/month</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-coral mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Everything in Free</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-coral mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Unlimited services</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-coral mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Google Calendar sync</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-coral mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Session reminders & notifications</span>
                </div>
              </div>

              <Button 
                className="w-full bg-coral hover:bg-coral/90 text-white py-3"
                asChild
              >
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSc49XBBZDbeNVC7y_WdXhYjCxjaOwK66KOBH6Ty_4XrzWMYvQ/viewform?usp=dialog" target="_blank" rel="noopener noreferrer">
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-8 border-2 border-coral/20 bg-gradient-to-br from-coral/5 to-white">
            <CardContent className="p-0 space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-charcoal mb-2">Enterprise / Organization</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-2xl font-bold text-coral">Custom pricing</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-coral mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Multi-therapist team support</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-coral mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Advanced insights & reporting</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-coral mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Dedicated account manager</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-coral mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">Custom onboarding</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-coral text-coral hover:bg-coral hover:text-white py-3"
                asChild
              >
                <a href="#contact">
                  Contact Us
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="story" className="container mx-auto px-6 py-20 bg-gradient-to-br from-mint/20 to-mint-light/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-charcoal mb-4">From a Therapist Who’s Been There</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <div className="w-80 h-80 rounded-full overflow-hidden shadow-2xl border-4 border-white">
                  <NextImage
                    src="/about.jpeg"
                    alt="Co-founder portrait"
                    width={350}
                    height={350}
                    className="w-full h-full object-cover object-[50%_35%]"
                  />
                </div>
              </div>
            </div>

            {/* Right side - Quote */}
            <div className="space-y-6">
              <blockquote className="text-lg leading-relaxed text-charcoal/90 font-light italic">
                "As a practicing therapist working with Indian clients around the world, I quickly realized how
                difficult it was to manage the logistics of private practice. Payments came through UPI, bank transfers,
                or PayPal — depending on where the client was — and appointments were juggled over long email threads.
                Tracking sessions, payments, and client progress felt scattered and stressful.
              </blockquote>

              <blockquote className="text-lg leading-relaxed text-charcoal/90 font-light italic">
                I tried different tools, but none of them were truly built for therapists. That's when my husband and I
                decided to create SereneNow: a platform that simplifies everything from scheduling to payments —
                providing the right infrastructure for those just starting out, whether solo or as a small team."
              </blockquote>

              <div className="pt-6 border-t border-mint-dark/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-mint/20 rounded-full flex items-center justify-center">
                    <span className="text-mint-dark font-semibold text-sm">MJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Manasi Jagtap</p>
                    <p className="text-charcoal/70 text-sm">Licensed Therapist & Co-founder of SereneNow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-6 py-20 bg-gradient-to-br from-mint/10 to-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal mb-4">Frequently asked questions</h2>
          <p className="text-xl text-charcoal/70">Everything you need to know about SereneNow</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <Collapsible className="group">
            <Card className="border-mint/10 hover:border-mint-dark/20 transition-colors">
              <CollapsibleTrigger className="w-full p-6 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-charcoal group-hover:text-mint-dark transition-colors">
                    Is SereneNow really free?
                  </h3>
                  <ChevronDown className="h-5 w-5 text-charcoal/60 group-data-[state=open]:rotate-180 transition-transform" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6">
                  <p className="text-charcoal/80 leading-relaxed">
                    Yes! You can use SereneNow's core features forever with no subscription fees. Our free plan includes
                    everything you need to run a solo practice effectively.
                  </p>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible className="group">
            <Card className="border-mint/10 hover:border-mint-dark/20 transition-colors">
              <CollapsibleTrigger className="w-full p-6 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-charcoal group-hover:text-mint-dark transition-colors">
                    What do I get in the free plan?
                  </h3>
                  <ChevronDown className="h-5 w-5 text-charcoal/60 group-data-[state=open]:rotate-180 transition-transform" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6">
                  <p className="text-charcoal/80 leading-relaxed">
                    Everything you need to run a solo practice: secure client data, appointments, notes, and privacy
                    tools — with one service. No hidden fees, no time limits, completely free forever.
                  </p>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible className="group">
            <Card className="border-mint/10 hover:border-mint-dark/20 transition-colors">
              <CollapsibleTrigger className="w-full p-6 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-charcoal group-hover:text-mint-dark transition-colors">
                    What if I need more features or team support?
                  </h3>
                  <ChevronDown className="h-5 w-5 text-charcoal/60 group-data-[state=open]:rotate-180 transition-colors" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6">
                  <p className="text-charcoal/80 leading-relaxed">
                    We offer custom plans for clinics and organizations. Contact us and we'll tailor something perfect
                    for your team's needs, including multi-therapist management, advanced reporting, and dedicated
                    support.
                  </p>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-mint py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-charcoal mb-4">Get in touch</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Contact Info */}
              <div className="flex flex-col justify-center space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-charcoal mb-6">Contact us</h2>
                  <a
                    href="mailto:admin@serenenow.in"
                    className="text-charcoal hover:text-mint-dark transition-colors block mb-4"
                  >
                    admin@serenenow.in
                  </a>
                  <div className="space-y-1">
                    <div className="text-charcoal">Pune, Maharashtra</div>
                    <div className="text-charcoal">India</div>
                  </div>
                </div>
                {/* Social Media Icons */}
                <div className="flex space-x-4">
                  <a href="#" className="bg-charcoal p-2 rounded-full hover:bg-mint-dark transition-colors">
                    <Facebook className="h-5 w-5 text-white" />
                  </a>
                  <a href="#" className="bg-charcoal p-2 rounded-full hover:bg-mint-dark transition-colors">
                    <Twitter className="h-5 w-5 text-white" />
                  </a>
                  <a href="#" className="bg-charcoal p-2 rounded-full hover:bg-mint-dark transition-colors">
                    <Instagram className="h-5 w-5 text-white" />
                  </a>
                  <a href="#" className="bg-charcoal p-2 rounded-full hover:bg-mint-dark transition-colors">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl p-10 shadow-lg w-full">
                <form className="space-y-6">
                  <Input
                    type="text"
                    placeholder="Name"
                    className="w-full border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    className="w-full border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                  />
                  <Textarea
                    placeholder="Message"
                    className="w-full min-h-[150px] border-mint/20 focus:border-mint-dark focus:ring-mint-dark"
                  />
                  <Button className="w-full bg-mint-dark hover:bg-mint-dark/90 text-white">
                    Send
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-mint/10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex items-center">
            <a href="#" className="flex items-center space-x-2">
              <img src="/favicon.png" alt="SereneNow Logo" className="w-8 h-8" />
              <span className="text-charcoal font-semibold">SereneNow</span>
            </a>
          </div>
          <div className="text-center text-sm text-charcoal/60">
          © 2025 SereneNow. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-charcoal/70">
            <a href="#" className="hover:text-mint-dark transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-mint-dark transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
