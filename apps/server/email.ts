import nodemailer from 'nodemailer';
import { logger } from '@shared/utils/logger';

// Tạo một transporter test luôn trả về thành công (cho môi trường phát triển)
// Để khi gửi email bị lỗi, ứng dụng vẫn hoạt động bình thường
const createTestTransporter = () => {
  logger.debug('Sử dụng transporter test (không gửi email thực tế)', 'Component');

  return {
    sendMail: async (mailOptions: any) => {
      logger.debug('=================== TEST EMAIL ===================', 'Component');
      logger.debug('To:', 'Component', mailOptions.to);
      logger.debug('Subject:', 'Component', mailOptions.subject);
      logger.debug('From:', 'Component', mailOptions.from);
      logger.debug('Content type:', 'Component', mailOptions.html ? 'HTML' : 'Text');
      logger.debug('================= END TEST EMAIL =================', 'Component');

      // Trả về một kết quả giả lập thành công
      return {
        messageId: `test-${Date.now()}@example.com`,
        response: 'Test email sent successfully',
      };
    },
  };
};

// Cấu hình transporter cho email
export const createTransporter = () => {
  // Sử dụng nodemailer với Gmail SMTP hoặc test transporter
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    logger.warn('GMAIL_USER hoặc GMAIL_PASS không được cấu hình - sử dụng test transporter', 'Component');
    return createTestTransporter();
  }

  logger.debug('Sử dụng cấu hình Gmail SMTP', 'Component');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

