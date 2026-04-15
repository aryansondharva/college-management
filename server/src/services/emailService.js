const nodemailer = require('nodemailer');

// Create a transporter (using Gmail for example)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose) => {
    try {
        const subject = purpose === 'email_update' 
            ? 'Verify Your New Email Address - College Management System'
            : 'Verify Your Email - College Management System';
        
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #333; margin: 0;">College Management System</h2>
                        <p style="color: #666; margin: 5px 0 0 0;">Email Verification</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="color: #333; margin: 0 0 10px 0; font-size: 16px;">Your verification code is:</p>
                        <div style="display: inline-block; background-color: #007bff; color: white; padding: 15px 25px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                            ${otp}
                        </div>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <p style="color: #666; margin: 0; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
                        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                        <p style="color: #999; margin: 0; font-size: 12px;">© 2026 College Management System. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"College Management System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}: ${otp}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail
};
