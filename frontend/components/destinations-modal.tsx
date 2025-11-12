"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { apiClient, type Destination } from "@/lib/api-client"
import { MapPin, Loader2, X, MessageCircle } from "lucide-react"
import Logo from "./logo"

interface DestinationsModalProps {
  isOpen: boolean
  onClose: () => void
  onStartChat: (destinationName: string) => void
}

export default function DestinationsModal({ isOpen, onClose, onStartChat }: DestinationsModalProps) {
  const { language, t } = useLanguage()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  useEffect(() => {
    if (isOpen) {
      loadDestinations()
    }
  }, [isOpen])

  useEffect(() => {
    filterDestinations()
  }, [destinations, selectedRegion, selectedType])

  const loadDestinations = async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.getDestinations({ language })
      setDestinations(data)
      setFilteredDestinations(data)
    } catch (error) {
      console.error("Error loading destinations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterDestinations = () => {
    let filtered = [...destinations]

    if (selectedRegion !== "all") {
      filtered = filtered.filter((d) => d.region === selectedRegion)
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((d) => d.type.includes(selectedType))
    }

    setFilteredDestinations(filtered)
  }

  const regions = [
    { value: "all", label: language === "vi" ? "Tất cả" : "All" },
    { value: "north", label: language === "vi" ? "Miền Bắc" : "North" },
    { value: "central", label: language === "vi" ? "Miền Trung" : "Central" },
    { value: "south", label: language === "vi" ? "Miền Nam" : "South" },
  ]

  const types = [
    { value: "all", label: language === "vi" ? "Tất cả" : "All" },
    { value: "beach", label: language === "vi" ? "Biển" : "Beach" },
    { value: "mountain", label: language === "vi" ? "Núi" : "Mountain" },
    { value: "city", label: language === "vi" ? "Thành phố" : "City" },
    { value: "culture", label: language === "vi" ? "Văn hóa" : "Culture" },
    { value: "nature", label: language === "vi" ? "Thiên nhiên" : "Nature" },
  ]

  const handleStartChat = (destination: Destination) => {
    const destinationName = language === "vi" ? destination.name : destination.name_en
    onStartChat(destinationName)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-background rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Logo size="md" showText={false} />
              <h2 className="text-2xl font-bold text-foreground">
                {language === "vi" ? "Khám phá điểm đến" : "Explore Destinations"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground"
              title={language === "vi" ? "Đóng" : "Close"}
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {language === "vi"
              ? "Chọn một điểm đến để bắt đầu trò chuyện và khám phá"
              : "Select a destination to start chatting and exploring"}
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                {language === "vi" ? "Vùng miền" : "Region"}
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                {language === "vi" ? "Loại hình" : "Type"}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                {language === "vi"
                  ? "Không tìm thấy điểm đến phù hợp"
                  : "No destinations found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDestinations.map((destination) => (
                <div
                  key={destination.id}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={destination.image_url}
                      alt={language === "vi" ? destination.name : destination.name_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/800x450?text=Vietnam"
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {language === "vi" ? destination.name : destination.name_en}
                      </h3>
                      <MapPin size={16} className="text-primary flex-shrink-0 mt-1" />
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {language === "vi" ? destination.description : destination.description_en}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(language === "vi" ? destination.highlights : destination.highlights_en)
                        .slice(0, 2)
                        .map((highlight, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground"
                          >
                            {highlight}
                          </span>
                        ))}
                    </div>

                    {/* Region & Type Tags */}
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {regions.find((r) => r.value === destination.region)?.label}
                      </span>
                      {destination.type.slice(0, 1).map((type) => (
                        <span
                          key={type}
                          className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {types.find((t) => t.value === type)?.label}
                        </span>
                      ))}
                    </div>

                    {/* Start Chat Button */}
                    <button
                      onClick={() => handleStartChat(destination)}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium hover:opacity-90 transition"
                    >
                      <MessageCircle size={14} />
                      <span>{t("startChat")}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

