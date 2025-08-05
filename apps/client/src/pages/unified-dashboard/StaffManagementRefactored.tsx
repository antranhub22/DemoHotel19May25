/**
 * Staff Management Refactored Component
 * Redux-based staff management with domain-driven architecture
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { logger } from "@shared/utils/logger";
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Shield,
  Star,
  UserCheck,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// ========================================
// Staff Management Domain Imports
// ========================================
import {
  CreateStaffPayload,
  CreateTaskPayload,
  formatDate,
  formatStaffName,
  getDepartmentColor,
  getStaffRoleColor,
  getTaskPriorityColor,
  getTaskStatusColor,
  getWorkloadStatus,
  STAFF_DEPARTMENT_OPTIONS,
  STAFF_ROLE_OPTIONS,
  StaffMember,
  TASK_CATEGORY_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  useAttendance,
  useStaffManagement,
  useStaffRealtime,
  useTaskManagement,
  validateStaffData,
  validateTaskData,
} from "@/domains/staff-management";

// ========================================
// UI Helper Functions
// ========================================

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-3 w-3" />;
    case "inactive":
      return <Clock className="h-3 w-3" />;
    case "probation":
      return <Eye className="h-3 w-3" />;
    default:
      return <Users className="h-3 w-3" />;
  }
};

const getTaskIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-3 w-3" />;
    case "in-progress":
      return <Zap className="h-3 w-3" />;
    case "pending":
      return <Clock className="h-3 w-3" />;
    default:
      return <Badge className="h-3 w-3" />;
  }
};

// ========================================
// Staff Form Dialog
// ========================================

interface StaffFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
}

const StaffFormDialog: React.FC<StaffFormDialogProps> = ({
  isOpen,
  onClose,
  staff,
}) => {
  const { createNewStaff, updateExistingStaff, isSaving } =
    useStaffManagement();
  const isEdit = !!staff;

  const [formData, setFormData] = useState<Partial<CreateStaffPayload>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "Guest Services",
    role: "staff",
    hireDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (staff) {
        setFormData({
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          phone: staff.phone || "",
          position: staff.position,
          department: staff.department,
          role: staff.role,
          hireDate: staff.hireDate.split("T")[0],
        });
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          position: "",
          department: "Guest Services",
          role: "staff",
          hireDate: new Date().toISOString().split("T")[0],
        });
      }
      setErrors([]);
    }
  }, [isOpen, staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateStaffData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isEdit && staff) {
        await updateExistingStaff(staff.id, formData);
        logger.success("Staff member updated successfully", "Component");
      } else {
        await createNewStaff(formData as CreateStaffPayload);
        logger.success("Staff member created successfully", "Component");
      }
      onClose();
    } catch (error) {
      logger.error("Failed to save staff member:", "Component", error);
      setErrors(["Có lỗi xảy ra khi lưu thông tin nhân viên"]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật thông tin nhân viên"
              : "Thêm nhân viên mới vào hệ thống"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="text-red-800 font-medium mb-2">
                Vui lòng sửa các lỗi sau:
              </h4>
              <ul className="text-red-700 text-sm list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Tên *</Label>
              <Input
                id="firstName"
                value={formData.firstName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Nhập tên"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Họ *</Label>
              <Input
                id="lastName"
                value={formData.lastName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Nhập họ"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="nhannien@hotel.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+84 xxx xxx xxx"
              />
            </div>
          </div>

          {/* Job Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Vị trí *</Label>
              <Input
                id="position"
                value={formData.position || ""}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="Vị trí công việc"
              />
            </div>
            <div>
              <Label htmlFor="hireDate">Ngày vào làm *</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, hireDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Phòng ban *</Label>
              <Select
                value={formData.department || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, department: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_DEPARTMENT_OPTIONS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Vai trò *</Label>
              <Select
                value={formData.role || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() +
                        role.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Đang lưu..."
                : isEdit
                  ? "Cập nhật"
                  : "Thêm nhân viên"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ========================================
// Task Form Dialog
// ========================================

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
}

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  isOpen,
  onClose,
  staff,
}) => {
  const { createNewTask, isSaving } = useTaskManagement();
  const { staff: allStaff } = useStaffManagement();

  const [formData, setFormData] = useState<Partial<CreateTaskPayload>>({
    title: "",
    description: "",
    category: "General",
    priority: "medium",
    assignedTo: staff?.id || 0,
    dueDate: "",
    estimatedDuration: 60,
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        category: "General",
        priority: "medium",
        assignedTo: staff?.id || 0,
        dueDate: "",
        estimatedDuration: 60,
      });
      setErrors([]);
    }
  }, [isOpen, staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateTaskData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createNewTask(formData as CreateTaskPayload);
      logger.success("Task created successfully", "Component");
      onClose();
    } catch (error) {
      logger.error("Failed to create task:", "Component", error);
      setErrors(["Có lỗi xảy ra khi tạo nhiệm vụ"]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo nhiệm vụ mới</DialogTitle>
          <DialogDescription>
            Tạo nhiệm vụ mới và giao cho nhân viên
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="text-red-800 font-medium mb-2">
                Vui lòng sửa các lỗi sau:
              </h4>
              <ul className="text-red-700 text-sm list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Task Information */}
          <div>
            <Label htmlFor="title">Tiêu đề nhiệm vụ *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nhập tiêu đề nhiệm vụ"
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả nhiệm vụ *</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả chi tiết nhiệm vụ"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Loại nhiệm vụ *</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại nhiệm vụ" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Độ ưu tiên *</Label>
              <Select
                value={formData.priority || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignedTo">Giao cho nhân viên *</Label>
              <Select
                value={formData.assignedTo?.toString() || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedTo: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {allStaff
                    .filter(
                      (s) => s.isActive && s.employmentStatus === "active",
                    )
                    .map((staffMember) => (
                      <SelectItem
                        key={staffMember.id}
                        value={staffMember.id.toString()}
                      >
                        {formatStaffName(staffMember)} - {staffMember.position}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate">Thời hạn hoàn thành</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimatedDuration">Thời gian ước tính (phút)</Label>
            <Input
              id="estimatedDuration"
              type="number"
              min="15"
              step="15"
              value={formData.estimatedDuration || 60}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimatedDuration: parseInt(e.target.value) || 60,
                })
              }
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Đang tạo..." : "Tạo nhiệm vụ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ========================================
// Main Component
// ========================================

export const StaffManagementRefactored: React.FC = () => {
  useAuth();

  // ========================================
  // Redux Domain Hooks - NEW Architecture
  // ========================================
  const {
    staff,
    staffByDepartment,
    staffCounts,
    selectedStaff,
    filters,
    isLoading,
    error,
    analytics,
    loadStaff,
    selectStaffMember,
    updateStaffFilters,
    clearStaffFilters,
    clearCurrentError,
    setupAutoRefresh,
  } = useStaffManagement();

  const { tasks, loadTasks } = useTaskManagement();

  const {
    onDutyStaff,
    availableStaff,
    checkInStaffMember,
    checkOutStaffMember,
  } = useAttendance();

  // Set up real-time updates
  useStaffRealtime();

  // ========================================
  // Local State for UI
  // ========================================
  const [activeTab, setActiveTab] = useState("staff");
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedStaffForTask, setSelectedStaffForTask] =
    useState<StaffMember | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // ========================================
  // Effects
  // ========================================

  // Load staff and tasks on mount
  useEffect(() => {
    loadStaff();
    loadTasks();
  }, [loadStaff, loadTasks]);

  // Set up auto-refresh
  useEffect(() => {
    const cleanup = setupAutoRefresh(60000); // Refresh every minute
    return cleanup;
  }, [setupAutoRefresh]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearCurrentError();
    };
  }, [clearCurrentError]);

  // ========================================
  // Event Handlers
  // ========================================

  const handleViewStaff = (staff: StaffMember) => {
    selectStaffMember(staff);
  };

  const handleEditStaff = (staff: StaffMember) => {
    selectStaffMember(staff);
    setShowStaffForm(true);
  };

  const handleCreateTask = (staff?: StaffMember) => {
    setSelectedStaffForTask(staff || null);
    setShowTaskForm(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    updateStaffFilters({ [key]: value });
  };

  const handleClearFilters = () => {
    clearStaffFilters();
  };

  const handleCheckIn = async (staffId: number) => {
    try {
      await checkInStaffMember(staffId);
      logger.success("Staff checked in successfully", "Component");
    } catch (error) {
      logger.error("Failed to check in staff:", "Component", error);
    }
  };

  const handleCheckOut = async (staffId: number) => {
    try {
      await checkOutStaffMember(staffId);
      logger.success("Staff checked out successfully", "Component");
    } catch (error) {
      logger.error("Failed to check out staff:", "Component", error);
    }
  };

  // ========================================
  // Render Methods
  // ========================================

  const renderStaffCard = (staffMember: StaffMember) => {
    const workloadStatus = getWorkloadStatus(staffMember.currentWorkload);

    return (
      <Card key={staffMember.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {formatStaffName(staffMember)}
                </CardTitle>
                <CardDescription className="text-sm">
                  {staffMember.position} • {staffMember.department}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                variant="outline"
                className={cn("text-xs", getStaffRoleColor(staffMember.role))}
              >
                {getStatusIcon(staffMember.employmentStatus)}
                <span className="ml-1">{staffMember.role}</span>
              </Badge>
              {staffMember.isOnDuty && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-100 text-green-700"
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Đang làm việc
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Workload Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Khối lượng công việc:</span>
              <Badge
                variant="outline"
                className={cn("text-xs", workloadStatus.color)}
              >
                {staffMember.currentWorkload}/10 • {workloadStatus.description}
              </Badge>
            </div>

            {/* Performance */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Đánh giá:</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span>{staffMember.averageRating.toFixed(1)}</span>
              </div>
            </div>

            {/* Tasks */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Nhiệm vụ:</span>
              <span>
                {staffMember.tasksCompleted}/{staffMember.tasksAssigned}
              </span>
            </div>

            {/* Last activity */}
            {staffMember.lastCheckIn && (
              <div className="text-xs text-gray-500">
                <Clock className="h-3 w-3 inline mr-1" />
                Check-in: {formatDate(staffMember.lastCheckIn)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewStaff(staffMember)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Xem
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditStaff(staffMember)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateTask(staffMember)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Giao việc
            </Button>
            {staffMember.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  staffMember.isOnDuty
                    ? handleCheckOut(staffMember.id)
                    : handleCheckIn(staffMember.id)
                }
              >
                {staffMember.isOnDuty ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-1" />
                    Check-out
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-1" />
                    Check-in
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStaffTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Vị trí</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Khối lượng</TableHead>
            <TableHead>Đánh giá</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((staffMember) => {
            const workloadStatus = getWorkloadStatus(
              staffMember.currentWorkload,
            );
            return (
              <TableRow key={staffMember.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {formatStaffName(staffMember)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {staffMember.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{staffMember.position}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      getDepartmentColor(staffMember.department),
                    )}
                  >
                    {staffMember.department}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs w-fit",
                        getStaffRoleColor(staffMember.role),
                      )}
                    >
                      {getStatusIcon(staffMember.employmentStatus)}
                      <span className="ml-1">
                        {staffMember.employmentStatus}
                      </span>
                    </Badge>
                    {staffMember.isOnDuty && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-100 text-green-700 w-fit"
                      >
                        Đang làm việc
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", workloadStatus.color)}
                  >
                    {staffMember.currentWorkload}/10
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{staffMember.averageRating.toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewStaff(staffMember)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStaff(staffMember)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateTask(staffMember)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  const renderFilterBar = () => (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Label htmlFor="department-filter" className="text-sm font-medium">
          Phòng ban:
        </Label>
        <Select
          value={filters.department || "all"}
          onValueChange={(value) =>
            handleFilterChange("department", value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-40" id="department-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {STAFF_DEPARTMENT_OPTIONS.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="role-filter" className="text-sm font-medium">
          Vai trò:
        </Label>
        <Select
          value={filters.role || "all"}
          onValueChange={(value) =>
            handleFilterChange("role", value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-40" id="role-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {STAFF_ROLE_OPTIONS.map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1).replace("-", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Tìm kiếm:
        </Label>
        <Input
          type="text"
          id="search"
          placeholder="Tên, email, ID..."
          value={filters.searchQuery || ""}
          onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
          className="w-48"
        />
      </div>

      <div className="flex gap-2 ml-auto">
        <Button variant="outline" size="sm" onClick={() => loadStaff()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Làm mới
        </Button>
        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          <Filter className="h-4 w-4 mr-1" />
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );

  const renderTasksList = () => (
    <div className="space-y-4">
      {tasks.slice(0, 10).map((task) => {
        const assignedStaff = staff.find((s) => s.id === task.assignedTo);
        return (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      getTaskPriorityColor(task.priority),
                    )}
                  >
                    {task.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getTaskStatusColor(task.status))}
                  >
                    {getTaskIcon(task.status)}
                    <span className="ml-1">{task.status}</span>
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-sm">
                {task.category} • Giao cho:{" "}
                {assignedStaff ? formatStaffName(assignedStaff) : "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 mb-3 line-clamp-2">
                {task.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {formatDate(task.createdAt)}
                  </span>
                  {task.dueDate && (
                    <span className="text-orange-600">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Hạn: {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
                <div className="text-gray-600">Tiến độ: {task.progress}%</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // ========================================
  // Main Render
  // ========================================

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <Shield className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Có lỗi xảy ra
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearCurrentError();
                    loadStaff();
                  }}
                >
                  Thử lại
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý nhân viên
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin nhân viên, phân công nhiệm vụ và theo dõi hiệu
            suất
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              Tổng: <strong>{staffCounts.total}</strong>
            </span>
            <span>
              Đang làm: <strong>{staffCounts.onDuty}</strong>
            </span>
            <span>
              Có thể giao việc: <strong>{staffCounts.available}</strong>
            </span>
          </div>
          <Button onClick={() => setShowStaffForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staff">Nhân viên</TabsTrigger>
          <TabsTrigger value="tasks">Nhiệm vụ</TabsTrigger>
          <TabsTrigger value="schedule">Lịch làm việc</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
        </TabsList>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          {/* Filter Bar */}
          {renderFilterBar()}

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Lưới
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Bảng
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateTask()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo nhiệm vụ
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Đang tải danh sách nhân viên...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && staff.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có nhân viên nào
              </h3>
              <p className="text-gray-500 mb-4">
                Bắt đầu bằng cách thêm nhân viên đầu tiên vào hệ thống.
              </p>
              <Button onClick={() => setShowStaffForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Thêm nhân viên đầu tiên
              </Button>
            </div>
          )}

          {/* Staff Content */}
          {!isLoading && staff.length > 0 && (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staff.map(renderStaffCard)}
                </div>
              ) : (
                renderStaffTable()
              )}
            </>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Nhiệm vụ đang thực hiện</h2>
            <Button onClick={() => handleCreateTask()}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo nhiệm vụ mới
            </Button>
          </div>
          {renderTasksList()}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Lịch làm việc
            </h3>
            <p className="text-gray-500">
              Tính năng quản lý lịch làm việc sẽ được phát triển trong phiên bản
              tiếp theo.
            </p>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Thống kê & Phân tích
            </h3>
            <p className="text-gray-500">
              Dashboard phân tích hiệu suất nhân viên sẽ được triển khai sớm.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <StaffFormDialog
        isOpen={showStaffForm}
        onClose={() => {
          setShowStaffForm(false);
          selectStaffMember(null);
        }}
        staff={selectedStaff}
      />

      <TaskFormDialog
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setSelectedStaffForTask(null);
        }}
        staff={selectedStaffForTask}
      />
    </div>
  );
};
