import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Settings,
  Lock,
  Unlock,
  Key,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@shared/constants/permissions';

// Types
interface StaffMember {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions: string[];
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffFormData {
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
  isActive: boolean;
}

// Role configurations
const roleConfigs = {
  'hotel-manager': {
    label: 'Quản lý khách sạn',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: <Shield className="h-3 w-3" />,
    description: 'Quyền truy cập đầy đủ',
  },
  'front-desk': {
    label: 'Lễ tân',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: <Users className="h-3 w-3" />,
    description: 'Quản lý yêu cầu khách hàng',
  },
  'it-manager': {
    label: 'Quản lý IT',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: <Settings className="h-3 w-3" />,
    description: 'Quản lý hệ thống kỹ thuật',
  },
};

// Staff form dialog
const StaffFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  staff = null,
  loading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormData) => void;
  staff?: StaffMember | null;
  loading?: boolean;
}) => {
  const isEdit = !!staff;
  const [formData, setFormData] = useState<StaffFormData>({
    username: staff?.username || '',
    email: staff?.email || '',
    displayName: staff?.displayName || '',
    role: staff?.role || 'front-desk',
    password: '',
    confirmPassword: '',
    isActive: staff?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: staff?.username || '',
        email: staff?.email || '',
        displayName: staff?.displayName || '',
        role: staff?.role || 'front-desk',
        password: '',
        confirmPassword: '',
        isActive: staff?.isActive ?? true,
      });
      setErrors({});
    }
  }, [isOpen, staff]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Tên hiển thị là bắt buộc';
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin nhân viên'
              : 'Tạo tài khoản nhân viên mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={e =>
                setFormData(prev => ({ ...prev, username: e.target.value }))
              }
              className={errors.username ? 'border-red-500' : ''}
              disabled={isEdit} // Cannot change username after creation
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e =>
                setFormData(prev => ({ ...prev, email: e.target.value }))
              }
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="displayName">Tên hiển thị</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={e =>
                setFormData(prev => ({ ...prev, displayName: e.target.value }))
              }
              className={errors.displayName ? 'border-red-500' : ''}
            />
            {errors.displayName && (
              <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Vai trò</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) =>
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfigs).map(([role, config]) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isEdit && (
            <>
              <div>
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={e =>
                setFormData(prev => ({ ...prev, isActive: e.target.checked }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isActive">Tài khoản hoạt động</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {isEdit ? 'Cập nhật' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Staff permissions modal
const StaffPermissionsModal = ({
  staff,
  isOpen,
  onClose,
}: {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!staff) return null;

  const roleConfig = roleConfigs[staff.role];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quyền hạn của {staff.displayName}
          </DialogTitle>
          <DialogDescription>
            Chi tiết quyền truy cập và vai trò
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Vai trò</Label>
            <Badge variant="outline" className={cn('mt-1', roleConfig.color)}>
              {roleConfig.icon}
              <span className="ml-1">{roleConfig.label}</span>
            </Badge>
            <p className="text-sm text-gray-600 mt-1">
              {roleConfig.description}
            </p>
          </div>

          <div>
            <Label>Quyền hạn ({staff.permissions.length})</Label>
            <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              <div className="grid grid-cols-1 gap-1">
                {staff.permissions.map(permission => (
                  <div
                    key={permission}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Key className="h-3 w-3 text-gray-400" />
                    <span className="font-mono text-xs">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Staff Management component
export const StaffManagement: React.FC = () => {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Mock data - replace with actual API call
  const mockStaffList: StaffMember[] = [
    {
      id: '1',
      username: 'manager',
      email: 'manager@hotel.com',
      displayName: 'Hotel Manager',
      role: 'hotel-manager',
      permissions: [
        'dashboard:view',
        'analytics:view_advanced',
        'staff:manage',
        'settings:manage',
      ],
      isActive: true,
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T09:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      username: 'frontdesk',
      email: 'frontdesk@hotel.com',
      displayName: 'Front Desk Staff',
      role: 'front-desk',
      permissions: [
        'dashboard:view',
        'requests:view',
        'calls:view',
        'guests:manage',
      ],
      isActive: true,
      lastLogin: '2024-01-15T09:15:00Z',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
    },
    {
      id: '3',
      username: 'itmanager',
      email: 'it@hotel.com',
      displayName: 'IT Manager',
      role: 'it-manager',
      permissions: [
        'dashboard:view',
        'system:monitor',
        'logs:view',
        'security:manage',
      ],
      isActive: true,
      lastLogin: '2024-01-14T16:45:00Z',
      createdAt: '2024-01-03T11:00:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
    },
    {
      id: '4',
      username: 'receptionist2',
      email: 'receptionist2@hotel.com',
      displayName: 'Receptionist 2',
      role: 'front-desk',
      permissions: ['dashboard:view', 'requests:view', 'calls:view'],
      isActive: false,
      lastLogin: '2024-01-10T14:20:00Z',
      createdAt: '2024-01-05T08:30:00Z',
      updatedAt: '2024-01-10T14:20:00Z',
    },
  ];

  // Fetch staff list
  const fetchStaffList = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setStaffList(mockStaffList);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      setLoading(false);
    }
  };

  // Add/Edit staff
  const handleStaffSubmit = async (data: StaffFormData) => {
    try {
      setFormLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (selectedStaff) {
        // Update existing staff
        setStaffList(prev =>
          prev.map(staff =>
            staff.id === selectedStaff.id
              ? { ...staff, ...data, updatedAt: new Date().toISOString() }
              : staff
          )
        );
        setShowEditModal(false);
      } else {
        // Add new staff
        const newStaff: StaffMember = {
          id: Date.now().toString(),
          ...data,
          permissions: [], // Will be set by backend based on role
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setStaffList(prev => [...prev, newStaff]);
        setShowAddModal(false);
      }

      setSelectedStaff(null);
    } catch (error) {
      console.error('Failed to save staff:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete staff
  const handleDeleteStaff = async (staffId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setStaffList(prev => prev.filter(staff => staff.id !== staffId));
    } catch (error) {
      console.error('Failed to delete staff:', error);
    }
  };

  // Toggle staff status
  const toggleStaffStatus = async (staffId: string) => {
    try {
      setStaffList(prev =>
        prev.map(staff =>
          staff.id === staffId
            ? {
                ...staff,
                isActive: !staff.isActive,
                updatedAt: new Date().toISOString(),
              }
            : staff
        )
      );
    } catch (error) {
      console.error('Failed to toggle staff status:', error);
    }
  };

  // Filter staff
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch =
      staff.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && staff.isActive) ||
      (statusFilter === 'inactive' && !staff.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Load staff on mount
  useEffect(() => {
    fetchStaffList();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
          <p className="text-gray-600">
            Thêm, sửa, xóa tài khoản nhân viên và quản lý quyền hạn
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStaffList} disabled={loading}>
            <RefreshCw
              className={cn('h-4 w-4 mr-2', loading && 'animate-spin')}
            />
            Làm mới
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Tổng nhân viên</p>
                <p className="text-2xl font-bold">{staffList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Đang hoạt động</p>
                <p className="text-2xl font-bold">
                  {staffList.filter(s => s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Quản lý</p>
                <p className="text-2xl font-bold">
                  {staffList.filter(s => s.role === 'hotel-manager').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Lễ tân</p>
                <p className="text-2xl font-bold">
                  {staffList.filter(s => s.role === 'front-desk').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tên, username, email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Vai trò</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {Object.entries(roleConfigs).map(([role, config]) => (
                    <SelectItem key={role} value={role}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngưng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
          <CardDescription>
            Hiển thị {filteredStaff.length} / {staffList.length} nhân viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Đang tải...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Lần đăng nhập cuối</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map(staff => {
                    const roleConfig = roleConfigs[staff.role];
                    return (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {staff.displayName}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{staff.username} • {staff.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={roleConfig.color}>
                            {roleConfig.icon}
                            <span className="ml-1">{roleConfig.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={staff.isActive ? 'default' : 'secondary'}
                          >
                            {staff.isActive ? (
                              <>
                                <Unlock className="h-3 w-3 mr-1" />
                                Hoạt động
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3 mr-1" />
                                Ngưng
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {staff.lastLogin ? (
                              <>
                                <div>
                                  {new Date(
                                    staff.lastLogin
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-gray-500">
                                  {new Date(
                                    staff.lastLogin
                                  ).toLocaleTimeString()}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">
                                Chưa đăng nhập
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(staff);
                                setShowPermissionsModal(true);
                              }}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(staff);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStaffStatus(staff.id)}
                            >
                              {staff.isActive ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xác nhận xóa
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc muốn xóa nhân viên "
                                    {staff.displayName}"? Hành động này không
                                    thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteStaff(staff.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <StaffFormDialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleStaffSubmit}
        loading={formLoading}
      />

      <StaffFormDialog
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStaff(null);
        }}
        onSubmit={handleStaffSubmit}
        staff={selectedStaff}
        loading={formLoading}
      />

      <StaffPermissionsModal
        staff={selectedStaff}
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setSelectedStaff(null);
        }}
      />
    </div>
  );
};
