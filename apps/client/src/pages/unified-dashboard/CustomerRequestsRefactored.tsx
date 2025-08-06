/**
 * Customer Requests - Refactored with Request Management Domain
 * Redux-based implementation replacing context and local state
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { logger } from "@shared/utils/logger";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  MapPin,
  MessageSquare,
  RefreshCw,
  Send,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// ========================================
// Domain Imports - NEW Redux Architecture
// ========================================
import {
  CustomerRequest,
  REQUEST_STATUS_OPTIONS,
  RequestMessage,
  formatRequestDate,
  getRequestStatusColor,
  getTimeElapsed,
  // useRequestManagement, // TEMPORARILY DISABLED
  useRequestMessages,
  // useRequestRealtime, // TEMPORARILY DISABLED
  useRequestStatus,
} from "../../domains/request-management";

// ========================================
// Utility Functions
// ========================================

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Đã ghi nhận":
      return <Clock className="h-3 w-3" />;
    case "Đang xử lý":
      return <AlertCircle className="h-3 w-3" />;
    case "Hoàn thành":
      return <CheckCircle className="h-3 w-3" />;
    default:
      return <AlertCircle className="h-3 w-3" />;
  }
};

// ========================================
// Sub-Components
// ========================================

interface RequestDetailModalProps {
  request: CustomerRequest;
  isOpen: boolean;
  onClose: () => void;
  onOpenMessage: () => void;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  onOpenMessage,
}) => {
  const { updateStatus, isUpdating } = useRequestStatus();
  const [selectedStatus, setSelectedStatus] = useState(request.status);

  useEffect(() => {
    setSelectedStatus(request.status);
  }, [request.status]);

  const handleStatusUpdate = async () => {
    if (selectedStatus !== request.status) {
      try {
        await updateStatus(request.id, selectedStatus);
        logger.success("Request status updated successfully", "Component");
      } catch (error) {
        logger.error("Failed to update request status:", "Component", error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết yêu cầu #{request.id}</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết và cập nhật trạng thái yêu cầu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Guest Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Khách hàng
              </Label>
              <div className="flex items-center mt-1">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">{request.guestName}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Số phòng
              </Label>
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">{request.roomNumber}</span>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div>
            <Label className="text-sm font-medium text-gray-500">
              Loại yêu cầu
            </Label>
            <p className="mt-1 font-medium">{request.type}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">
              Nội dung yêu cầu
            </Label>
            <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-md">
              {request.requestContent}
            </p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-gray-500">Thời gian tạo</Label>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>{formatRequestDate(request.createdAt)}</span>
              </div>
            </div>
            <div>
              <Label className="text-gray-500">Cập nhật lần cuối</Label>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>{getTimeElapsed(request.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trạng thái hiện tại</Label>
              <Badge
                variant="outline"
                className={cn("mt-2", getRequestStatusColor(request.status))}
              >
                {getStatusIcon(request.status)}
                <span className="ml-1">{request.status}</span>
              </Badge>
            </div>
            <div>
              <Label>Cập nhật trạng thái</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_STATUS_OPTIONS.filter((opt) => opt !== "Tất cả").map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleStatusUpdate}
              disabled={selectedStatus === request.status || isUpdating}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isUpdating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
            </Button>
            <Button variant="outline" onClick={onOpenMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Nhắn tin với khách
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface MessageModalProps {
  request: CustomerRequest;
  isOpen: boolean;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  request,
  isOpen,
  onClose,
}) => {
  const { messages, messageLoading, isSending, loadMessages, sendNewMessage } =
    useRequestMessages(request.id);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (isOpen && request.id) {
      loadMessages();
    }
  }, [isOpen, request.id, loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendNewMessage({
        requestId: request.id,
        content: newMessage.trim(),
      });
      setNewMessage("");
      logger.success("Message sent successfully", "Component");
    } catch (error) {
      logger.error("Failed to send message:", "Component", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Trò chuyện với {request.guestName} - Phòng {request.roomNumber}
          </DialogTitle>
          <DialogDescription>
            Gửi tin nhắn trực tiếp đến khách hàng về yêu cầu này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Messages List */}
          <div className="h-80 overflow-y-auto border rounded-md p-4 space-y-3">
            {messageLoading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="ml-2">Đang tải tin nhắn...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Chưa có tin nhắn nào
              </div>
            ) : (
              messages.map((message: RequestMessage) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "staff"
                      ? "justify-end"
                      : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                      message.sender === "staff"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800",
                    )}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatRequestDate(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="sm"
              className="self-end"
            >
              <Send className="h-4 w-4" />
              {isSending ? "Đang gửi..." : "Gửi"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ========================================
// Main Component
// ========================================

export const CustomerRequestsRefactored: React.FC = () => {
  useAuth();

  // ========================================

  // ========================================

  // Test import trước khi sử dụng
  try {
    const {
      useRequestManagement,
    } = require("../../domains/request-management/index");
    console.log(
      "🔍 [DEBUG] useRequestManagement imported:",
      typeof useRequestManagement,
    );
  } catch (error) {
    console.error("❌ [DEBUG] Import failed:", error);
  }

  // ========================================
  // Redux Domain Hooks - NEW Architecture
  // ========================================
  const {
    requests,
    requestCounts,
    selectedRequest,
    filters,
    isLoading,
    error,
    loadRequests,
    selectRequest,
    updateFilters,
    clearFilters,
    clearCurrentError,
    setupAutoRefresh,
  } = useRequestManagement();

  // Set up real-time updates
  useRequestRealtime();

  // ========================================
  // Local State for UI
  // ========================================
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ========================================
  // Effects
  // ========================================

  // Load requests on mount
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Set up auto-refresh
  useEffect(() => {
    const cleanup = setupAutoRefresh(30000); // Refresh every 30 seconds
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

  const handleViewRequest = (request: CustomerRequest) => {
    selectRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    selectRequest(null);
  };

  const handleOpenMessageModal = () => {
    setShowDetailModal(false);
    setShowMessageModal(true);
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    selectRequest(null);
  };

  const handleRefresh = () => {
    loadRequests();
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilters({ [key]: value });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  // ========================================
  // Render Methods
  // ========================================

  const renderRequestCard = (request: CustomerRequest) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {request.guestName} - Phòng {request.roomNumber}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("text-xs", getRequestStatusColor(request.status))}
          >
            {getStatusIcon(request.status)}
            <span className="ml-1">{request.status}</span>
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-600">
          {request.type} • {getTimeElapsed(request.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-700 mb-4 line-clamp-2">
          {request.requestContent}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewRequest(request)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Xem chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFilterBar = () => (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Label htmlFor="status-filter" className="text-sm font-medium">
          Trạng thái:
        </Label>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-40" id="status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REQUEST_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="start-date" className="text-sm font-medium">
          Từ ngày:
        </Label>
        <Input
          type="date"
          id="start-date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange("startDate", e.target.value)}
          className="w-40"
        />
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="end-date" className="text-sm font-medium">
          Đến ngày:
        </Label>
        <Input
          type="date"
          id="end-date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange("endDate", e.target.value)}
          className="w-40"
        />
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Tìm kiếm:
        </Label>
        <Input
          type="text"
          id="search"
          placeholder="Tên khách, số phòng..."
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
          className="w-48"
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
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

  // ========================================
  // Main Render
  // ========================================

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
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
                    loadRequests();
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
            Yêu cầu khách hàng
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các yêu cầu từ khách hàng
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            Tổng: <strong>{requestCounts.all}</strong>
          </span>
          <span>
            Đang chờ: <strong>{requestCounts.pending}</strong>
          </span>
          <span>
            Hoàn thành: <strong>{requestCounts.completed}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      {renderFilterBar()}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải yêu cầu...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && requests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MessageSquare className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có yêu cầu nào
          </h3>
          <p className="text-gray-500">
            Chưa có yêu cầu nào từ khách hàng hoặc không có yêu cầu nào phù hợp
            với bộ lọc.
          </p>
        </div>
      )}

      {/* Requests Grid */}
      {!isLoading && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(renderRequestCard)}
        </div>
      )}

      {/* Modals */}
      {selectedRequest && (
        <>
          <RequestDetailModal
            request={selectedRequest}
            isOpen={showDetailModal}
            onClose={handleCloseDetailModal}
            onOpenMessage={handleOpenMessageModal}
          />
          <MessageModal
            request={selectedRequest}
            isOpen={showMessageModal}
            onClose={handleCloseMessageModal}
          />
        </>
      )}
    </div>
  );
};
