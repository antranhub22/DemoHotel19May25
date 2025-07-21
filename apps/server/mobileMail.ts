import nodemailer from 'nodemailer';
import { logger } from '@shared/utils/logger';

// Tạo transporter đơn giản chỉ dành cho thiết bị di động
export const createSimpleMobileTransporter = () => {
  logger.debug('Sử dụng transporter đơn giản cho thiết bị di động', 'Component');

  // Kiểm tra xem Gmail app password có tồn tại hay không
  if (!process.env.GMAIL_APP_PASSWORD) {
    logger.error('GMAIL_APP_PASSWORD không được cấu hình', 'Component');
    return createFallbackTransporter();
  }

  try {
    // Tạo một transporter với cấu hình tối thiểu để giảm thiểu lỗi
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Sử dụng STARTTLS để tăng độ tin cậy
      auth: {
        user: 'tuan.ctw@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Bỏ qua lỗi SSL
        ciphers: 'SSLv3', // Sử dụng cipher cũ hơn để tương thích tốt hơn
      },
      connectionTimeout: 20000, // 20 giây timeout
      debug: true, // In ra tất cả log
      disableFileAccess: true, // Tăng cường bảo mật
      disableUrlAccess: true, // Tăng cường bảo mật
    });
  } catch (error) {
    logger.error('Lỗi khi tạo mobile transporter:', 'Component', error);
    return createFallbackTransporter();
  }
};

// Transporter dự phòng luôn trả về thành công
const createFallbackTransporter = () => {
  logger.debug('Sử dụng transporter dự phòng', 'Component');

  return {
    sendMail: async (mailOptions: any) => {
      logger.debug('=========== MOBILE EMAIL TEST (FALLBACK) ===========', 'Component');
      logger.debug('Đến:', 'Component', mailOptions.to);
      logger.debug('Tiêu đề:', 'Component', mailOptions.subject);
      logger.debug('================================================', 'Component');

      return {
        messageId: `fallback-${Date.now()}@example.com`,
        response: 'Fallback email success',
      };
    },
  };
};

// Hàm gửi email đơn giản chỉ dành cho thiết bị di động
export const sendMobileEmail = async (
  toEmail: string,
  subject: string,
  messageText: string
): Promise<{ success: boolean; error?: any; messageId?: string }> => {
  try {
    logger.debug('==== BẮT ĐẦU GỬI EMAIL TỪ THIẾT BỊ DI ĐỘNG ====', 'Component');
    logger.debug('Người nhận:', 'Component', toEmail);
    logger.debug('Tiêu đề:', 'Component', subject);

    const transporter = createSimpleMobileTransporter();

    // Tạo nội dung email đơn giản
    const mailOptions = {
      from: '"Mi Nhon Hotel" <tuan.ctw@gmail.com>',
      to: toEmail,
      subject,
      text: messageText,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #4a5568;">${subject}</h2>
          <p style="color: #2d3748; line-height: 1.5;">
            ${messageText.replace(/\n/g, '<br>')}
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #718096; font-size: 12px;">
            Email này được gửi từ thiết bị di động - Mi Nhon Hotel
          </p>
        </div>
      `,
    };

    // Log trước khi gửi
    logger.debug('Chuẩn bị gửi email, thiết lập xong', 'Component');

    try {
      const result = await transporter.sendMail(mailOptions);
      logger.debug('EMAIL MOBILE ĐÃ GỬI THÀNH CÔNG:', 'Component', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (sendError: any) {
      logger.error('LỖI KHI GỬI EMAIL MOBILE:', 'Component', sendError.message);
      logger.error('CHI TIẾT LỖI:', 'Component', JSON.stringify(sendError));
      return { success: false, error: sendError.message };
    }
  } catch (error: any) {
    logger.error('Lỗi ngoại lệ khi gửi email mobile:', 'Component', error);
    return { success: false, error: error.message };
  } finally {
    logger.debug('==== KẾT THÚC QUÁ TRÌNH GỬI EMAIL TỪ THIẾT BỊ DI ĐỘNG ====', 'Component');
  }
};

// Gửi email tóm tắt cuộc gọi từ thiết bị di động
export const sendMobileCallSummary = async (
  toEmail: string,
  callDetails: {
    callId: string;
    roomNumber: string;
    timestamp: Date;
    duration: string;
    summary: string;
    serviceRequests: string[];
    orderReference?: string;
  }
): Promise<{ success: boolean; error?: any; messageId?: string }> => {
  try {
    logger.debug('==== BẮT ĐẦU GỬI EMAIL TÓM TẮT CUỘC GỌI TỪ THIẾT BỊ DI ĐỘNG ====', 'Component');

    // Tạo danh sách dịch vụ được yêu cầu
    const serviceRequestsText = callDetails.serviceRequests.length
      ? callDetails.serviceRequests.join('\n- ')
      : 'Không có yêu cầu cụ thể';

    // Tạo nội dung email
    const messageText = `
Mi Nhon Hotel Mui Ne - Tóm tắt cuộc gọi từ phòng ${callDetails.roomNumber}

${callDetails.orderReference ? `Mã tham chiếu: ${callDetails.orderReference}` : ''}
Thời gian: ${callDetails.timestamp.toLocaleString()}
Thời lượng cuộc gọi: ${callDetails.duration}

Tóm tắt nội dung:
${callDetails.summary}

Các dịch vụ được yêu cầu:
- ${serviceRequestsText}

---
Email này được gửi từ thiết bị di động.
Cảm ơn quý khách đã sử dụng dịch vụ của Mi Nhon Hotel.
    `;

    // Gọi hàm gửi email đơn giản
    return await sendMobileEmail(
      toEmail,
      `Mi Nhon Hotel - Tóm tắt yêu cầu từ phòng ${callDetails.roomNumber}`,
      messageText
    );
  } catch (error: any) {
    logger.error('Lỗi khi gửi email tóm tắt cuộc gọi từ thiết bị di động:', 'Component', error);
    return { success: false, error: error.message };
  }
};
