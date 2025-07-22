import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Star,
  Clock,
  CreditCard,
  FileText,
  History,
  Plus,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  User,
} from 'lucide-react';
import { logger } from '@shared/utils/logger';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Types
interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  dateOfBirth: string;
  idNumber: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  preferredLanguage: string;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalStays: number;
  totalSpent: number;
  averageRating: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastStay: string;
  status: 'active' | 'inactive' | 'vip';
  preferences: {
    roomType: string;
    floorPreference: string;
    smokingPreference: string;
    bedPreference: string;
    specialRequests: string[];
  };
}

interface Booking {
  id: string;
  guestId: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests: string[];
  rating: number;
  review: string;
  createdAt: string;
}

interface GuestNote {
  id: string;
  guestId: string;
  note: string;
  type: 'general' | 'preference' | 'complaint' | 'compliment';
  staffMember: string;
  createdAt: string;
}

// Mock data
const mockGuests: Guest[] = [
  {
    id: '1',
    firstName: 'Nguyen',
    lastName: 'Van A',
    email: 'nguyenvana@email.com',
    phone: '+84 90 123 4567',
    nationality: 'Vietnam',
    dateOfBirth: '1985-03-15',
    idNumber: '123456789',
    address: '123 Le Loi Street',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    zipCode: '700000',
    preferredLanguage: 'vi',
    membershipTier: 'gold',
    totalStays: 12,
    totalSpent: 45000000,
    averageRating: 4.8,
    notes: 'VIP customer, prefers quiet rooms',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    lastStay: '2024-01-10T14:30:00Z',
    status: 'vip',
    preferences: {
      roomType: 'Suite',
      floorPreference: 'High floor',
      smokingPreference: 'Non-smoking',
      bedPreference: 'King bed',
      specialRequests: ['Late check-out', 'Extra towels'],
    },
  },
  {
    id: '2',
    firstName: 'Kim',
    lastName: 'Min Jun',
    email: 'kim.minjun@email.com',
    phone: '+82 10 9876 5432',
    nationality: 'South Korea',
    dateOfBirth: '1990-07-22',
    idNumber: 'KOR987654321',
    address: '456 Gangnam-gu',
    city: 'Seoul',
    country: 'South Korea',
    zipCode: '06543',
    preferredLanguage: 'ko',
    membershipTier: 'silver',
    totalStays: 5,
    totalSpent: 18000000,
    averageRating: 4.5,
    notes: 'Business traveler, needs early breakfast',
    createdAt: '2023-08-20T09:00:00Z',
    updatedAt: '2024-01-05T11:15:00Z',
    lastStay: '2024-01-05T11:15:00Z',
    status: 'active',
    preferences: {
      roomType: 'Deluxe',
      floorPreference: 'Mid floor',
      smokingPreference: 'Non-smoking',
      bedPreference: 'Twin beds',
      specialRequests: ['Early breakfast', 'Business center access'],
    },
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 555 123 4567',
    nationality: 'United States',
    dateOfBirth: '1988-12-03',
    idNumber: 'USA123456789',
    address: '789 Broadway',
    city: 'New York',
    country: 'United States',
    zipCode: '10001',
    preferredLanguage: 'en',
    membershipTier: 'platinum',
    totalStays: 25,
    totalSpent: 95000000,
    averageRating: 4.9,
    notes: 'Frequent traveler, allergic to shellfish',
    createdAt: '2022-05-10T16:00:00Z',
    updatedAt: '2024-01-12T09:45:00Z',
    lastStay: '2024-01-12T09:45:00Z',
    status: 'vip',
    preferences: {
      roomType: 'Presidential Suite',
      floorPreference: 'Top floor',
      smokingPreference: 'Non-smoking',
      bedPreference: 'King bed',
      specialRequests: [
        'Shellfish allergy',
        'Concierge service',
        'Airport transfer',
      ],
    },
  },
];

const mockBookings: Booking[] = [
  {
    id: '1',
    guestId: '1',
    roomNumber: '2101',
    roomType: 'Suite',
    checkIn: '2024-01-10T15:00:00Z',
    checkOut: '2024-01-13T11:00:00Z',
    guests: 2,
    totalAmount: 12000000,
    status: 'checked-out',
    paymentStatus: 'paid',
    specialRequests: ['Late check-out', 'Extra towels'],
    rating: 5,
    review: 'Excellent service and room quality',
    createdAt: '2024-01-05T10:00:00Z',
  },
  {
    id: '2',
    guestId: '2',
    roomNumber: '1505',
    roomType: 'Deluxe',
    checkIn: '2024-01-05T14:00:00Z',
    checkOut: '2024-01-07T12:00:00Z',
    guests: 1,
    totalAmount: 6000000,
    status: 'checked-out',
    paymentStatus: 'paid',
    specialRequests: ['Early breakfast'],
    rating: 4,
    review: 'Good stay, helpful staff',
    createdAt: '2024-01-01T09:00:00Z',
  },
];

