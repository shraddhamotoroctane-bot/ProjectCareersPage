import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Send application confirmation email to the applicant
 */
export async function sendApplicationConfirmation(
    applicantEmail: string,
    fullName: string,
    position: string,
    phone: string
): Promise<{ success: boolean; messageId?: string; error?: any }> {
    // Split name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const mailOptions = {
        from: {
            name: process.env.EMAIL_FROM_NAME || 'MotorOctane Careers Team',
            address: process.env.EMAIL_USER!
        },
        to: applicantEmail,
        subject: `Application Received - ${position} at MotorOctane`,
        html: getEmailTemplate(firstName, lastName, position, applicantEmail, phone),
        text: getPlainTextEmail(firstName, lastName, position, applicantEmail, phone) // Fallback for non-HTML clients
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email send error:', error);
        return { success: false, error };
    }
}

/**
 * Generate HTML email template
 */
function getEmailTemplate(
    firstName: string,
    lastName: string,
    position: string,
    email: string,
    phone: string
): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f4f4f4;
        }
        .email-wrapper { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
        }
        .header { 
          background: linear-gradient(135deg, #8B2222 0%, #B22222 100%);
          color: white; 
          padding: 40px 20px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: bold;
          letter-spacing: 1px;
        }
        .header p { 
          margin: 8px 0 0 0; 
          font-size: 14px; 
          opacity: 0.9;
        }
        .content { 
          padding: 40px 30px; 
        }
        .greeting { 
          font-size: 20px; 
          color: #8B2222; 
          margin-bottom: 20px;
          font-weight: 600;
        }
        .message { 
          font-size: 16px; 
          margin-bottom: 20px;
          color: #555;
        }
        .info-box { 
          background: #f9f9f9; 
          padding: 20px; 
          margin: 25px 0; 
          border-left: 4px solid #8B2222;
          border-radius: 4px;
        }
        .info-box h3 { 
          margin: 0 0 15px 0; 
          color: #8B2222; 
          font-size: 18px;
        }
        .info-box ul { 
          list-style: none; 
          padding: 0; 
        }
        .info-box li { 
          padding: 8px 0; 
          border-bottom: 1px solid #e0e0e0;
          font-size: 15px;
        }
        .info-box li:last-child { 
          border-bottom: none; 
        }
        .info-box strong { 
          color: #333; 
          font-weight: 600;
          display: inline-block;
          min-width: 80px;
        }
        .section-title { 
          color: #8B2222; 
          font-size: 18px; 
          margin: 30px 0 15px 0;
          font-weight: 600;
        }
        .timeline { 
          background: #fff3cd; 
          padding: 15px 20px; 
          border-radius: 4px;
          margin: 20px 0;
          border-left: 4px solid #ffc107;
        }
        .timeline strong { 
          color: #856404; 
        }
        .links { 
          margin: 20px 0; 
        }
        .links ul { 
          list-style: none; 
          padding: 0; 
        }
        .links li { 
          padding: 6px 0; 
        }
        .links a { 
          color: #8B2222; 
          text-decoration: none; 
          font-weight: 500;
        }
        .links a:hover { 
          text-decoration: underline; 
        }
        .signature { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 2px solid #f0f0f0;
          font-size: 15px;
        }
        .footer { 
          background: #2c2c2c; 
          color: #ccc; 
          padding: 30px 20px; 
          text-align: center; 
          font-size: 13px;
        }
        .footer a { 
          color: #8B2222; 
          text-decoration: none; 
          margin: 0 10px;
          font-weight: 500;
        }
        .footer a:hover { 
          text-decoration: underline; 
        }
        .footer-brand { 
          font-size: 16px; 
          font-weight: bold; 
          color: white;
          margin-bottom: 10px;
        }
        .disclaimer { 
          color: #999; 
          font-size: 11px; 
          margin-top: 20px; 
          line-height: 1.5;
        }
        .checkmark { 
          color: #28a745; 
          font-size: 20px; 
        }
        @media only screen and (max-width: 600px) {
          .content { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .greeting { font-size: 18px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
          <h1>🚗 MotorOctane</h1>
          <p>India's Leading Automotive Community</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          <div class="greeting">
            Dear ${firstName}${lastName ? ' ' + lastName : ''},
          </div>
          
          <p class="message">
            Thank you for applying for the <strong>${position}</strong> position at MotorOctane!
          </p>
          
          <p class="message">
            We have successfully received your application and our hiring team will review it carefully. 
            We appreciate your interest in joining India's premier automotive community.
          </p>
          
          <!-- Application Summary Box -->
          <div class="info-box">
            <h3>📋 Application Summary</h3>
            <ul>
              <li><strong>Position:</strong> ${position}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Phone:</strong> ${phone}</li>
              <li><strong>Resume:</strong> <span class="checkmark">✓</span> Received</li>
            </ul>
          </div>
          
          <!-- Timeline -->
          <h3 class="section-title">⏳ What Happens Next?</h3>
          <div class="timeline">
            Our hiring team will review your application within <strong>5-7 business days</strong>. 
            If your qualifications match our requirements, we'll reach out to schedule an interview.
          </div>
          
          <!-- Additional Links -->
          <h3 class="section-title">🔗 In the Meantime</h3>
          <p class="message">Feel free to explore more about us:</p>
          <div class="links">
            <ul>
              <li>🏠 <a href="https://motoroctane.com">Visit Our Website</a></li>
              <li>📰 <a href="https://motoroctane.com/news">Read Latest Automotive News</a></li>
              <li>🎥 <a href="https://motoroctane.com/videos">Watch Our Video Content</a></li>
              <li>🚘 <a href="https://carconsultancy.in/home">Explore Car Consultancy</a></li>
            </ul>
          </div>
          
          <!-- Signature -->
          <div class="signature">
            <p>We appreciate your interest in joining our team and look forward to reviewing your application!</p>
            <p style="margin-top: 15px;">
              <strong>Best regards,</strong><br>
              The MotorOctane Careers Team
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-brand">MotorOctane</div>
          <p>India's Leading Automotive Community</p>
          <p style="margin-top: 15px;">
            <a href="https://motoroctane.com">Website</a> |
            <a href="https://careers.motoroctane.com">Careers</a> |
            <a href="https://motoroctane.com/news">News</a> |
            <a href="https://motoroctane.com/videos">Videos</a>
          </p>
          <div class="disclaimer">
            This is an automated message. Please do not reply to this email.<br>
            If you have questions, please contact us through our website.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email (fallback for non-HTML clients)
 */
function getPlainTextEmail(
    firstName: string,
    lastName: string,
    position: string,
    email: string,
    phone: string
): string {
    return `
Dear ${firstName}${lastName ? ' ' + lastName : ''},

Thank you for applying for the ${position} position at MotorOctane!

We have successfully received your application and our hiring team will review it carefully.

APPLICATION SUMMARY:
- Position: ${position}
- Email: ${email}
- Phone: ${phone}
- Resume: Received ✓

WHAT HAPPENS NEXT?
Our hiring team will review your application within 5-7 business days. If your qualifications match our requirements, we'll reach out to schedule an interview.

IN THE MEANTIME:
Feel free to explore more about us:
- Visit Our Website: https://motoroctane.com
- Latest News: https://motoroctane.com/news
- Video Content: https://motoroctane.com/videos
- Car Consultancy: https://carconsultancy.in/home

We appreciate your interest in joining our team and look forward to reviewing your application!

Best regards,
The MotorOctane Careers Team

---
MotorOctane - India's Leading Automotive Community
Website: https://motoroctane.com
Careers: https://careers.motoroctane.com

This is an automated message. Please do not reply to this email.
If you have questions, please contact us through our website.
  `;
}
