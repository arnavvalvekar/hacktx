import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TiltCard } from '@/components/TiltCard'
import { Settings as SettingsIcon, User, Palette, Database, Shield, Bell, Globe, Key, CheckCircle, Save, ArrowLeft } from 'lucide-react'
import { nessieService } from '@/services/nessieService'
import { useAuth0 } from '@auth0/auth0-react'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, isAuthenticated } = useAuth0()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [nessieStatus, setNessieStatus] = useState<any>(null)
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'English',
    animations: true,
    autoSync: true,
    syncFrequency: 'Daily',
    dataSharing: 'Minimal',
    analytics: false,
    twoFactorAuth: true,
    emailNotifications: true,
    pushNotifications: false,
    goalReminders: 'Weekly',
    country: 'United States',
    currency: 'USD',
    timeZone: 'EST'
  })
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadNessieStatus()
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('ecofin-settings')
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsedSettings }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem('ecofin-settings', JSON.stringify(settings))
      setHasChanges(false)
      toast({
        title: "Settings Saved",
        description: "Your preferences have been saved successfully.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    updateSetting('theme', newTheme)
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const loadNessieStatus = () => {
    try {
      const accounts = nessieService.getAccounts()
      const carbonData = nessieService.getCarbonFootprintData()
      const totalCarbon = nessieService.getTotalCarbonFootprint()
      
      setNessieStatus({
        connected: true,
        accountsCount: accounts.length,
        transactionsTracked: carbonData.length,
        totalCarbonFootprint: totalCarbon,
        lastSync: new Date().toISOString()
      })
    } catch (error) {
      setNessieStatus({
        connected: false,
        error: 'Failed to load Nessie data'
      })
    }
  }


  const settingsSections = [
    {
      title: "Profile Settings",
      description: "Manage your Auth0 profile and personal information",
      icon: User,
      items: [
        { 
          label: "Email", 
          value: user?.email || "Not available", 
          type: "text" 
        },
        { 
          label: "Name", 
          value: user?.name || "User", 
          type: "text" 
        },
        { 
          label: "User ID", 
          value: user?.sub || "Not available", 
          type: "text" 
        },
        { label: "Avatar", value: "Change Profile Picture", type: "button" }
      ]
    },
    {
      title: "Appearance",
      description: "Customize your theme and visual preferences",
      icon: Palette,
      items: [
        { 
          label: "Theme", 
          value: settings.theme, 
          type: "select", 
          options: ["Light", "Dark"], 
          onChange: (value: string) => updateSetting('theme', value.toLowerCase())
        },
        { 
          label: "Language", 
          value: settings.language, 
          type: "select", 
          options: ["English", "Spanish", "French"],
          onChange: (value: string) => updateSetting('language', value)
        },
        { 
          label: "Animations", 
          value: settings.animations ? "Enabled" : "Disabled", 
          type: "toggle",
          onChange: () => updateSetting('animations', !settings.animations)
        }
      ]
    },
    {
      title: "Data Sources",
      description: "Configure your Nessie API and data connections",
      icon: Database,
      items: [
        { 
          label: "Nessie API Status", 
          value: nessieStatus?.connected ? "Connected" : "Disconnected", 
          type: "status",
          status: nessieStatus?.connected ? "success" : "error"
        },
        { 
          label: "Accounts Connected", 
          value: nessieStatus?.accountsCount?.toString() || "0", 
          type: "text" 
        },
        { 
          label: "Transactions Tracked", 
          value: nessieStatus?.transactionsTracked?.toString() || "0", 
          type: "text" 
        },
        { 
          label: "Total Carbon Footprint", 
          value: nessieStatus?.totalCarbonFootprint ? `${nessieStatus.totalCarbonFootprint.toFixed(2)} kg CO₂` : "0.00 kg CO₂", 
          type: "text" 
        },
        { 
          label: "Auto Sync", 
          value: settings.autoSync ? "Enabled" : "Disabled", 
          type: "toggle",
          onChange: () => updateSetting('autoSync', !settings.autoSync)
        },
        { 
          label: "Sync Frequency", 
          value: settings.syncFrequency, 
          type: "select", 
          options: ["Hourly", "Daily", "Weekly"],
          onChange: (value: string) => updateSetting('syncFrequency', value)
        }
      ]
    },
    {
      title: "Privacy & Security",
      description: "Manage your privacy settings and security preferences",
      icon: Shield,
      items: [
        { 
          label: "Data Sharing", 
          value: settings.dataSharing, 
          type: "select", 
          options: ["None", "Minimal", "Full"],
          onChange: (value: string) => updateSetting('dataSharing', value)
        },
        { 
          label: "Analytics", 
          value: settings.analytics ? "Enabled" : "Disabled", 
          type: "toggle",
          onChange: () => updateSetting('analytics', !settings.analytics)
        },
        { 
          label: "Two-Factor Auth", 
          value: settings.twoFactorAuth ? "Enabled" : "Disabled", 
          type: "toggle",
          onChange: () => updateSetting('twoFactorAuth', !settings.twoFactorAuth)
        }
      ]
    },
    {
      title: "Notifications",
      description: "Configure how you receive updates and alerts",
      icon: Bell,
      items: [
        { 
          label: "Email Notifications", 
          value: settings.emailNotifications ? "Enabled" : "Disabled", 
          type: "toggle",
          onChange: () => updateSetting('emailNotifications', !settings.emailNotifications)
        },
        { 
          label: "Push Notifications", 
          value: settings.pushNotifications ? "Enabled" : "Disabled", 
          type: "toggle",
          onChange: () => updateSetting('pushNotifications', !settings.pushNotifications)
        },
        { 
          label: "Goal Reminders", 
          value: settings.goalReminders, 
          type: "select", 
          options: ["Daily", "Weekly", "Monthly"],
          onChange: (value: string) => updateSetting('goalReminders', value)
        }
      ]
    },
    {
      title: "Regional Settings",
      description: "Set your location and regional preferences",
      icon: Globe,
      items: [
        { 
          label: "Country", 
          value: settings.country, 
          type: "select", 
          options: ["United States", "Canada", "United Kingdom"],
          onChange: (value: string) => updateSetting('country', value)
        },
        { 
          label: "Currency", 
          value: settings.currency, 
          type: "select", 
          options: ["USD", "CAD", "GBP"],
          onChange: (value: string) => updateSetting('currency', value)
        },
        { 
          label: "Time Zone", 
          value: settings.timeZone, 
          type: "select", 
          options: ["EST", "PST", "CST", "MST"],
          onChange: (value: string) => updateSetting('timeZone', value)
        }
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
                              <div 
                                className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
                                  item.value === 'Enabled' ? 'bg-eco-500' : 'bg-carbon-300'
                                }`}
                                onClick={item.onChange}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                  item.value === 'Enabled' ? 'translate-x-5' : 'translate-x-1'
                                } mt-1`} />
                              </div>
                            ) : item.type === 'select' ? (
                              <select 
                                className="text-sm border border-carbon-200 rounded px-2 py-1 bg-white"
                                value={item.value}
                                onChange={(e) => item.onChange?.(e.target.value)}
                              >
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
                            ) : item.type === 'status' ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className={`h-4 w-4 ${
                                  item.status === 'success' ? 'text-green-500' : 'text-red-500'
                                }`} />
                                <span className={`text-sm font-medium ${
                                  item.status === 'success' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {item.value}
                                </span>
                              </div>
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
          <Button 
            size="lg" 
            className={`${hasChanges ? 'bg-eco-500 hover:bg-eco-600' : 'bg-carbon-300 cursor-not-allowed'} transition-colors`}
            onClick={saveSettings}
            disabled={!hasChanges}
          >
            <Save className="mr-2 h-4 w-4" />
            {hasChanges ? 'Save Changes' : 'No Changes'}
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
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const dataStr = JSON.stringify(settings, null, 2)
                      const dataBlob = new Blob([dataStr], { type: 'application/json' })
                      const url = URL.createObjectURL(dataBlob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = 'ecofin-settings.json'
                      link.click()
                      URL.revokeObjectURL(url)
                      toast({
                        title: "Settings Exported",
                        description: "Your settings have been downloaded.",
                      })
                    }}
                  >
                    Export Settings
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = '.json'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            try {
                              const importedSettings = JSON.parse(e.target?.result as string)
                              setSettings(prev => ({ ...prev, ...importedSettings }))
                              setHasChanges(true)
                              toast({
                                title: "Settings Imported",
                                description: "Your settings have been imported successfully.",
                              })
                            } catch (error) {
                              toast({
                                title: "Import Error",
                                description: "Failed to import settings. Please check the file format.",
                                variant: "destructive",
                              })
                            }
                          }
                          reader.readAsText(file)
                        }
                      }
                      input.click()
                    }}
                  >
                    Import Settings
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      const defaultSettings = {
                        theme: 'light',
                        language: 'English',
                        animations: true,
                        autoSync: true,
                        syncFrequency: 'Daily',
                        dataSharing: 'Minimal',
                        analytics: false,
                        twoFactorAuth: true,
                        emailNotifications: true,
                        pushNotifications: false,
                        goalReminders: 'Weekly',
                        country: 'United States',
                        currency: 'USD',
                        timeZone: 'EST'
                      }
                      setSettings(defaultSettings)
                      setHasChanges(true)
                      toast({
                        title: "Settings Reset",
                        description: "Your settings have been reset to defaults.",
                      })
                    }}
                  >
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TiltCard>
        </motion.div>
      </div>

      {/* Professional Back Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
