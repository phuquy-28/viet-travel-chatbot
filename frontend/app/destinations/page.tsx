"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { apiClient, type Destination } from "@/lib/api-client"
import { MapPin, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DestinationsPage() {
  const { language, t } = useLanguage()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  useEffect(() => {
    loadDestinations()
  }, [])

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft size={16} />
              <span>{language === "vi" ? "Quay lại" : "Back"}</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === "vi" ? "Khám phá điểm đến" : "Explore Destinations"}
          </h1>
          <p className="text-muted-foreground">
            {language === "vi"
              ? "Tìm kiếm và khám phá những điểm du lịch tuyệt vời tại Việt Nam"
              : "Discover amazing travel destinations across Vietnam"}
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-6">
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
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <div
                key={destination.id}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
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
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {language === "vi" ? destination.name : destination.name_en}
                    </h3>
                    <MapPin size={18} className="text-primary flex-shrink-0 mt-1" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {language === "vi" ? destination.description : destination.description_en}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(language === "vi" ? destination.highlights : destination.highlights_en)
                      .slice(0, 3)
                      .map((highlight, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-muted text-foreground"
                        >
                          {highlight}
                        </span>
                      ))}
                  </div>

                  {/* Region Tag */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      {regions.find((r) => r.value === destination.region)?.label}
                    </span>
                    {destination.type.slice(0, 2).map((type) => (
                      <span
                        key={type}
                        className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                      >
                        {types.find((t) => t.value === type)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

