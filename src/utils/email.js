// email.js - Updated version
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Updated to accept options object
export const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `"IoT Lab" <${process.env.EMAIL_FROM}>`,
            to: options.email,
            subject: options.subject,
            html: options.message || options.html,
            text: options.text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};