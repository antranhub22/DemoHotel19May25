import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  User,
} from 'lucide-react';
import React from 'react';

interface RecentRequest {
  id: string | number;
  reference: string;
  roomNumber: string;
  guestName: string;
  requestContent: string;
  orderType: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  submittedAt: Date;
  estimatedTime?: string;
  items?: Array<{
    name: string;
    quantity: number;
    description?: string;
  }>;
}

interface RecentRequestCardProps {
  request: RecentRequest;
  onViewDetails?: () => void;
  onDismiss?: () => void;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Đang xử lý',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  'in-progress': {
    icon: Clock,
    label: 'Đang thực hiện',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  completed: {
    icon: CheckCircle,
    label: 'Hoàn thành',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  cancelled: {
    icon: CheckCircle,
    label: 'Đã hủy',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export const RecentRequestCard: React.FC<RecentRequestCardProps> = ({
  request,
  onViewDetails,
  onDismiss,
}) => {
  const config = statusConfig[request.status];
  const StatusIcon = config.icon;

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  };

  return (
    <div
      className={`
      relative w-full max-w-md mx-auto
      ${config.bgColor} ${config.borderColor}
      border-2 rounded-xl p-4 mb-4
      shadow-lg transition-all duration-300
      hover:shadow-xl hover:scale-[1.02]
    `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${config.color}`} />
          <span className={`font-semibold text-sm ${config.color}`}>
            {config.label}
          </span>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Đóng"
          >
            ×
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Reference & Time */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono text-gray-600">#{request.reference}</span>
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{formatTime(request.submittedAt)}</span>
          </div>
        </div>

        {/* Room & Guest */}
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Phòng {request.roomNumber}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{request.guestName}</span>
          </div>
        </div>

        {/* Request Content */}
        <div className="flex items-start gap-2">
          <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-800 font-medium mb-1">
              {request.orderType}
            </p>
            <p className="text-xs text-gray-600 line-clamp-2">
              {request.requestContent}
            </p>
          </div>
        </div>

        {/* Items (if any) */}
        {request.items && request.items.length > 0 && (
          <div className="bg-white/50 rounded-lg p-2">
            <p className="text-xs font-medium text-gray-700 mb-1">
              Chi tiết yêu cầu:
            </p>
            <div className="space-y-1">
              {request.items.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-xs text-gray-600"
                >
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                </div>
              ))}
              {request.items.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{request.items.length - 3} mục khác...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Estimated Time */}
        {request.estimatedTime && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Thời gian dự kiến:</span>{' '}
            {request.estimatedTime}
          </div>
        )}
      </div>

      {/* Actions */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className={`
            mt-4 w-full py-2 px-4 rounded-lg
            text-sm font-medium transition-colors
            ${config.color} border ${config.borderColor}
            hover:bg-white/50
          `}
        >
          Xem chi tiết
        </button>
      )}
    </div>
  );
};

export default RecentRequestCard;
