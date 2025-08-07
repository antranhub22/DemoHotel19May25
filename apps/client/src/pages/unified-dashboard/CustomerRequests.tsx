import * as React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import logger from '@shared/utils/logger';
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
  Search,
  Send,
  Trash2,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Types
interface CustomerRequest {
  id: number;
  type: string;
  roomNumber: string;
  orderId: string;
  guestName: string;
  requestContent: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  sender: 'staff' | 'guest';
  content: string;
  time: string;
}

// Status options và colors
const statusOptions = [
  'Tất cả',
  'Đã ghi nhận',
  'Đang thực hiện',
  'Đã thực hiện và đang bàn giao cho khách',
  'Hoàn thiện',
  'Lưu ý khác',
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Đã ghi nhận':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'Đang thực hiện':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Đã thực hiện và đang bàn giao cho khách':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Hoàn thiện':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Lưu ý khác':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Đã ghi nhận':
      return <Clock className="h-3 w-3" />;
    case 'Đang thực hiện':
      return <AlertCircle className="h-3 w-3" />;
    case 'Đã thực hiện và đang bàn giao cho khách':
      return <RefreshCw className="h-3 w-3" />;
    case 'Hoàn thiện':
      return <CheckCircle className="h-3 w-3" />;
    case 'Lưu ý khác':
      return <AlertCircle className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

// Request detail modal component
const RequestDetailModal = ({
  request,
  isOpen,
  onClose,
  onStatusChange,
  onOpenMessage,
}: {
  request: CustomerRequest;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onOpenMessage: () => void;
}) => {
  const [selectedStatus, setSelectedStatus] = useState(request.status);

  const handleStatusUpdate = () => {
    if (selectedStatus !== request.status) {
      onStatusChange(selectedStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Phòng {request.roomNumber} - {request.orderId}
          </DialogTitle>
          <DialogDescription>Chi tiết yêu cầu khách hàng</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Khách hàng</Label>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-gray-500" />
                <span>{request.guestName}</span>
              </div>
            </div>
            <div>
              <Label>Thời gian tạo</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{new Date(request.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Request content */}
          <div>
            <Label>Nội dung yêu cầu</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
              {request.requestContent}
            </div>
          </div>

          {/* Status update */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trạng thái hiện tại</Label>
              <Badge
                variant="outline"
                className={cn('mt-2', getStatusColor(request.status))}
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
                  {statusOptions
                    .filter(opt => opt !== 'Tất cả')
                    .map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleStatusUpdate}
              disabled={selectedStatus === request.status}
            >
              <Edit className="h-4 w-4 mr-2" />
              Cập nhật trạng thái
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

// Message modal component
const MessageModal = ({
  request,
  messages,
  isOpen,
  onClose,
  onSendMessage,
  loading,
}: {
  request: CustomerRequest;
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  loading: boolean;
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Tin nhắn với khách - Phòng {request.roomNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Messages */}
          <div className="h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Chưa có tin nhắn nào
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    msg.sender === 'staff' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[70%] p-2 rounded-lg text-sm',
                      msg.sender === 'staff'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={cn(
                        'text-xs mt-1',
                        msg.sender === 'staff'
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      )}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Send message */}
          <div className="space-y-2">
            <Textarea
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim() || loading}
                size="sm"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Gửi
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Customer Requests component
export const CustomerRequests: React.FC = () => {
  useAuth();
  const {} = useWebSocket(); // Initialize WebSocket connection
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<CustomerRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Get auth headers
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/requests', {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        // Handle unauthorized
        logger.error('Unauthorized access', 'Component');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      logger.error('Failed to fetch requests:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  // Update request status
  const updateRequestStatus = async (requestId: number, status: string) => {
    try {
      await fetch(`/api/staff/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      // Update local state
      setRequests(prev =>
        prev.map(r => (r.id === requestId ? { ...r, status } : r))
      );

      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    } catch (error) {
      logger.error('Failed to update status:', 'Component', error);
    }
  };

  // Fetch messages
  const fetchMessages = async (requestId: number) => {
    try {
      const response = await fetch(
        `/api/staff/requests/${requestId}/messages`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      logger.error('Failed to fetch messages:', 'Component', error);
      setMessages([]);
    }
  };

  // Send message
  const sendMessage = async (content: string) => {
    if (!selectedRequest) {
      return;
    }

    setMessageLoading(true);
    try {
      await fetch(`/api/staff/requests/${selectedRequest.id}/message`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
      });

      // Add message to local state
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'staff',
        content,
        time: new Date().toLocaleTimeString().slice(0, 5),
      };
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      logger.error('Failed to send message:', 'Component', error);
    } finally {
      setMessageLoading(false);
    }
  };

  // Delete all requests
  const deleteAllRequests = async () => {
    if (deletePassword !== '2208') {
      setDeleteError('Mật khẩu không đúng');
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch('/api/staff/requests/all', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (result.success) {
        setRequests([]);
        setDeletePassword('');
        setDeleteError('');
      } else {
        setDeleteError(result.error || 'Không thể xóa requests');
      }
    } catch (error) {
      logger.error('Error deleting requests:', 'Component', error);
      setDeleteError('Đã xảy ra lỗi khi xóa requests');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    // Status filter
    if (statusFilter !== 'Tất cả' && request.status !== statusFilter) {
      return false;
    }

    // Date filter
    if (startDate || endDate) {
      const requestDate = new Date(request.createdAt);
      if (startDate && requestDate < new Date(startDate)) {
        return false;
      }
      if (endDate && requestDate > new Date(`${endDate}T23:59:59`)) {
        return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        request.roomNumber.toLowerCase().includes(query) ||
        request.guestName.toLowerCase().includes(query) ||
        request.requestContent.toLowerCase().includes(query) ||
        request.orderId.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // ✅ NEW: WebSocket event listener for real-time updates
  useEffect(() => {
    // Set up global function for WebSocket to call
    (window as any).updateRequestStatus = (data: any) => {
      logger.debug(
        '📡 [CustomerRequests] WebSocket request update received:',
        'Component',
        data
      );

      if (data.type === 'new-request') {
        // Add new request to the list
        const newRequest: CustomerRequest = {
          id: data.requestId,
          type: data.orderType || 'Service Request',
          roomNumber: data.roomNumber || 'N/A',
          orderId: `REQ-${data.requestId}`,
          guestName: data.guestName || 'Guest',
          requestContent: data.requestContent || 'New service request',
          status: data.status || 'Đã ghi nhận',
          createdAt: data.timestamp || new Date().toISOString(),
          updatedAt: data.timestamp || new Date().toISOString(),
        };

        setRequests(prev => [newRequest, ...prev]);
        logger.success(
          '✅ [CustomerRequests] New request added to dashboard',
          'Component',
          {
            requestId: data.requestId,
            roomNumber: data.roomNumber,
          }
        );
      } else if (data.type === 'status-change') {
        // Update existing request status
        setRequests(prev =>
          prev.map(request =>
            request.id === data.requestId
              ? {
                  ...request,
                  status: data.status,
                  updatedAt: data.timestamp,
                  assignedTo: data.assignedTo,
                }
              : request
          )
        );
        logger.success(
          '✅ [CustomerRequests] Request status updated',
          'Component',
          {
            requestId: data.requestId,
            newStatus: data.status,
          }
        );
      }
    };

    // Cleanup function
    return () => {
      (window as any).updateRequestStatus = undefined;
    };
  }, []);

  // Load requests on component mount
  useEffect(() => {
    fetchRequests();

    // Auto-refresh every 60 seconds (reduced frequency since we have real-time updates)
    const interval = setInterval(fetchRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle request detail modal
  const handleRequestDetail = (request: CustomerRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  // Handle message modal
  const handleOpenMessage = async () => {
    if (!selectedRequest) {
      return;
    }

    setShowMessageModal(true);
    await fetchMessages(selectedRequest.id);
  };

  const handleCloseMessage = () => {
    setShowMessageModal(false);
    setMessages([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Yêu cầu khách hàng</h1>
          <p className="text-gray-600">
            Quản lý và xử lý các yêu cầu từ khách hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRequests} disabled={loading}>
            <RefreshCw
              className={cn('h-4 w-4 mr-2', loading && 'animate-spin')}
            />
            Làm mới
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={requests.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa tất cả
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Xác nhận xóa tất cả requests
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này sẽ xóa tất cả yêu cầu và không thể hoàn tác. Vui
                  lòng nhập mật khẩu để xác nhận:
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu xác nhận"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  className={deleteError ? 'border-red-500' : ''}
                />
                {deleteError && (
                  <p className="text-red-500 text-sm mt-1">{deleteError}</p>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                >
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAllRequests}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteLoading ? 'Đang xóa...' : 'Xóa tất cả'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status filter */}
            <div>
              <Label>Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date filters */}
            <div>
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>

            {/* Search */}
            <div>
              <Label>Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo phòng, khách..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Clear filters */}
          {(statusFilter !== 'Tất cả' ||
            startDate ||
            endDate ||
            searchQuery) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('Tất cả');
                  setStartDate('');
                  setEndDate('');
                  setSearchQuery('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Đang chờ</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'Đã ghi nhận').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Đang xử lý</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'Đang thực hiện').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Hoàn thành</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'Hoàn thiện').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Tổng cộng</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
          <CardDescription>
            Hiển thị {filteredRequests.length} / {requests.length} yêu cầu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Đang tải...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có yêu cầu nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map(request => (
                  <Card
                    key={request.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold">
                              Phòng {request.roomNumber}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {request.orderId}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {request.guestName}
                            </span>
                            <Calendar className="h-4 w-4 text-gray-500 ml-4" />
                            <span className="text-sm text-gray-600">
                              {new Date(request.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-sm text-gray-800 mb-3 line-clamp-2">
                            {request.requestContent}
                          </p>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                getStatusColor(request.status)
                              )}
                            >
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status}</span>
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestDetail(request)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Chi tiết
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              handleOpenMessage();
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Nhắn tin
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedRequest && (
        <>
          <RequestDetailModal
            request={selectedRequest}
            isOpen={showDetailModal}
            onClose={handleCloseDetail}
            onStatusChange={status =>
              updateRequestStatus(selectedRequest.id, status)
            }
            onOpenMessage={handleOpenMessage}
          />

          <MessageModal
            request={selectedRequest}
            messages={messages}
            isOpen={showMessageModal}
            onClose={handleCloseMessage}
            onSendMessage={sendMessage}
            loading={messageLoading}
          />
        </>
      )}
    </div>
  );
};
