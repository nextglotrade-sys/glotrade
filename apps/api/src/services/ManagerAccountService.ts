import User from '../models/User';
import bcrypt from 'bcryptjs';
import { generateSecurePassword, generateUsername } from '../utils/passwordGenerator';
import EmailService from './EmailService';

export type ManagerRole = 'product_manager' | 'order_manager' | 'insured_partners_manager' | 'bazaar_manager';

export const MANAGER_ROLES: ManagerRole[] = ['product_manager', 'order_manager', 'insured_partners_manager', 'bazaar_manager'];

export interface CreateManagerAccountData {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: ManagerRole;
    assignedRoles?: ManagerRole[];
    createdBy: string;
}

const ROLE_LABELS: Record<ManagerRole, string> = {
    product_manager: 'Product Manager',
    order_manager: 'Order Manager',
    insured_partners_manager: 'Insured Partners Manager',
    bazaar_manager: 'Trade Fair Manager',
};

const ROLE_CAPABILITIES: Record<ManagerRole, string[]> = {
    product_manager: [
        'Create and manage products',
        'Update product information and pricing',
        'Delete products when needed',
        'Manage product inventory',
        'Upload product images',
    ],
    order_manager: [
        'View and manage orders',
        'Update order statuses',
        'Review order details',
        'Cancel eligible orders',
        'Process refunds when required',
    ],
    insured_partners_manager: [
        'View insured partner portfolios',
        'Manage GDCs and TPIA records',
        'Create and manage trade cycles',
        'Maintain insured commodity settings',
        'Review insurance claims and commodity prices',
    ],
    bazaar_manager: [
        'Manage GloTrade International Trade Fair 2026 configurations',
        'Review stall bookings, ticket sales & sponsorship entries',
        'Process promoter commissions and record payout receipts',
        'Suspend, approve, or reject stall booking applications',
        'Access Trade Fair management & reporting dashboard',
    ],
};

const ROLE_WORKSPACE_PATHS: Record<ManagerRole, string> = {
    product_manager: '/admin/products',
    order_manager: '/admin/orders',
    insured_partners_manager: '/admin/gdip',
    bazaar_manager: '/admin/trade-fair',
};

export class ManagerAccountService {
    private getRoleLabel(role: ManagerRole): string {
        return ROLE_LABELS[role];
    }

    private async generateUniqueUsername(email: string): Promise<string> {
        let username = generateUsername(email);
        let attempts = 0;

        while (attempts < 10) {
            const existing = await User.findOne({ username });
            if (!existing) return username;
            username = generateUsername(email);
            attempts++;
        }

        throw new Error('Unable to generate unique username');
    }

