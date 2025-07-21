import React from 'react';
import { Button } from './ui/button';

interface WelcomePopupProps {
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans">
      <div
        className="bg-gradient-to-br from-[rgba(255,255,255,0.7)] to-[rgba(255,255,255,0.5)] dark:from-[rgba(30,30,30,0.7)] dark:to-[rgba(30,30,30,0.5)] text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border border-white/30"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Vietnamese Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-amber-400 font-poppins">
              Nội dung
            </h2>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="target">
                  🎯
                </span>{' '}
                MỤC ĐÍCH:
              </h3>
              <p className="pl-6 text-gray-700 dark:text-gray-300">
                Thay thế cho nhân sự lễ tân bằng AI Voice Assistant được đào tạo
                riêng với thông tin và dịch vụ của một khách sạn cụ thể.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="money">
                  💰
                </span>{' '}
                GIÁ TRỊ MANG LẠI:
              </h3>
              <ul className="list-inside list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Phục vụ đa ngôn ngữ – không cần thông dịch viên</li>
                <li>Hoạt động 24/7 – không bao giờ nghỉ</li>
                <li>Xử lý đồng thời nhiều khách cùng lúc</li>
                <li>Tăng doanh thu dịch vụ thông qua gợi ý thông minh</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="speech bubble">
                  🗣️
                </span>{' '}
                ĐẶC ĐIỂM NỔI BẬT:
              </h3>
              <p className="pl-6 text-gray-700 dark:text-gray-300">
                Voice Bot – Bạn NÓI CHUYỆN với AI, không cần gõ phím!
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="bell">
                  🔔
                </span>{' '}
                CHỨC NĂNG CỦA AI VOICE BOT:
              </h3>
              <ul className="list-inside list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Đặt phòng & Check-in/out</li>
                <li>Room Service & Housekeeping</li>
                <li>Tour bookings & Vé xe buýt</li>
                <li>Thông tin du lịch địa phương</li>
                <li>Homestay & Đổi tiền, giặt ủi</li>
              </ul>
              <p className="pl-6 text-xs italic text-gray-600 dark:text-gray-400 mt-1">
                *Tất cả dịch vụ này sẽ do khách sạn cung cấp
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="microphone">
                  🎤
                </span>{' '}
                CÁCH SỬ DỤNG:
              </h3>
              <p className="pl-6 text-gray-700 dark:text-gray-300">
                Nhấn mic → NÓI yêu cầu → Nhận phản hồi bằng giọng nói
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="light bulb">
                  💡
                </span>{' '}
                THỬ NGAY (6 ngôn ngữ để trải nghiệm):
              </h3>
              <div className="pl-6 text-gray-700 dark:text-gray-300 italic">
                <p>"Đặt phòng cho 2 người tối nay"</p>
                <p>"Order breakfast to room 101"</p>
                <p>"Book tour Fairy Stream tomorrow"</p>
              </div>
            </div>
          </div>

          {/* English Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-amber-400 font-poppins">
              Content
            </h2>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="target">
                  🎯
                </span>{' '}
                PURPOSE:
              </h3>
              <p className="pl-6 text-gray-700 dark:text-gray-300">
                Replace human receptionists with an AI Voice Assistant trained
                with the specific information and services of a hotel.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="money">
                  💰
                </span>{' '}
                VALUE PROPOSITION:
              </h3>
              <ul className="list-inside list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Serves multiple languages – no interpreter needed</li>
                <li>Operates 24/7 – never takes a break</li>
                <li>Handles multiple guests simultaneously</li>
                <li>Increases service revenue through smart suggestions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="speech bubble">
                  🗣️
                </span>{' '}
                HIGHLIGHT:
              </h3>
              <p className="pl-6 text-gray-700 dark:text-gray-300">
                Voice Bot – You SPEAK with AI, no typing needed!
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="bell">
                  🔔
                </span>{' '}
                AI VOICE BOT FEATURES:
              </h3>
              <ul className="list-inside list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Booking & Check-in/out</li>
                <li>Room Service & Housekeeping</li>
                <li>Tour bookings & Bus tickets</li>
                <li>Local tourism information</li>
                <li>Homestay & Currency exchange, laundry</li>
              </ul>
              <p className="pl-6 text-xs italic text-gray-600 dark:text-gray-400 mt-1">
                *All these services are provided by the hotel
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="microphone">
                  🎤
                </span>{' '}
                HOW TO USE:
              </h3>
              <p className="pl-6 text-gray-700 dark:text-gray-300">
                Press mic → SPEAK request → Receive voice response
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                <span role="img" aria-label="light bulb">
                  💡
                </span>{' '}
                TRY NOW (6 languages to experience):
              </h3>
              <div className="pl-6 text-gray-700 dark:text-gray-300 italic">
                <p>"Book a room for 2 people tonight"</p>
                <p>"Order breakfast to room 101"</p>
                <p>"Book tour Fairy Stream tomorrow"</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={onClose}
            className="font-bold text-lg bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-8 py-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            Đóng / Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
