import type { Room } from '@/types/common.types';
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

export const RecentRequestCard: React.FC<RecentRequestCardProps> = ({ request, onViewDetails, onDismiss }) => {
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
