import React from 'react'
import { useHotel, useHotelTheme, useHotelFeatures, useHotelServices, useHotelVapi } from '@/context/HotelContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Check, X, Palette, Phone, MapPin, Clock, DollarSign } from 'lucide-react'

export const HotelConfigDemo: React.FC = () => {
  const { 
    config, 
    loading, 
    error, 
    isDefaultConfig,
    reload,
    getContactInfo,
    getLocation,
    getTimezone,
    getCurrency
  } = useHotel()

  // Use specialized hooks
  const { colors, fonts } = useHotelTheme()
  const { 
    isMultiLanguage, 
    hasCallHistory, 
    hasRoomService, 
    hasConcierge, 
    hasVoiceCloning,
    hasAnalytics 
  } = useHotelFeatures()
  const { services } = useHotelServices()
  const { supportedLanguages } = useHotelVapi()

  if (loading) {
    return <div className="p-4 text-center">Loading hotel configuration...</div>
  }

  if (error && !config) {
    return (
      <div className="p-4 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={reload} variant="outline">
          Retry Loading
        </Button>
      </div>
    )
  }

  if (!config) {
    return <div className="p-4 text-center">No hotel configuration found</div>
  }

  const contact = getContactInfo()
  const location = getLocation()
  const timezone = getTimezone()
  const currency = getCurrency()

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Hotel Configuration Demo</h1>
        {isDefaultConfig && (
          <Badge variant="secondary" className="mb-4">
            <AlertCircle className="w-4 h-4 mr-1" />
            Using Default Mi Nhon Hotel Configuration
          </Badge>
        )}
      </div>

      {/* Hotel Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Hotel Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Basic Details</h3>
              <p><strong>Name:</strong> {config.name}</p>
              <p><strong>Subdomain:</strong> {config.subdomain}</p>
              {config.customDomain && (
                <p><strong>Custom Domain:</strong> {config.customDomain}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Location & Settings</h3>
              <p><strong>City:</strong> {location?.city || 'N/A'}</p>
              <p><strong>Country:</strong> {location?.country || 'N/A'}</p>
              <p><strong>Timezone:</strong> {timezone}</p>
              <p><strong>Currency:</strong> {currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Phone:</strong> {contact?.phone || 'N/A'}</p>
              <p><strong>Email:</strong> {contact?.email || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Address:</strong> {contact?.address || 'N/A'}</p>
              {contact?.website && (
                <p><strong>Website:</strong> {contact.website}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme & Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme & Branding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Colors</h3>
              <div className="flex gap-2 mb-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: colors.primary }}
                  title={`Primary: ${colors.primary}`}
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: colors.secondary }}
                  title={`Secondary: ${colors.secondary}`}
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: colors.accent }}
                  title={`Accent: ${colors.accent}`}
                />
              </div>
              <p className="text-sm text-gray-600">
                Primary: {colors.primary} | Secondary: {colors.secondary} | Accent: {colors.accent}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Fonts</h3>
              <p style={{ fontFamily: fonts.primary }}>
                Primary Font: {fonts.primary}
              </p>
              <p style={{ fontFamily: fonts.secondary }}>
                Secondary Font: {fonts.secondary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
          <CardDescription>Features enabled for this hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              {isMultiLanguage ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
              <span className={isMultiLanguage ? 'text-green-700' : 'text-red-700'}>
                Multi Language
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasCallHistory ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
              <span className={hasCallHistory ? 'text-green-700' : 'text-red-700'}>
                Call History
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasRoomService ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
              <span className={hasRoomService ? 'text-green-700' : 'text-red-700'}>
                Room Service
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasConcierge ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
              <span className={hasConcierge ? 'text-green-700' : 'text-red-700'}>
                Concierge
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasVoiceCloning ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
              <span className={hasVoiceCloning ? 'text-green-700' : 'text-red-700'}>
                Voice Cloning
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasAnalytics ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
              <span className={hasAnalytics ? 'text-green-700' : 'text-red-700'}>
                Analytics
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {supportedLanguages.map((lang) => (
              <Badge key={lang} variant="outline">
                {lang.toUpperCase()}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Services */}
      <Card>
        <CardHeader>
          <CardTitle>Available Services</CardTitle>
          <CardDescription>Services offered by this hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{service.category}</p>
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                  )}
                </div>
                {service.price && (
                  <Badge variant="secondary">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {service.price}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-5 h-5" />
              Configuration Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">{error}</p>
            <p className="text-sm text-orange-600">
              The system is running with fallback configuration. Some features may be limited.
            </p>
            <Button onClick={reload} variant="outline" className="mt-3">
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default HotelConfigDemo 