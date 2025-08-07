import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Car,
  CheckCircle2,
  Clock,
  Coffee,
  DollarSign,
  Dumbbell,
  Edit3,
  ExternalLink,
  Globe,
  Hotel,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Search,
  Star,
  Wifi,
  X,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";

// Types
interface HotelData {
  id?: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  rating?: number;
  priceRange?: string;
  categories?: string[];
  amenities: string[];
  services: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    petPolicy?: string;
    smokingPolicy?: string;
  };
  roomTypes: Array<{
    name: string;
    price: number;
    description: string;
    capacity: number;
    amenities: string[];
  }>;
  localAttractions: Array<{
    name: string;
    description: string;
    distance: string;
    type: string;
  }>;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  images?: string[];
  lastUpdated?: string;
}

interface HotelResearchPanelProps {
  data: HotelData | null;
  isLoading: boolean;
  error?: string | null;
  onSearch: (hotelName: string, location?: string) => void;
  onEdit?: (data: HotelData) => void;
  onSave?: (data: HotelData) => void;
  editable?: boolean;
  className?: string;
}

// Amenity icon mapping
const getAmenityIcon = (amenity: string) => {
  const lowerAmenity = amenity.toLowerCase();

  if (lowerAmenity.includes("wifi") || lowerAmenity.includes("internet")) {
    return Wifi;
  } else if (lowerAmenity.includes("parking") || lowerAmenity.includes("car")) {
    return Car;
  } else if (
    lowerAmenity.includes("restaurant") ||
    lowerAmenity.includes("breakfast")
  ) {
    return Coffee;
  } else if (lowerAmenity.includes("gym") || lowerAmenity.includes("fitness")) {
    return Dumbbell;
  }

  return CheckCircle2;
};

// Research form component
const ResearchForm = ({
  onSearch,
  isLoading,
}: {
  onSearch: (hotelName: string, location?: string) => void;
  isLoading: boolean;
}) => {
  const [hotelName, setHotelName] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hotelName.trim()) {
      onSearch(hotelName.trim(), location.trim() || undefined);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Nghiên cứu khách sạn
        </CardTitle>
        <CardDescription>
          Nhập tên khách sạn để tự động thu thập thông tin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hotel-name">Tên khách sạn *</Label>
              <Input
                id="hotel-name"
                placeholder="Ví dụ: Grand Hotel Saigon"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Địa điểm</Label>
              <Input
                id="location"
                placeholder="Ví dụ: Ho Chi Minh City"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!hotelName.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang nghiên cứu...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Bắt đầu nghiên cứu
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Loading skeleton
const ResearchSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Hotel information display
const HotelInfoDisplay = ({
  data,
  editable = false,
  onEdit: _onEdit,
  onSave,
}: {
  data: HotelData;
  editable?: boolean;
  onEdit?: (data: HotelData) => void;
  onSave?: (data: HotelData) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);

  const handleSave = () => {
    if (onSave) {
      onSave(editData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription>
                Thông tin liên hệ và mô tả khách sạn
              </CardDescription>
            </div>
            {editable && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Chỉnh sửa
              </Button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Hủy
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Lưu
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label>Tên khách sạn</Label>
                <Input
                  value={editData.name}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Địa chỉ</Label>
                <Input
                  value={editData.address}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Điện thoại</Label>
                  <Input
                    value={editData.phone || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={editData.website || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={editData.description || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{data.name}</h3>
                <div className="flex items-center gap-4 mt-2">
                  {data.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{data.rating}</span>
                    </div>
                  )}
                  {data.priceRange && (
                    <Badge variant="outline">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {data.priceRange}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{data.address}</span>
                </div>
                {data.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{data.email}</span>
                  </div>
                )}
                {data.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={data.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {data.description && (
                <div>
                  <h4 className="font-medium mb-2">Mô tả</h4>
                  <p className="text-sm text-muted-foreground">
                    {data.description}
                  </p>
                </div>
              )}

              {data.categories && data.categories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Phân loại</h4>
                  <div className="flex flex-wrap gap-1">
                    {data.categories.map((category, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amenities and Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tiện nghi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.amenities.map((amenity, index) => {
                const IconComponent = getAmenityIcon(amenity);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dịch vụ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.services.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Chính sách
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Check-in</Label>
              <p className="text-sm text-muted-foreground">
                {data.policies.checkIn}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Check-out</Label>
              <p className="text-sm text-muted-foreground">
                {data.policies.checkOut}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Hủy phòng</Label>
              <p className="text-sm text-muted-foreground">
                {data.policies.cancellation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Types */}
      {data.roomTypes && data.roomTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Loại phòng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.roomTypes.map((room, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{room.name}</h4>
                    <Badge variant="outline">
                      {room.price.toLocaleString("vi-VN")} VND/đêm
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {room.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Sức chứa: {room.capacity} người</span>
                    {room.amenities.length > 0 && (
                      <span>Tiện nghi: {room.amenities.join(", ")}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Attractions */}
      {data.localAttractions && data.localAttractions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Điểm tham quan gần đó</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.localAttractions.map((attraction, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{attraction.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {attraction.description}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <Badge variant="outline" className="mb-1">
                      {attraction.type}
                    </Badge>
                    <p className="text-muted-foreground">
                      {attraction.distance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {data.lastUpdated && (
        <div className="text-center text-xs text-muted-foreground">
          Cập nhật lần cuối:{" "}
          {new Date(data.lastUpdated).toLocaleString("vi-VN")}
        </div>
      )}
    </div>
  );
};

// Main Hotel Research Panel component
export const HotelResearchPanel: React.FC<HotelResearchPanel> = ({
  data,
  isLoading,
  error,
  onSearch,
  onEdit,
  onSave,
  editable = false,
  className = "",
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Research Form */}
      {!data && <ResearchForm onSearch={onSearch} isLoading={isLoading} />}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Lỗi nghiên cứu</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && <ResearchSkeleton />}

      {/* Research Results */}
      {data && !isLoading && (
        <div className="space-y-4">
          {/* Header with actions */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Kết quả nghiên cứu</h2>
              <p className="text-muted-foreground">
                Thông tin chi tiết về {data.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSearch(data.name)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(data)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>

          {/* Hotel Information */}
          <HotelInfoDisplay
            data={data}
            editable={editable}
            onEdit={onEdit}
            onSave={onSave}
          />
        </div>
      )}
    </div>
  );
};

export default HotelResearchPanel;