const mockNotes: GuestNote[] = [
  {
    id: '1',
    guestId: '1',
    note: 'Guest requested room upgrade, complimentary provided',
    type: 'general',
    staffMember: 'Front Desk Staff',
    createdAt: '2024-01-10T16:00:00Z',
  },
  {
    id: '2',
    guestId: '1',
    note: 'Prefers high floor rooms with city view',
    type: 'preference',
    staffMember: 'Front Desk Staff',
    createdAt: '2024-01-10T15:30:00Z',
  },
];

// Helper functions
const getMembershipColor = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return 'bg-purple-100 text-purple-800';
    case 'gold':
      return 'bg-yellow-100 text-yellow-800';
    case 'silver':
      return 'bg-gray-100 text-gray-800';
    case 'bronze':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'vip':
      return 'bg-purple-100 text-purple-800';
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getBookingStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'checked-in':
      return 'bg-green-100 text-green-800';
    case 'checked-out':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Guest Details Modal
const GuestDetailsModal = ({
  guest,
  isOpen,
  onClose,
  onUpdate,
}: {
  guest: Guest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (guest: Guest) => void;
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Guest | null>(guest);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(guest);
  }, [guest]);

  const handleSave = async () => {
    if (!formData) {return;}

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUpdate(formData);
      setEditMode(false);
    } catch (error) {
      logger.error('Failed to update guest:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  if (!guest || !formData) {return null;}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {guest.firstName} {guest.lastName}
            <Badge
              className={cn('ml-2', getMembershipColor(guest.membershipTier))}
            >
              {guest.membershipTier.toUpperCase()}
            </Badge>
            <Badge className={cn('ml-1', getStatusColor(guest.status))}>
              {guest.status.toUpperCase()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Chi tiết thông tin khách hàng và lịch sử đặt phòng
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="bookings">Lịch sử đặt phòng</TabsTrigger>
            <TabsTrigger value="notes">Ghi chú</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Thông tin cá nhân</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {editMode ? 'Hủy' : 'Chỉnh sửa'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">Họ</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={e =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Tên</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={e =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>

                <div>
                  <Label htmlFor="nationality">Quốc tịch</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={e =>
                      setFormData({ ...formData, nationality: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>

                <div>
                  <Label htmlFor="idNumber">Số CMND/CCCD</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={e =>
                      setFormData({ ...formData, idNumber: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={e =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!editMode}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="city">Thành phố</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={e =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>

                <div>
                  <Label htmlFor="country">Quốc gia</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={e =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                disabled={!editMode}
                rows={3}
              />
            </div>

            {editMode && (
              <div className="flex justify-end gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Lịch sử đặt phòng</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Tổng cộng: {guest.totalStays} lần lưu trú
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  Chi tiêu: {formatCurrency(guest.totalSpent)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {mockBookings
                .filter(b => b.guestId === guest.id)
                .map(booking => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Phòng {booking.roomNumber}
                          </span>
                          <Badge variant="outline">{booking.roomType}</Badge>
                          <Badge
                            className={cn(
                              getBookingStatusColor(booking.status)
                            )}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(booking.checkIn)} -{' '}
                          {formatDate(booking.checkOut)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Số khách:
                          </span>{' '}
                          {booking.guests}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Tổng tiền:
                          </span>{' '}
                          {formatCurrency(booking.totalAmount)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Đánh giá:
                          </span>
                          <div className="flex items-center gap-1 ml-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-3 w-3',
                                  i < booking.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                )}
                              />
                            ))}
                            <span className="ml-1">({booking.rating}/5)</span>
                          </div>
                        </div>
                      </div>

                      {booking.review && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="text-muted-foreground">
                            Đánh giá:
                          </span>{' '}
                          {booking.review}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Ghi chú dịch vụ</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm ghi chú
              </Button>
            </div>

            <div className="space-y-3">
              {mockNotes
                .filter(n => n.guestId === guest.id)
                .map(note => (
                  <Card key={note.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{note.type}</Badge>
                        <div className="text-sm text-muted-foreground">
                          {note.staffMember} • {formatDate(note.createdAt)}
                        </div>
                      </div>
                      <p className="text-sm">{note.note}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Add Guest Modal
const AddGuestModal = ({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (guest: Guest) => void;
}) => {
  const [formData, setFormData] = useState<Partial<Guest>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    dateOfBirth: '',
    idNumber: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    preferredLanguage: 'vi',
    membershipTier: 'bronze',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newGuest: Guest = {
        id: Date.now().toString(),
        ...formData,
        totalStays: 0,
        totalSpent: 0,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastStay: '',
        status: 'active',
        preferences: {
          roomType: '',
          floorPreference: '',
          smokingPreference: 'Non-smoking',
          bedPreference: '',
          specialRequests: [],
        },
      } as Guest;

      onAdd(newGuest);
      onClose();

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        dateOfBirth: '',
        idNumber: '',
        address: '',
        city: '',
        country: '',
        zipCode: '',
        preferredLanguage: 'vi',
        membershipTier: 'bronze',
        notes: '',
      });
    } catch (error) {
      logger.error('Failed to add guest:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Thêm khách hàng mới
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin khách hàng để tạo hồ sơ mới
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Họ *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={e =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">Tên *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={e =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="nationality">Quốc tịch</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={e =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={e =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="idNumber">Số CMND/CCCD</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={e =>
                  setFormData({ ...formData, idNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="preferredLanguage">Ngôn ngữ ưa thích</Label>
              <Select
                value={formData.preferredLanguage}
                onValueChange={value =>
                  setFormData({ ...formData, preferredLanguage: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={e =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Thành phố</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={e =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="country">Quốc gia</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={e =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Thông tin bổ sung về khách hàng..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo khách hàng
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main Guest Management component
export const GuestManagement: React.FC = () => {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showGuestDetails, setShowGuestDetails] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);

  // Filter guests based on search and filters
  const filteredGuests = guests.filter(guest => {
    const matchesSearch =
      !searchQuery ||
      guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone.includes(searchQuery);

    const matchesMembership =
      membershipFilter === 'all' || guest.membershipTier === membershipFilter;
    const matchesStatus =
      statusFilter === 'all' || guest.status === statusFilter;

    return matchesSearch && matchesMembership && matchesStatus;
  });

  const handleViewGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowGuestDetails(true);
  };

  const handleUpdateGuest = (updatedGuest: Guest) => {
    setGuests(prev =>
      prev.map(g => (g.id === updatedGuest.id ? updatedGuest : g))
    );
    setSelectedGuest(updatedGuest);
  };

  const handleAddGuest = (newGuest: Guest) => {
    setGuests(prev => [...prev, newGuest]);
  };

  const fetchGuests = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGuests(mockGuests);
    } catch (error) {
      logger.error('Failed to fetch guests:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Đang tải danh sách khách hàng...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý khách hàng
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin khách hàng và lịch sử lưu trú
          </p>
        </div>
        <Button onClick={() => setShowAddGuest(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm khách hàng
        </Button>
      </div>

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tìm kiếm và lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={membershipFilter}
                onValueChange={setMembershipFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Membership tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả membership</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng khách hàng</p>
                <p className="text-2xl font-bold">{guests.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Khách VIP</p>
                <p className="text-2xl font-bold">
                  {guests.filter(g => g.status === 'vip').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Khách hàng mới</p>
                <p className="text-2xl font-bold">
                  {
                    guests.filter(
                      g =>
                        new Date(g.createdAt) >
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đánh giá TB</p>
                <p className="text-2xl font-bold">
                  {(
                    guests.reduce((sum, g) => sum + g.averageRating, 0) /
                    guests.length
                  ).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guest list */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
          <CardDescription>
            Hiển thị {filteredGuests.length} trong tổng số {guests.length} khách
            hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lần lưu trú</TableHead>
                  <TableHead>Chi tiêu</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Lần cuối</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map(guest => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {guest.nationality}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {guest.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {guest.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getMembershipColor(guest.membershipTier)}
                      >
                        {guest.membershipTier.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(guest.status)}>
                        {guest.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{guest.totalStays}</TableCell>
                    <TableCell>{formatCurrency(guest.totalSpent)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{guest.averageRating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {guest.lastStay
                        ? formatDate(guest.lastStay)
                        : 'Chưa lưu trú'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewGuest(guest)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Guest Details Modal */}
      <GuestDetailsModal
        guest={selectedGuest}
        isOpen={showGuestDetails}
        onClose={() => setShowGuestDetails(false)}
        onUpdate={handleUpdateGuest}
      />

      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={showAddGuest}
        onClose={() => setShowAddGuest(false)}
        onAdd={handleAddGuest}
      />
    </div>
  );
};