// Gửi email xác nhận đặt dịch vụ
export const sendServiceConfirmation = async (
  toEmail: string,
  serviceDetails: {
    serviceType: string;
    roomNumber: string;
    timestamp: Date;
    details: string;
    orderReference?: string; // Thêm mã tham chiếu đơn hàng
  }
) => {
  try {
    // Chuẩn bị nội dung email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Mi Nhon Hotel Mui Ne</h2>
        <p style="text-align: center;">Xác nhận yêu cầu dịch vụ của quý khách</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        ${serviceDetails.orderReference ? `<p><strong>Mã đơn hàng:</strong> ${serviceDetails.orderReference}</p>` : ''}
        <p><strong>Loại dịch vụ:</strong> ${serviceDetails.serviceType}</p>
        <p><strong>Phòng:</strong> ${serviceDetails.roomNumber}</p>
        <p><strong>Thời gian yêu cầu:</strong> ${serviceDetails.timestamp.toLocaleString()}</p>
        <p><strong>Chi tiết:</strong></p>
        <p style="padding: 10px; background-color: #f9f9f9; border-radius: 5px;">${serviceDetails.details}</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="text-align: center; color: #777; font-size: 14px;">
          Cảm ơn quý khách đã lựa chọn Mi Nhon Hotel Mui Ne.<br>
          Nếu cần hỗ trợ, vui lòng liên hệ lễ tân hoặc gọi số nội bộ 0.
        </p>
      </div>
    `;

    logger.debug('Gửi email với Gmail SMTP', 'Component');

    // Tạo bản ghi log
    const emailLog = {
      timestamp: new Date(),
      toEmail,
      subject: `Mi Nhon Hotel - Xác nhận đặt dịch vụ từ phòng ${serviceDetails.roomNumber}`,
      status: 'pending',
      details: serviceDetails,
    };

    // Lưu log vào console
    logger.debug('EMAIL LOG:', 'Component', JSON.stringify(emailLog, null, 2));

    // Sử dụng nodemailer thay vì Mailjet trực tiếp
    // Gmail SMTP là một lựa chọn tốt khi Mailjet không hoạt động
    try {
      // Thử sử dụng Mailjet trước
      const transporter = createTransporter();

      // Địa chỉ email gửi đi
      const fromEmail = 'tuan.ctw@gmail.com';

      const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: `Mi Nhon Hotel - Xác nhận đặt dịch vụ từ phòng ${serviceDetails.roomNumber}`,
        html: emailHtml,
      };

      const result = await transporter.sendMail(mailOptions);
      logger.debug('Email đã gửi thành công:', 'Component', result.response);

      // Cập nhật log
      emailLog.status = 'sent';
      logger.debug('EMAIL LOG (cập nhật):', 'Component', JSON.stringify(emailLog, null, 2));

      return { success: true, messageId: result.messageId };
    } catch (emailError: unknown) {
      logger.error('Lỗi khi gửi email qua Gmail SMTP:', 'Component', emailError);

      // Cập nhật log
      emailLog.status = 'failed';
      logger.debug('EMAIL LOG (thất bại):', 'Component', JSON.stringify(emailLog, null, 2));

      // Lưu lỗi vào console với định dạng dễ đọc
      logger.debug('============ CHI TIẾT LỖI GỬI EMAIL ============', 'Component');
      logger.debug('Thời gian:', 'Component', new Date().toISOString());
      logger.debug('Người nhận:', 'Component', toEmail);
      logger.debug('Tiêu đề:', 'Component', `Mi Nhon Hotel - Xác nhận đặt dịch vụ từ phòng ${serviceDetails.roomNumber}`);
      logger.debug('Lỗi:', 'Component', emailError instanceof Error ? emailError.message : String(emailError)
      );
      logger.debug('===================================================', 'Component');

      throw emailError;
    }
  } catch (error) {
    logger.error('Lỗi khi gửi email:', 'Component', error);
    return { success: false, error };
  }
};

// Gửi email tóm tắt cuộc gọi
export const sendCallSummary = async (
  toEmail: string,
  callDetails: {
    callId: string;
    roomNumber: string;
    timestamp: Date;
    duration: string;
    summary: string;
    serviceRequests: string[];
    orderReference?: string; // Thêm mã tham chiếu đơn hàng
  }
) => {
  try {
    // Tạo danh sách dịch vụ được yêu cầu
    const serviceRequestsHtml = callDetails.serviceRequests.length
      ? callDetails.serviceRequests.map(req => `<li>${req}</li>`).join('')
      : '<li>Không có yêu cầu cụ thể</li>';

    // Chuẩn bị nội dung email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Mi Nhon Hotel Mui Ne</h2>
        <p style="text-align: center;">Tóm tắt cuộc gọi với trợ lý ảo</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        ${callDetails.orderReference ? `<p><strong>Mã tham chiếu:</strong> ${callDetails.orderReference}</p>` : ''}
        <p><strong>Phòng:</strong> ${callDetails.roomNumber}</p>
        <p><strong>Thời gian:</strong> ${callDetails.timestamp.toLocaleString()}</p>
        <p><strong>Thời lượng cuộc gọi:</strong> ${callDetails.duration}</p>
        
        <p><strong>Tóm tắt nội dung:</strong></p>
        <p style="padding: 10px; background-color: #f9f9f9; border-radius: 5px;">${callDetails.summary}</p>
        
        <p><strong>Các dịch vụ được yêu cầu:</strong></p>
        <ul style="padding-left: 20px;">
          ${serviceRequestsHtml}
        </ul>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="text-align: center; color: #777; font-size: 14px;">
          Cảm ơn quý khách đã lựa chọn Mi Nhon Hotel Mui Ne.<br>
          Nếu cần hỗ trợ, vui lòng liên hệ lễ tân hoặc gọi số nội bộ 0.
        </p>
      </div>
    `;

    logger.debug('Gửi email tóm tắt với Gmail SMTP', 'Component');

    // Tạo bản ghi log
    const emailLog = {
      timestamp: new Date(),
      toEmail,
      subject: `Mi Nhon Hotel - Tóm tắt yêu cầu từ phòng ${callDetails.roomNumber}`,
      status: 'pending',
      details: {
        roomNumber: callDetails.roomNumber,
        orderReference: callDetails.orderReference,
        duration: callDetails.duration,
        serviceCount: callDetails.serviceRequests.length,
      },
    };

    // Lưu log vào console
    logger.debug('EMAIL LOG:', 'Component', JSON.stringify(emailLog, null, 2));

    try {
      // Thử sử dụng transporter được cấu hình
      const transporter = createTransporter();

      // Địa chỉ email gửi đi, sử dụng email được xác thực
      const fromEmail = 'tuan.ctw@gmail.com';

      const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: `Mi Nhon Hotel - Tóm tắt yêu cầu từ phòng ${callDetails.roomNumber}`,
        html: emailHtml,
      };

      const result = await transporter.sendMail(mailOptions);
      logger.debug('Email tóm tắt đã gửi thành công:', 'Component', result.response);

      // Cập nhật log
      emailLog.status = 'sent';
      logger.debug('EMAIL LOG (cập nhật):', 'Component', JSON.stringify(emailLog, null, 2));

      return { success: true, messageId: result.messageId };
    } catch (emailError: unknown) {
      logger.error('Lỗi khi gửi email tóm tắt qua Gmail SMTP:', 'Component', emailError);

      // Cập nhật log
      emailLog.status = 'failed';
      logger.debug('EMAIL LOG (thất bại):', 'Component', JSON.stringify(emailLog, null, 2));

      // Lưu thông tin tóm tắt vào console để người dùng có thể xem
      logger.debug('============ THÔNG TIN TÓM TẮT CUỘC GỌI ============', 'Component');
      logger.debug('Thời gian:', 'Component', callDetails.timestamp.toLocaleString());
      logger.debug('Phòng:', 'Component', callDetails.roomNumber);
      logger.debug('Thời lượng:', 'Component', callDetails.duration);
      logger.debug('Mã tham chiếu:', 'Component', callDetails.orderReference || 'Không có');
      logger.debug('Tóm tắt nội dung:', 'Component');
      console.log(callDetails.summary);
      logger.debug('Các dịch vụ được yêu cầu:', 'Component');
      callDetails.serviceRequests.forEach((req, index) => {
        logger.debug('  ${index + 1}. ${req}', 'Component');
      });
      logger.debug('===================================================', 'Component');

      throw emailError;
    }
  } catch (error) {
    logger.error('Lỗi khi gửi email tóm tắt:', 'Component', error);
    return { success: false, error };
  }
};