    private async sendWelcomeEmail(data: {
        email: string;
        firstName: string;
        username: string;
        temporaryPassword: string;
        role: ManagerRole;
    }) {
        const loginUrl = process.env.APP_ORIGIN || 'http://localhost:3000';
        const workspaceUrl = `${loginUrl}${ROLE_WORKSPACE_PATHS[data.role]}`;
        const roleLabel = this.getRoleLabel(data.role);
        const credentialCodeStyle = "display:inline-block;background:#e9ecef;padding:4px 8px;border-radius:4px;font-family:monospace;font-size:15px;white-space:nowrap;word-break:keep-all;letter-spacing:0.04em;";
        const capabilityList = ROLE_CAPABILITIES[data.role]
            .map((capability) => `<li>${capability}</li>`)
            .join('');

        await EmailService.sendEmail({
            to: data.email,
            subject: `Welcome to Glotrade - ${roleLabel} Account`,
            html: `
      <p>Hello <strong>${data.firstName}</strong>,</p>
      <p>Your ${roleLabel} account has been created. You now have access only to your assigned management workspace on Glotrade.</p>
      <div style="background: #f8f9fa; border-left: 4px solid #2EA5FF; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #2EA5FF;">🔑 Your Login Credentials</h3>
        <p style="margin: 10px 0;"><strong>Login URL:</strong> <a href="${loginUrl}/auth/login" style="color: #2EA5FF;">${loginUrl}/auth/login</a></p>
        <p style="margin: 10px 0;"><strong>Workspace:</strong> <a href="${workspaceUrl}" style="color: #2EA5FF;">${workspaceUrl}</a></p>
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
          <li>This account only has access to the ${roleLabel.toLowerCase()} workspace</li>
        </ul>
      </div>
      <h3 style="color: #2EA5FF;">✅ What You Can Do</h3>
      <ul style="padding-left: 20px;">${capabilityList}</ul>
      <p>If you have any questions, please contact admin@glotrade.online or support@glotrade.online.</p>
      <p>Best regards,<br><strong>The Glotrade Team</strong></p>
    `,
            text: [
                `Hello ${data.firstName},`,
                '',
                `Your ${roleLabel} account has been created.`,
                `Login URL: ${loginUrl}/auth/login`,
                `Workspace: ${workspaceUrl}`,
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

    private async sendResetEmail(data: {
        email: string;
        firstName?: string;
        newPassword: string;
        role: ManagerRole;
    }) {
        const loginUrl = process.env.APP_ORIGIN || 'http://localhost:3000';
        const roleLabel = this.getRoleLabel(data.role);

        await EmailService.sendEmail({
            to: data.email,
            subject: `Password Reset - Glotrade ${roleLabel}`,
            html: `
        <p>Hello <strong>${data.firstName || 'there'}</strong>,</p>
        <p>Your ${roleLabel.toLowerCase()} password has been reset by an administrator.</p>
        <div style="background: #f8f9fa; border-left: 4px solid #2EA5FF; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0;"><strong>New Password:</strong> <code style="display:inline-block;background:#e9ecef;padding:4px 8px;border-radius:4px;font-family:monospace;font-size:15px;white-space:nowrap;word-break:keep-all;letter-spacing:0.04em;">${data.newPassword}</code></p>
          <p style="margin: 12px 0 0; font-size: 13px; color: #6c757d;">Copy the password exactly as shown above. It does not contain spaces.</p>
        </div>
        <p>Please login with your new password at <a href="${loginUrl}/auth/login" style="color: #2EA5FF;">${loginUrl}/auth/login</a>.</p>
      `,
            text: [
                `Hello ${data.firstName || 'there'},`,
                '',
                `Your ${roleLabel.toLowerCase()} password has been reset by an administrator.`,
                `Login URL: ${loginUrl}/auth/login`,
                `New Password: ${data.newPassword}`,
                '',
                'Copy the password exactly as shown above. It does not contain spaces.',
            ].join('\n'),
            cta: {
                label: 'Login Now',
                url: `${loginUrl}/auth/login`
            }
        });
    }

    private async sendRoleUpdateEmail(data: {
        email: string;
        firstName?: string;
        assignedRoles: ManagerRole[];
    }) {
        const loginUrl = process.env.APP_ORIGIN || 'http://localhost:3000';
        const roleLabelsList = data.assignedRoles
            .map((r) => this.getRoleLabel(r))
            .join(', ');

        const roleWorkspacesList = data.assignedRoles
            .map((r) => `<li><strong>${this.getRoleLabel(r)}:</strong> <a href="${loginUrl}${ROLE_WORKSPACE_PATHS[r]}" style="color: #2EA5FF;">${loginUrl}${ROLE_WORKSPACE_PATHS[r]}</a></li>`)
            .join('');

        await EmailService.sendEmail({
            to: data.email,
            subject: `Glotrade - Your Manager Account Roles Have Been Updated`,
            html: `
        <p>Hello <strong>${data.firstName || 'there'}</strong>,</p>
        <p>An administrator has updated your manager account permissions on Glotrade.</p>
        <div style="background: #f8f9fa; border-left: 4px solid #2EA5FF; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #2EA5FF;">📋 Assigned Manager Roles</h3>
          <p style="margin: 10px 0;"><strong>Active Roles:</strong> ${roleLabelsList}</p>
        </div>
        <h3 style="color: #2EA5FF;">🔗 Assigned Workspaces</h3>
        <ul style="padding-left: 20px;">${roleWorkspacesList}</ul>
        <p>Log in to access your assigned management workspaces at <a href="${loginUrl}/auth/login" style="color: #2EA5FF;">${loginUrl}/auth/login</a>.</p>
        <p>Best regards,<br><strong>The Glotrade Team</strong></p>
      `,
            text: [
                `Hello ${data.firstName || 'there'},`,
                '',
                `An administrator has updated your manager account permissions on Glotrade.`,
                `Assigned Roles: ${roleLabelsList}`,
                `Login URL: ${loginUrl}/auth/login`,
            ].join('\n'),
            cta: {
                label: 'Access Workspace',
                url: `${loginUrl}/auth/login`
            }
        });
    }

    private async sendDeletionEmail(data: {
        email: string;
        firstName?: string;
        role: ManagerRole;
    }) {
        const adminEmail = 'admin@glotrade.online';
        const supportEmail = 'support@glotrade.online';
        const roleLabel = this.getRoleLabel(data.role);

        await EmailService.sendEmail({
            to: data.email,
            subject: `Glotrade ${roleLabel} Access Removed`,
            html: `
        <p>Hello <strong>${data.firstName || 'there'}</strong>,</p>
        <p>Your ${roleLabel.toLowerCase()} account access on Glotrade has been removed by an administrator.</p>
        <div style="background: #fff5f5; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; color: #7f1d1d;"><strong>Access Update:</strong> You can no longer sign in with this ${roleLabel} account.</p>
        </div>
        <p>If you believe this was done in error or you need access restored, please contact <a href="mailto:${adminEmail}" style="color: #2EA5FF;">${adminEmail}</a> or <a href="mailto:${supportEmail}" style="color: #2EA5FF;">${supportEmail}</a>.</p>
        <p>Best regards,<br><strong>The Glotrade Team</strong></p>
      `,
            text: [
                `Hello ${data.firstName || 'there'},`,
                '',
                `Your ${roleLabel.toLowerCase()} account access on Glotrade has been removed by an administrator.`,
                `You can no longer sign in with this ${roleLabel} account.`,
                '',
                `If you believe this was done in error or you need access restored, please contact ${adminEmail} or ${supportEmail}.`,
            ].join('\n'),
        });
    }

    async createManager(data: CreateManagerAccountData) {
        const normalizedEmail = data.email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail })
            .setOptions({ includeDeleted: false });

        const assignedRoles = data.assignedRoles && data.assignedRoles.length > 0
            ? data.assignedRoles
            : [data.role];

        // ── PROMOTE EXISTING USER ────────────────────────────────────────────
        if (existingUser) {
            const currentRole = existingUser.role as string;

            // Block promoting admins or super admins
            if (currentRole === 'admin' || existingUser.isSuperAdmin) {
                throw new Error('This account is an administrator and cannot be assigned a manager role.');
            }

            // Block promoting someone who is already a manager (use Edit Roles instead)
            if (MANAGER_ROLES.includes(currentRole as ManagerRole)) {
                throw new Error(
                    `This user is already a manager (${ROLE_LABELS[currentRole as ManagerRole] || currentRole}). ` +
                    `Use "Edit Roles" on the Manager Accounts page to update their roles.`
                );
            }

            // Promote the existing buyer/seller to manager
            existingUser.role = data.role as any;
            existingUser.assignedRoles = assignedRoles as any;
            if (data.firstName && !existingUser.firstName) existingUser.firstName = data.firstName;
            if (data.lastName && !existingUser.lastName) existingUser.lastName = data.lastName;
            if (data.phone && !existingUser.phone) existingUser.phone = data.phone;
            // validateBeforeSave: false — avoids cart.qty max:5 validation on unrelated fields
            await existingUser.save({ validateBeforeSave: false });

            // Notify the user about their new role access
            try {
                await this.sendRoleUpdateEmail({
                    email: normalizedEmail,
                    firstName: existingUser.firstName || data.firstName,
                    assignedRoles,
                });
            } catch (err) {
                console.error('[ManagerAccountService] Failed to send promotion email:', err);
            }

            return {
                userId: existingUser._id,
                email: existingUser.email,
                username: existingUser.username,
                role: existingUser.role,
                assignedRoles: existingUser.assignedRoles,
                promoted: true, // flag so the frontend can show a different message
            };
        }

        // ── CREATE NEW MANAGER ACCOUNT ────────────────────────────────────────
        const temporaryPassword = generateSecurePassword(12);
        const username = await this.generateUniqueUsername(data.email);
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);

        let manager;
        try {
            manager = await User.create({
                email: normalizedEmail,
                username,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                passwordHash,
                role: data.role,
                assignedRoles,
                accountCreatedByAdmin: true,
                createdBy: data.createdBy,
                mustChangePassword: false,
                emailVerified: true,
            });
        } catch (error: any) {
            if (error?.code === 11000 && error?.keyPattern?.email) {
                throw new Error('A user with this email already exists. Please use a different email address.');
            }
            throw error;
        }

        await this.sendWelcomeEmail({
            email: normalizedEmail,
            firstName: data.firstName,
            username,
            temporaryPassword,
            role: data.role,
        });

        return {
            userId: manager._id,
            email: manager.email,
            username: manager.username,
            role: manager.role,
            assignedRoles: manager.assignedRoles,
            promoted: false,
        };
    }

    async listManagers(role?: ManagerRole) {
        const query = role ? { $or: [{ role }, { assignedRoles: role }] } : { $or: [{ role: { $in: MANAGER_ROLES } }, { assignedRoles: { $elemMatch: { $in: MANAGER_ROLES } } }] };
        return User.find(query)
            .select('email username firstName lastName role assignedRoles isBlocked lastSeen createdAt createdBy')
            .populate('createdBy', 'email username')
            .sort({ createdAt: -1 });
    }

    async getManagerById(id: string) {
        const user = await User.findById(id)
            .select('email username firstName lastName phone role isBlocked lastSeen createdAt createdBy')
            .populate('createdBy', 'email username');

        if (!user || !MANAGER_ROLES.includes(user.role as ManagerRole)) {
            throw new Error('Manager account not found');
        }

        return user;
    }

    async resetPassword(userId: string) {
        const user = await User.findById(userId);
        if (!user || !MANAGER_ROLES.includes(user.role as ManagerRole)) {
            throw new Error('Manager account not found');
        }

        const newPassword = generateSecurePassword(12);
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.mustChangePassword = false;
        // validateBeforeSave: false — avoids cart.qty max:5 validation on unrelated fields
        await user.save({ validateBeforeSave: false });

        await this.sendResetEmail({
            email: user.email,
            firstName: user.firstName,
            newPassword,
            role: user.role as ManagerRole,
        });

        return { message: 'Password reset email sent successfully' };
    }

    async deleteManager(userId: string, deletedBy: string) {
        const user = await User.findOne({
            _id: userId,
            role: { $in: MANAGER_ROLES },
            isDeleted: { $ne: true },
        }).select('email firstName role');

        if (!user) {
            throw new Error('Manager account not found');
        }

        const result = await User.updateOne(
            {
                _id: userId,
                role: { $in: MANAGER_ROLES },
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
            throw new Error('Manager account not found');
        }

        try {
            await this.sendDeletionEmail({
                email: user.email,
                firstName: user.firstName,
                role: user.role as ManagerRole,
            });
        } catch (error) {
            console.error('[ManagerAccountService] Failed to send deletion email:', error);
        }

        return { message: 'Manager account deleted successfully' };
    }

    async updateManager(userId: string, updates: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        isBlocked?: boolean;
        assignedRoles?: ManagerRole[];
    }) {
        const user = await User.findById(userId);
        if (!user || (!MANAGER_ROLES.includes(user.role as ManagerRole) && !user.assignedRoles?.some(r => MANAGER_ROLES.includes(r as ManagerRole)))) {
            throw new Error('Manager account not found');
        }

        if (updates.firstName) user.firstName = updates.firstName;
        if (updates.lastName) user.lastName = updates.lastName;
        if (updates.phone !== undefined) user.phone = updates.phone;
        if (updates.isBlocked !== undefined) user.isBlocked = updates.isBlocked;
        if (updates.assignedRoles && updates.assignedRoles.length > 0) {
            user.assignedRoles = updates.assignedRoles;
            user.role = updates.assignedRoles[0] as any;
            try {
                await this.sendRoleUpdateEmail({
                    email: user.email,
                    firstName: user.firstName,
                    assignedRoles: updates.assignedRoles,
                });
            } catch (err) {
                console.error('[ManagerAccountService] Failed to send role update email:', err);
            }
        }
        // validateBeforeSave: false — avoids cart.qty max:5 validation on unrelated fields
        await user.save({ validateBeforeSave: false });

        return {
            userId: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            assignedRoles: user.assignedRoles,
            isBlocked: user.isBlocked,
        };
    }
}
