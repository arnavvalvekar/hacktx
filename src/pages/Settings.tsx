import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TiltCard } from '@/components/TiltCard'
import { Settings as SettingsIcon, User, Palette, Database, Shield, Bell, Globe } from 'lucide-react'

export default function Settings() {
  const settingsSections = [
    {
      title: "Profile Settings",
      description: "Manage your Auth0 profile and personal information",
      icon: User,
      items: [
        { label: "Email", value: "user@example.com", type: "text" },
        { label: "Name", value: "John Doe", type: "text" },
        { label: "Avatar", value: "Change Profile Picture", type: "button" }
      ]
    },
    {
      title: "Appearance",
      description: "Customize your theme and visual preferences",
      icon: Palette,
      items: [
        { label: "Theme", value: "Light", type: "select", options: ["Light", "Dark", "Auto"] },
        { label: "Language", value: "English", type: "select", options: ["English", "Spanish", "French"] },
        { label: "Animations", value: "Enabled", type: "toggle" }
      ]
    },
    {
      title: "Data Sources",
      description: "Configure your Nessie API and data connections",
      icon: Database,
      items: [
        { label: "Nessie API Key", value: "••••••••••••••••", type: "password" },
        { label: "Auto Sync", value: "Enabled", type: "toggle" },
        { label: "Sync Frequency", value: "Daily", type: "select", options: ["Hourly", "Daily", "Weekly"] }
      ]
    },
    {
      title: "Privacy & Security",
      description: "Manage your privacy settings and security preferences",
      icon: Shield,
      items: [
        { label: "Data Sharing", value: "Minimal", type: "select", options: ["None", "Minimal", "Full"] },
        { label: "Analytics", value: "Disabled", type: "toggle" },
        { label: "Two-Factor Auth", value: "Enabled", type: "toggle" }
      ]
    },
    {
      title: "Notifications",
      description: "Configure how you receive updates and alerts",
      icon: Bell,
      items: [
        { label: "Email Notifications", value: "Enabled", type: "toggle" },
        { label: "Push Notifications", value: "Disabled", type: "toggle" },
        { label: "Goal Reminders", value: "Weekly", type: "select", options: ["Daily", "Weekly", "Monthly"] }
      ]
    },
    {
      title: "Regional Settings",
      description: "Set your location and regional preferences",
      icon: Globe,
      items: [
        { label: "Country", value: "United States", type: "select", options: ["United States", "Canada", "United Kingdom"] },
        { label: "Currency", value: "USD", type: "select", options: ["USD", "CAD", "GBP"] },
        { label: "Time Zone", value: "EST", type: "select", options: ["EST", "PST", "CST", "MST"] }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 to-carbon-50 p-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-carbon-900 mb-2">
            Settings
          </h1>
          <p className="text-carbon-600 text-lg">
            Manage your preferences, security, and application settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            >
              <TiltCard>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <section.icon className="h-5 w-5 text-eco-500" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                          className="flex items-center justify-between py-2 border-b border-carbon-100 last:border-b-0"
                        >
                          <span className="text-sm font-medium text-carbon-700">
                            {item.label}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.type === 'toggle' ? (
                              <div className={`w-10 h-6 rounded-full transition-colors ${
                                item.value === 'Enabled' ? 'bg-eco-500' : 'bg-carbon-300'
                              }`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                  item.value === 'Enabled' ? 'translate-x-5' : 'translate-x-1'
                                } mt-1`} />
                              </div>
                            ) : item.type === 'select' ? (
                              <select className="text-sm border border-carbon-200 rounded px-2 py-1 bg-white">
                                {item.options?.map(option => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : item.type === 'password' ? (
                              <span className="text-sm text-carbon-500">{item.value}</span>
                            ) : item.type === 'button' ? (
                              <Button variant="outline" size="sm">
                                {item.value}
                              </Button>
                            ) : (
                              <span className="text-sm text-carbon-600">{item.value}</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Save Changes Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 flex justify-center"
        >
          <Button size="lg" className="bg-eco-500 hover:bg-eco-600">
            Save Changes
          </Button>
        </motion.div>

        {/* Export/Import Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8"
        >
          <TiltCard>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-eco-500" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export or import your settings and data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline">
                    Export Settings
                  </Button>
                  <Button variant="outline">
                    Import Settings
                  </Button>
                  <Button variant="destructive">
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TiltCard>
        </motion.div>
      </div>
    </div>
  )
}
