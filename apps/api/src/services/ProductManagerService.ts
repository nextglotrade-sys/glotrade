import User from '../models/User';
import bcrypt from 'bcryptjs';
import { generateSecurePassword, generateUsername } from '../utils/passwordGenerator';
import EmailService from './EmailService';

export interface CreateProductManagerData {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    createdBy: string; // Admin user ID
}

export class ProductManagerService {
    /**
     * Create a new Product Manager account
     */
    async createProductManager(data: CreateProductManagerData) {
        // Check if email already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            throw new Error('Email already in use');
        }

        // Generate credentials
        const temporaryPassword = generateSecurePassword(12);
        const username = await this.generateUniqueUsername(data.email);
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);

        // Create user
        const productManager = await User.create({
            email: data.email,
            username,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            passwordHash,
            role: 'product_manager',
            accountCreatedByAdmin: true,
            createdBy: data.createdBy,
            mustChangePassword: false, // No password change required per user requirements
            emailVerified: true, // Admin-created accounts are pre-verified
        });

        // Send welcome email
        await this.sendWelcomeEmail({
            email: data.email,
            firstName: data.firstName,
            username,
            temporaryPassword,
        });

        return {
            userId: productManager._id,
            email: productManager.email,
            username: productManager.username,
            role: productManager.role,
        };
    }

    /**
     * Generate a unique username from email
     */
    private async generateUniqueUsername(email: string): Promise<string> {
        let username = generateUsername(email);
        let attempts = 0;
        const maxAttempts = 10;

        // Ensure username is unique
        while (attempts < maxAttempts) {
            const existing = await User.findOne({ username });
            if (!existing) {
                return username;
            }
            username = generateUsername(email);
            attempts++;
        }

        throw new Error('Unable to generate unique username');
    }

    /**
     * Send welcome email with login credentials
     */
    private async sendWelcomeEmail(data: {
        email: string;
        firstName: string;
        username: string;
        temporaryPassword: string;
    }) {
        const loginUrl = process.env.APP_ORIGIN || 'http://localhost:3000';
        const credentialCodeStyle = "display:inline-block;background:#e9ecef;padding:4px 8px;border-radius:4px;font-family:monospace;font-size:15px;white-space:nowrap;word-break:keep-all;letter-spacing:0.04em;";

        const htmlContent = `
      <p>Hello <strong>${data.firstName}</strong>,</p>
      
      <p>Your Product Manager account has been created. You now have access to manage products on the Glotrade platform.</p>
      
      <div style="background: #f8f9fa; border-left: 4px solid #2EA5FF; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #2EA5FF;">🔑 Your Login Credentials</h3>
        <p style="margin: 10px 0;"><strong>Login URL:</strong> <a href="${loginUrl}/auth/login" style="color: #2EA5FF;">${loginUrl}/auth/login</a></p>
        <p style="margin: 10px 0;"><strong>Username:</strong> <code style="${credentialCodeStyle}">${data.username}</code></p>
        <p style="margin: 10px 0;"><strong>Email:</strong> <code style="${credentialCodeStyle}">${data.email}</code></p>
        <p style="margin: 10px 0;"><strong>Password:</strong> <code style="${credentialCodeStyle}">${data.temporaryPassword}</code></p>
        <p style="margin: 12px 0 0; font-size: 13px; color: #6c757d;">Copy the password exactly as shown above. It does not contain spaces.</p>
      </div>
      
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0;"><strong>⚠️ Important Security Notice:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Please keep your credentials secure</li>
          <li>Do not share your password with anyone</li>
        </ul>
      </div>
      
      <h3 style="color: #2EA5FF;">✅ What You Can Do</h3>
      <ul style="padding-left: 20px;">
        <li>Create and manage products</li>
        <li>Update product information and pricing</li>
        <li>Delete products when needed</li>
        <li>Manage product inventory</li>
        <li>Upload product images</li>
      </ul>
      
      <p>If you have any questions, please contact your administrator.</p>
      
      <p>Best regards,<br><strong>The Glotrade Team</strong></p>
    `;

        await EmailService.sendEmail({
            to: data.email,
            subject: 'Welcome to Glotrade - Product Manager Account',
            html: htmlContent,
            text: [
                `Hello ${data.firstName},`,
                '',
                'Your Product Manager account has been created.',
                `Login URL: ${loginUrl}/auth/login`,
                `Username: ${data.username}`,
                `Email: ${data.email}`,
                `Password: ${data.temporaryPassword}`,
                '',
                'Copy the password exactly as shown above. It does not contain spaces.',
            ].join('\n'),
            cta: {
                label: 'Login Now',
                url: `${loginUrl}/auth/login`
            }
        });
    }

    /**
     * List all Product Managers
     */
    async listProductManagers() {
        return User.find({ role: 'product_manager' })
            .select('email username firstName lastName isBlocked lastSeen createdAt createdBy')
            .populate('createdBy', 'email username')
            .sort({ createdAt: -1 });
    }

    /**
     * Get Product Manager by ID
     */
    async getProductManagerById(id: string) {
        const user = await User.findById(id)
            .select('email username firstName lastName phone isBlocked lastSeen createdAt createdBy role')
            .populate('createdBy', 'email username');

        if (!user || user.role !== 'product_manager') {
            throw new Error('Product Manager not found');
        }

        return user;
    }

    /**
     * Reset Product Manager password
     */
    async resetPassword(userId: string) {
        const user = await User.findById(userId);
        if (!user || user.role !== 'product_manager') {
            throw new Error('Product Manager not found');
        }

        const newPassword = generateSecurePassword(12);
        const passwordHash = await bcrypt.hash(newPassword, 10);

        user.passwordHash = passwordHash;
        user.mustChangePassword = false; // No forced password change per requirements
        // validateBeforeSave: false — avoids cart.qty max:5 validation on unrelated fields
        await user.save({ validateBeforeSave: false });

        // Send reset email
        const loginUrl = process.env.APP_ORIGIN || 'http://localhost:3000';

        await EmailService.sendEmail({
            to: user.email,
            subject: 'Password Reset - Glotrade Product Manager',
            html: `
        <p>Hello <strong>${user.firstName}</strong>,</p>
        <p>Your password has been reset by an administrator.</p>
        <div style="background: #f8f9fa; border-left: 4px solid #2EA5FF; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0;"><strong>New Password:</strong> <code style="display:inline-block;background:#e9ecef;padding:4px 8px;border-radius:4px;font-family:monospace;font-size:15px;white-space:nowrap;word-break:keep-all;letter-spacing:0.04em;">${newPassword}</code></p>
          <p style="margin: 12px 0 0; font-size: 13px; color: #6c757d;">Copy the password exactly as shown above. It does not contain spaces.</p>
        </div>
        <p>Please login with your new password.</p>
      `,
            text: [
                `Hello ${user.firstName},`,
                '',
                'Your password has been reset by an administrator.',
                `Login URL: ${loginUrl}/auth/login`,
                `New Password: ${newPassword}`,
                '',
                'Copy the password exactly as shown above. It does not contain spaces.',
            ].join('\n'),
            cta: {
                label: 'Login Now',
                url: `${loginUrl}/auth/login`
            }
        });

        return { message: 'Password reset email sent successfully' };
    }

    /**
     * Send account revocation email
     */
    private async sendDeletionEmail(data: {
        email: string;
        firstName?: string;
    }) {
        const adminEmail = 'admin@glotrade.online';
        const supportEmail = 'support@glotrade.online';

        await EmailService.sendEmail({
            to: data.email,
            subject: 'Glotrade Product Manager Access Removed',
            html: `
        <p>Hello <strong>${data.firstName || 'there'}</strong>,</p>
        <p>Your Product Manager account access on Glotrade has been removed by an administrator.</p>
        <div style="background: #fff5f5; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; color: #7f1d1d;"><strong>Access Update:</strong> You can no longer sign in with this Product Manager account.</p>
        </div>
        <p>If you believe this was done in error or you need access restored, please contact <a href="mailto:${adminEmail}" style="color: #2EA5FF;">${adminEmail}</a> or <a href="mailto:${supportEmail}" style="color: #2EA5FF;">${supportEmail}</a>.</p>
        <p>Best regards,<br><strong>The Glotrade Team</strong></p>
      `,
            text: [
                `Hello ${data.firstName || 'there'},`,
                '',
                'Your Product Manager account access on Glotrade has been removed by an administrator.',
                'You can no longer sign in with this Product Manager account.',
                '',
                `If you believe this was done in error or you need access restored, please contact ${adminEmail} or ${supportEmail}.`,
            ].join('\n'),
        });
    }

    /**
     * Delete Product Manager (soft delete)
     */
    async deleteProductManager(userId: string, deletedBy: string) {
        const user = await User.findOne({
            _id: userId,
            role: 'product_manager',
            isDeleted: { $ne: true },
        }).select('email firstName');

        if (!user) {
            throw new Error('Product Manager not found');
        }

        const result = await User.updateOne(
            {
                _id: userId,
                role: 'product_manager',
                isDeleted: { $ne: true },
            },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy,
                },
            }
        );

        if (result.matchedCount === 0) {
            throw new Error('Product Manager not found');
        }

        try {
            await this.sendDeletionEmail({
                email: user.email,
                firstName: user.firstName,
            });
        } catch (error) {
            console.error('[ProductManagerService] Failed to send deletion email:', error);
        }

        return { message: 'Product Manager deleted successfully' };
    }

    /**
     * Update Product Manager
     */
    async updateProductManager(userId: string, updates: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        isBlocked?: boolean;
    }) {
        const user = await User.findById(userId);
        if (!user || user.role !== 'product_manager') {
            throw new Error('Product Manager not found');
        }

        if (updates.firstName) user.firstName = updates.firstName;
        if (updates.lastName) user.lastName = updates.lastName;
        if (updates.phone !== undefined) user.phone = updates.phone;
        if (updates.isBlocked !== undefined) user.isBlocked = updates.isBlocked;

        // validateBeforeSave: false — avoids cart.qty max:5 validation on unrelated fields
        await user.save({ validateBeforeSave: false });

        return {
            userId: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            isBlocked: user.isBlocked,
        };
    }
}
