import { Wallet, WalletTransaction, User } from "../models";
import { BaseService } from "./BaseService";
import { IWallet } from "../models/Wallet";
import { IWalletTransaction } from "../models/WalletTransaction";
import { PaymentService } from "./PaymentService";
import { PaystackProvider } from "./providers/PaystackProvider";
import { FlutterwaveProvider } from "./providers/FlutterwaveProvider";
import { NotificationService } from "./NotificationService";
import { realTimeNotificationService } from "./RealTimeNotificationService";
import mongoose from "mongoose";

export interface WalletBalance {
  available: number;
  frozen: number;
  total: number;
  currency: "NGN";
  creditLimit?: number;
  creditUsed?: number;
}

export interface WalletSummary {
  ngnWallet: WalletBalance;
  totalValue: number; // in NGN
}

export interface TopUpRequest {
  userId: string;
  amount: number; // in Naira
  currency: "NGN";
  provider: "paystack" | "flutterwave";
  returnUrl?: string;
}

export interface WithdrawalRequest {
  userId: string;
  amount: number; // in Naira
  bankAccount: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
  };
  provider: "paystack" | "flutterwave";
}

export interface TransferRequest {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: "NGN";
  description?: string;
}

export class WalletService extends BaseService<IWallet> {
  private paymentService: PaymentService;
  private providers: Record<string, any>;
  private notificationService: NotificationService;

  constructor() {
    super(Wallet);
    try {
      this.paymentService = new PaymentService({
        paystack: new PaystackProvider(),
        flutterwave: new FlutterwaveProvider(),
      });
      this.providers = {
        paystack: new PaystackProvider(),
        flutterwave: new FlutterwaveProvider(),
      };
      this.notificationService = new NotificationService();
    } catch (error) {
      console.error("Error initializing WalletService:", error);
      // Initialize with null providers to prevent server crash
      this.paymentService = null as any;
      this.providers = {};
      this.notificationService = new NotificationService();
    }
  }

  // Create wallet for a user (NGN only for wholesaler platform)
  async createUserWallets(userId: string): Promise<{ ngnWallet: IWallet | null }> {
    // Check if user is Wholesaler
    const user = await User.findById(userId);
    if (user?.businessInfo?.businessType === 'Wholesaler') {
      console.log(`Skipping wallet creation for Wholesaler: ${userId}`);
      return { ngnWallet: null };
    }

    const existingWallets = await this.model.find({ userId: new mongoose.Types.ObjectId(userId), type: "user" });
    if (existingWallets.length > 0) {
      throw new Error("Wallet already exists for this user");
    }

    const ngnWallet = await this.model.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: "user",
      currency: "NGN",
      balance: 0,
      frozenBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalSpent: 0,
      totalEarned: 0,
      status: "active",
    });

    return { ngnWallet };
  }

  // Create vendor wallets (DEPRECATED - single-vendor platform)
  // @deprecated This method is deprecated for single-vendor platform
  async createVendorWallets(userId: string): Promise<{ ngnWallet: IWallet }> {
    console.warn('[DEPRECATED] createVendorWallets is deprecated for single-vendor platform');
    const existingWallets = await this.model.find({ userId: new mongoose.Types.ObjectId(userId), type: "vendor" });
    if (existingWallets.length > 0) {
      throw new Error("Vendor wallet already exists for this user");
    }

    const ngnWallet = await this.model.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: "vendor",
      currency: "NGN",
      balance: 0,
      frozenBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalSpent: 0,
      totalEarned: 0,
      status: "active",
    });

    return { ngnWallet };
  }

  // Get wallet balance
  async getWalletBalance(userId: string, currency: "NGN", type: "user" | "vendor" = "user"): Promise<WalletBalance | null> {
    const wallet = await this.model.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      currency,
      type
    });

    // If wallet doesn't exist, create it automatically
    if (!wallet) {
      // Check if user is Wholesaler before auto-creating
      const user = await User.findById(userId);
      if (user?.businessInfo?.businessType === 'Wholesaler') {
        console.log(`Skipping auto-creation of wallet for Wholesaler: ${userId}`);
        return null;
      }

      const newWallet = await this.model.create({
        userId: new mongoose.Types.ObjectId(userId),
        type,
        currency,
        balance: 0,
        frozenBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalSpent: 0,
        totalEarned: 0,
        status: "active",
      });

      return {
        available: newWallet.balance,
        frozen: newWallet.frozenBalance,
        total: newWallet.balance + newWallet.frozenBalance,
        currency: newWallet.currency,
        creditLimit: 0,
        creditUsed: 0,
      };
    }

    return {
      available: wallet.balance,
      frozen: wallet.frozenBalance,
      total: wallet.balance + wallet.frozenBalance,
      currency: wallet.currency,
      creditLimit: wallet.creditLimit || 0,
      creditUsed: wallet.creditUsed || 0,
    };
  }

  // Get wallet summary for user (NGN only for wholesaler platform)
  async getWalletSummary(userId: string, type: "user" | "vendor" = "user"): Promise<WalletSummary | null> {
    try {
      const ngnWallet = await this.getWalletBalance(userId, "NGN", type);

      if (!ngnWallet) {
        return null;
      }

      return {
        ngnWallet,
        totalValue: ngnWallet.available,
      };
    } catch (error) {
      console.error(`[WalletService] Error getting wallet summary:`, error);
      throw error;
    }
  }

  // Add funds to wallet
  async addFunds(
    userId: string,
    amount: number,
    currency: "NGN",
    type: "user" | "vendor" = "user",
    description: string,
    metadata?: any,
    session?: any,
    category: string = "top_up"
  ): Promise<IWalletTransaction> {
    console.log(`addFunds called: userId=${userId}, amount=${amount}, currency=${currency}, type=${type}, category=${category}`);

    const wallet = await this.model.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      currency,
      type
    });
    if (!wallet) {
      console.error(`Wallet not found for user ${userId}, currency ${currency}, type ${type}`);
      throw new Error(`Wallet not found for user ${userId}`);
    }

    console.log(`Wallet found: ${wallet._id}, balance: ${wallet.balance}, status: ${wallet.status}`);

    if (wallet.status !== "active") {
      throw new Error("Wallet is not active");
    }

    const balanceBefore = wallet.balance;

    // Credit repayment logic
    let amountToBalance = amount;
    let amountToCredit = 0;

    if (wallet.creditUsed > 0) {
      amountToCredit = Math.min(wallet.creditUsed, amount);
      amountToBalance = amount - amountToCredit;
    }

    const balanceAfter = wallet.balance + amountToBalance;

    // Update wallet
    await this.model.updateOne(
      { _id: wallet._id },
      {
        balance: balanceAfter,
        $inc: { creditUsed: -amountToCredit },
        totalDeposited: wallet.totalDeposited + amount,
      },
      { session }
    );

    // Create transaction record
    const transactionData = {
      walletId: wallet._id,
      userId: new mongoose.Types.ObjectId(userId),
      type: "deposit",
      category: category,
      amount,
      currency,
      balanceBefore,
      balanceAfter,
      status: "completed",
      reference: `DEP_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      description,
      metadata: {
        ...metadata,
        idempotencyKey: metadata?.idempotencyKey || `deposit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      },
      processedAt: new Date(),
    };

    const [transaction] = await WalletTransaction.create([transactionData], { session });

    // Check for low balance after deduction
    await this.checkLowBalanceNotification(userId, currency, balanceAfter);

    // Send real-time updates
    await this.sendRealTimeWalletUpdate(userId, currency, transaction);

    return transaction;
  }

  // Deduct funds from wallet
  async deductFunds(
    userId: string,
    amount: number,
    currency: "NGN",
    type: "user" | "vendor" = "user",
    description: string,
    metadata?: any,
    session?: any,
    category: string = "order_payment"
  ): Promise<IWalletTransaction> {
    console.log(`deductFunds called: userId=${userId}, amount=${amount}, currency=${currency}, type=${type}, category=${category}`);

    // Atomically deduct to avoid race conditions
    const wallet = await this.model.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      currency,
      type
    });
    if (!wallet) {
      console.error(`Wallet not found for user ${userId}, currency ${currency}, type ${type}`);
      throw new Error(`Wallet not found for user ${userId}`);
    }

    if (wallet.status !== "active") {
      throw new Error("Wallet is not active");
    }

    // Check available funds (balance + available credit)
    const availableCredit = (wallet.creditLimit || 0) - (wallet.creditUsed || 0);
    const availableFunds = wallet.balance + availableCredit;

    if (availableFunds < amount) {
      throw new Error("Insufficient funds");
    }

    let amountFromBalance = 0;
    let amountFromCredit = 0;

    if (wallet.balance >= amount) {
      amountFromBalance = amount;
    } else {
      amountFromBalance = wallet.balance;
      amountFromCredit = amount - wallet.balance;
    }

    // Update wallet
    const updatedWallet = await this.model.findOneAndUpdate(
      { _id: wallet._id },
      {
        $inc: {
          balance: -amountFromBalance,
          creditUsed: amountFromCredit,
          totalSpent: amount
        }
      },
      { new: true, ...(session && { session }) }
    );

    if (!updatedWallet) {
      throw new Error("Wallet update failed");
    }

    // Derive balances from update
    const balanceAfter = updatedWallet.balance;
    const balanceBefore = balanceAfter + amountFromBalance; // Approximate for transaction log

    // Create transaction record
    const [transaction] = await WalletTransaction.create([{
      walletId: wallet._id,
      userId: new mongoose.Types.ObjectId(userId),
      type: "payment",
      category: category,
      amount: -amount, // Negative for deduction
      currency,
      balanceBefore,
      balanceAfter,
      status: "completed",
      reference: `PAY_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      description,
      metadata: {
        ...metadata,
        idempotencyKey: metadata?.idempotencyKey || `payment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      },
      processedAt: new Date(),
    }], session ? { session } : {});

    // Check for low balance after deduction
    await this.checkLowBalanceNotification(userId, currency, balanceAfter);

    // Send real-time updates
    await this.sendRealTimeWalletUpdate(userId, currency, transaction);

    return transaction;
  }

  // DEPRECATED: P2P transfers disabled for wholesaler platform
  // Check for duplicate transfer using idempotency key
  /* async checkDuplicateTransfer(idempotencyKey: string): Promise<any> {
    try {
      const WalletTransaction = require("../models/WalletTransaction").default;

      // Look for any transaction with this idempotency key
      const existingTransactions = await WalletTransaction.find({
        "metadata.idempotencyKey": idempotencyKey
      }).lean();

      if (existingTransactions.length > 0) {
        console.log(`Found ${existingTransactions.length} existing transactions with idempotency key: ${idempotencyKey}`);

        // Find the payment (from) and deposit (to) transactions
        const fromTransaction = existingTransactions.find(t => t.type === 'payment');
        const toTransaction = existingTransactions.find(t => t.type === 'deposit');

        if (fromTransaction && toTransaction) {
          console.log('Returning existing complete transfer result');
          return { fromTransaction, toTransaction };
        } else if (fromTransaction) {
          console.log('Found partial transfer (payment only), this indicates a failed transfer that needs to be completed');
          // Don't return partial transfers as "duplicates" - let the transfer complete
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error checking duplicate transfer:', error);
      return null;
    }
  } */

  // DEPRECATED: P2P transfers disabled for wholesaler platform
  // This method is kept for reference but should not be called
  // Transfer funds between users with transaction rollback
  async transferFunds(request: TransferRequest & { idempotencyKey?: string }): Promise<{ fromTransaction: IWalletTransaction; toTransaction: IWalletTransaction }> {
    throw new Error("P2P transfers are disabled for wholesaler platform");
    /* Original implementation preserved for reference
    const { fromUserId, toUserId, amount, currency, description, idempotencyKey } = request;
    
    // Check for duplicate transfer using idempotency key FIRST
    if (idempotencyKey) {
      const existingTransfer = await this.checkDuplicateTransfer(idempotencyKey);
      if (existingTransfer) {
        console.log('Duplicate transfer detected in service, returning existing result:', idempotencyKey);
        return existingTransfer;
      }
    }
    
    console.log(`Starting transfer: ${fromUserId} -> ${toUserId}, amount: ${amount} ${currency}, idempotency: ${idempotencyKey}`);
    
    // Check if recipient wallet exists
    const recipientWallet = await this.model.findOne({
      userId: new mongoose.Types.ObjectId(toUserId),
      currency,
      type: "user"
    });
    
    if (!recipientWallet) {
      console.error(`Recipient wallet not found for user ${toUserId}, currency ${currency}`);
      throw new Error(`Recipient wallet not found for this currency`);
    }
    
    console.log(`Recipient wallet found: ${recipientWallet._id}, balance: ${recipientWallet.balance}, status: ${recipientWallet.status}`);
    
    // Check if MongoDB supports transactions (replica set)
    const isReplicaSet = await this.checkIfReplicaSet();
    
    if (isReplicaSet) {
      // Use MongoDB transaction for atomicity
      const session = await mongoose.startSession();
    
      try {
        let fromTransaction: IWalletTransaction;
        let toTransaction: IWalletTransaction;
    
        await session.withTransaction(async () => {
          // Deduct from sender
          fromTransaction = await this.deductFunds(
            fromUserId,
            amount,
            currency,
            "user",
            `Transfer to ${toUserId}: ${description || "Fund transfer"}`,
            { recipientId: toUserId, idempotencyKey },
            session,
            "transfer_out"
          );
    
          // Add to recipient
          try {
            toTransaction = await this.addFunds(
              toUserId,
              amount,
              currency,
              "user",
              `Transfer from ${fromUserId}: ${description || "Fund transfer"}`,
              { senderId: fromUserId, idempotencyKey },
              session,
              "transfer_in"
            );
            console.log('Recipient funds added successfully:', toTransaction._id);
          } catch (addFundsError) {
            console.error('Failed to add funds to recipient:', addFundsError);
            throw new Error(`Failed to add funds to recipient: ${addFundsError.message}`);
          }
        });
    
        // Send transfer notifications (outside transaction to avoid blocking)
        try {
          await this.sendTransferNotifications(
            fromUserId,
            toUserId,
            amount,
            currency,
            fromTransaction._id.toString(),
            description
          );
        } catch (notificationError) {
          console.error('Failed to send transfer notifications:', notificationError);
          // Don't fail the transfer if notifications fail
        }
    
        return { fromTransaction, toTransaction };
    
      } catch (error: any) {
        console.error('Transfer failed, rolling back transaction:', error);
    
        // If it's a duplicate key error, check if the transfer was actually completed
        if (error.code === 11000 && error.keyPattern && error.keyPattern['metadata.idempotencyKey']) {
          console.log('Duplicate key error in transaction, checking if transfer was completed');
    
          try {
            const existingTransfer = await this.checkDuplicateTransfer(idempotencyKey);
            if (existingTransfer) {
              console.log('Transfer was completed, returning existing result');
              return existingTransfer;
            }
          } catch (checkError) {
            console.error('Error checking for existing transfer:', checkError);
          }
        }
    
        throw error;
      } finally {
        await session.endSession();
      }
    } else {
      // Fallback: Sequential operations without transaction
      console.log('MongoDB standalone detected, using sequential transfer without transaction');
    
      try {
        // Deduct from sender first
        const fromTransaction = await this.deductFunds(
          fromUserId,
          amount,
          currency,
          "user",
          `Transfer to ${toUserId}: ${description || "Fund transfer"}`,
          { recipientId: toUserId, idempotencyKey },
          undefined,
          "transfer_out"
        );
    
        // Add to recipient
        let toTransaction;
        try {
          toTransaction = await this.addFunds(
            toUserId,
            amount,
            currency,
            "user",
            `Transfer from ${fromUserId}: ${description || "Fund transfer"}`,
            { senderId: fromUserId, idempotencyKey },
            undefined,
            "transfer_in"
          );
          console.log('Recipient funds added successfully (standalone):', toTransaction._id);
        } catch (addFundsError) {
          console.error('Failed to add funds to recipient (standalone):', addFundsError);
          throw new Error(`Failed to add funds to recipient: ${addFundsError.message}`);
        }
    
        // Send transfer notifications
        try {
          await this.sendTransferNotifications(
            fromUserId,
            toUserId,
            amount,
            currency,
            fromTransaction._id.toString(),
            description
          );
        } catch (notificationError) {
          console.error('Failed to send transfer notifications:', notificationError);
          // Don't fail the transfer if notifications fail
        }
    
        return { fromTransaction, toTransaction };
    
      } catch (error: any) {
        console.error('Sequential transfer failed:', error);
    
        // If it's a duplicate key error, check if the transfer was actually completed
        if (error.code === 11000 && error.keyPattern && error.keyPattern['metadata.idempotencyKey']) {
          console.log('Duplicate key error in sequential transfer, checking if transfer was completed');
    
          try {
            const existingTransfer = await this.checkDuplicateTransfer(idempotencyKey);
            if (existingTransfer) {
              console.log('Transfer was completed, returning existing result');
              return existingTransfer;
            }
          } catch (checkError) {
            console.error('Error checking for existing transfer:', checkError);
          }
        }
    
        // Note: In standalone mode, we can't rollback, so this is a best-effort approach
        throw error;
          }
        }
        */
  }

  private async checkIfReplicaSet(): Promise<boolean> {
    try {
      const admin = mongoose.connection.db.admin();
      const serverStatus = await admin.serverStatus();
      return serverStatus.repl !== undefined;
    } catch (error) {
      console.log('Could not determine replica set status, assuming standalone:', error.message);
      return false;
    }
  }

  // Validate transfer before execution
  async validateTransfer(request: { fromUserId: string; toUserId: string; amount: number; currency: "NGN" }): Promise<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
    suggestions: string[];
    riskLevel: 'low' | 'medium' | 'high';
    recipientInfo: {
      isVerified: boolean;
      kycLevel: number;
      lastSeen: string;
      accountAge: number;
      transactionHistory: {
        totalTransactions: number;
        totalAmount: number;
        averageAmount: number;
        lastTransaction: string;
      };
    };
    amountValidation: {
      isWithinLimits: boolean;
      dailyLimit: number;
      remainingDailyLimit: number;
      monthlyLimit: number;
      remainingMonthlyLimit: number;
    };
    securityChecks: {
      isRecipientBlocked: boolean;
      isSuspiciousActivity: boolean;
      isHighRiskAmount: boolean;
      isNewRecipient: boolean;
    };
  }> {
    const { fromUserId, toUserId, amount, currency } = request;
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    try {
      // Check if sender wallet exists and has sufficient funds
      const senderWallet = await this.model.findOne({
        userId: new mongoose.Types.ObjectId(fromUserId),
        currency,
        type: "user"
      });

      if (!senderWallet) {
        errors.push(`Sender wallet not found for ${currency}`);
      } else if (senderWallet.balance < amount) {
        errors.push("Insufficient funds");
      } else if (senderWallet.status !== "active") {
        errors.push("Sender wallet is not active");
      }

      // Check if recipient exists and is valid
      const User = require("../models/User").default;
      const recipient = await User.findById(toUserId).select('isWalletPublic isDeleted kycLevel kycStatus lastLogin createdAt displayName username email').lean();

      if (!recipient) {
        errors.push("Recipient not found");
      } else if (recipient.isDeleted) {
        errors.push("Recipient account is deleted");
      } else if (!recipient.isWalletPublic) {
        errors.push("Recipient wallet is not public");
      }

      // Check if recipient wallet exists
      const recipientWallet = await this.model.findOne({
        userId: new mongoose.Types.ObjectId(toUserId),
        currency,
        type: "user"
      });

      if (!recipientWallet) {
        errors.push("Recipient wallet not found for this currency");
      } else if (recipientWallet.status !== "active") {
        errors.push("Recipient wallet is not active");
      }

      // Get recipient transaction history
      const WalletTransaction = require("../models/WalletTransaction").default;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [totalTransactions, dailyTransactions, monthlyTransactions] = await Promise.all([
        WalletTransaction.countDocuments({
          userId: new mongoose.Types.ObjectId(toUserId),
          type: "deposit"
        }),
        WalletTransaction.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(toUserId), type: "deposit", createdAt: { $gte: oneDayAgo } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        WalletTransaction.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(toUserId), type: "deposit", createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ])
      ]);

      const dailyAmount = dailyTransactions[0]?.total || 0;
      const monthlyAmount = monthlyTransactions[0]?.total || 0;

      // Get last transaction
      const lastTransaction = await WalletTransaction.findOne({
        userId: new mongoose.Types.ObjectId(toUserId),
        type: "deposit"
      }).sort({ createdAt: -1 }).select('createdAt').lean();

      // Calculate account age
      const accountAge = recipient ? Math.floor((Date.now() - new Date(recipient.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

      // Set limits (in kobo for NGN)
      const dailyLimit = 1000000; // ₦10,000 (in kobo)
      const monthlyLimit = 10000000; // ₦100,000 (in kobo)

      // Amount validation
      const isWithinLimits = dailyAmount + amount <= dailyLimit && monthlyAmount + amount <= monthlyLimit;
      if (!isWithinLimits) {
        errors.push("Transfer would exceed daily or monthly limits");
      }

      // Risk assessment
      if (amount > (dailyLimit * 0.5)) {
        warnings.push("Large transaction amount - consider splitting into smaller amounts");
        riskLevel = 'medium';
      }

      if (amount > (dailyLimit * 0.8)) {
        warnings.push("High-value transaction - additional verification may be required");
        riskLevel = 'high';
      }

      if (recipient && recipient.kycLevel < 2) {
        warnings.push("Recipient has limited KYC verification");
        riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
      }

      if (accountAge < 30) {
        warnings.push("Recipient account is relatively new");
        riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
      }

      if (totalTransactions < 5) {
        suggestions.push("Consider starting with a smaller amount for new recipients");
      }

      // Security checks
      const isRecipientBlocked = false; // TODO: Implement blocking system
      const isSuspiciousActivity = false; // TODO: Implement fraud detection
      const isHighRiskAmount = amount > (dailyLimit * 0.5);
      const isNewRecipient = totalTransactions < 3;

      if (isRecipientBlocked) {
        errors.push("Recipient is blocked");
      }

      if (isSuspiciousActivity) {
        errors.push("Suspicious activity detected");
        riskLevel = 'high';
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        warnings,
        errors,
        suggestions,
        riskLevel,
        recipientInfo: {
          isVerified: recipient?.kycStatus === 'verified' || false,
          kycLevel: recipient?.kycLevel || 0,
          lastSeen: recipient?.lastLogin || new Date().toISOString(),
          accountAge,
          transactionHistory: {
            totalTransactions,
            totalAmount: monthlyAmount,
            averageAmount: totalTransactions > 0 ? Math.round(monthlyAmount / totalTransactions) : 0,
            lastTransaction: lastTransaction?.createdAt?.toISOString() || ''
          }
        },
        amountValidation: {
          isWithinLimits,
          dailyLimit,
          remainingDailyLimit: Math.max(0, dailyLimit - dailyAmount),
          monthlyLimit,
          remainingMonthlyLimit: Math.max(0, monthlyLimit - monthlyAmount)
        },
        securityChecks: {
          isRecipientBlocked,
          isSuspiciousActivity,
          isHighRiskAmount,
          isNewRecipient
        }
      };

    } catch (error) {
      console.error('Error validating transfer:', error);
      return {
        isValid: false,
        warnings: [],
        errors: ["Failed to validate transfer"],
        suggestions: ["Please try again or contact support"],
        riskLevel: 'high',
        recipientInfo: {
          isVerified: false,
          kycLevel: 0,
          lastSeen: '',
          accountAge: 0,
          transactionHistory: {
            totalTransactions: 0,
            totalAmount: 0,
            averageAmount: 0,
            lastTransaction: ''
          }
        },
        amountValidation: {
          isWithinLimits: false,
          dailyLimit: 0,
          remainingDailyLimit: 0,
          monthlyLimit: 0,
          remainingMonthlyLimit: 0
        },
        securityChecks: {
          isRecipientBlocked: false,
          isSuspiciousActivity: false,
          isHighRiskAmount: false,
          isNewRecipient: false
        }
      };
    }
  }


  // Top up wallet via payment provider
  async topUpWallet(request: TopUpRequest): Promise<{ paymentUrl: string; reference: string }> {
    const { userId, amount, currency, provider, returnUrl } = request;

    const wallet = await this.model.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      currency,
      type: "user"
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      await this.createUserWallets(userId);
    }

    const providerInstance = this.providers[provider];
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not supported`);
    }

    // Create orderId in the format expected by payment verification
    // Format: WALLET_TOPUP_userId_timestamp
    const orderId = `WALLET_TOPUP_${userId}_${Date.now()}`;

    // Convert to kobo for internal payment record and provider
    const amountInKobo = currency === 'NGN' ? Math.round(amount * 100) : amount;

    // Initialize payment with provider
    const result = await providerInstance.initialize({
      orderId,
      amount: amountInKobo,
      currency,
      email: "user@example.com", // TODO: Get actual user email
      customer: {
        email: "user@example.com", // TODO: Get actual user email
        name: "User Name", // TODO: Get actual user name
        phonenumber: "0000000000" // TODO: Get actual user phone
      },
      returnUrl,
      metadata: {
        userId,
        type: "top_up"
      }
    });

    // Create payment record with the special orderId format
    // This allows the verification endpoint to identify it as a wallet top-up
    const { Payment } = require('../models');
    await Payment.create({
      orderId,
      provider,
      reference: result.reference,
      amount: amountInKobo,
      currency,
      status: "pending",
      settled: false,
      metadata: {
        userId,
        type: "top_up"
      }
    });

    return {
      paymentUrl: result.url,
      reference: result.reference
    };
  }

  // List banks from provider
  async listBanks(provider: "paystack" | "flutterwave" = "paystack"): Promise<Array<{ name: string; code: string }>> {
    const providerInstance = this.providers[provider];
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not supported`);
    }

    if (typeof providerInstance.listBanks !== 'function') {
      throw new Error(`Provider ${provider} does not support listing banks`);
    }

    return await providerInstance.listBanks();
  }

  // Resolve account details
  async resolveAccount(
    accountNumber: string,
    bankCode: string,
    provider: "paystack" | "flutterwave" = "paystack"
  ): Promise<{ accountName: string }> {
    const providerInstance = this.providers[provider];
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not supported`);
    }

    if (typeof providerInstance.resolveAccount !== 'function') {
      throw new Error(`Provider ${provider} does not support account resolution`);
    }

    return await providerInstance.resolveAccount({ accountNumber, bankCode });
  }




  // Process wallet top-up verification
  async processTopUpVerification(reference: string, provider: "paystack" | "flutterwave"): Promise<IWalletTransaction> {
    const verification = await this.paymentService.verify(provider as any, reference);

    if (!verification.ok) {
      throw new Error("Payment not successful");
    }

    // Find the wallet transaction by reference
    const transaction = await WalletTransaction.findOne({ externalReference: reference });
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Update transaction status
    await WalletTransaction.updateOne(
      { _id: transaction._id },
      {
        status: "completed",
        processedAt: new Date(),
      }
    );

    return transaction;
  }

  // Get transaction history with enhanced search and filtering
  async getTransactionHistory(
    userId: string,
    filters: {
      currency?: "NGN";
      type?: "user" | "vendor";
      transactionType?: "deposit" | "withdrawal" | "transfer" | "payment" | "refund" | "freeze" | "unfreeze";
      status?: "pending" | "completed" | "failed" | "cancelled";
      search?: string; // Search in description, reference, or metadata
      startDate?: Date;
      endDate?: Date;
      minAmount?: number;
      maxAmount?: number;
      sortBy?: "createdAt" | "amount" | "status";
      sortOrder?: "asc" | "desc";
    } = {},
    limit: number = 20,
    page: number = 1
  ): Promise<{
    transactions: IWalletTransaction[];
    total: number;
    pages: number;
    filters: any;
    summary: {
      totalAmount: number;
      depositCount: number;
      withdrawalCount: number;
      transferCount: number;
      pendingCount: number;
    };
  }> {
    const query: any = { userId };

    // Apply filters
    if (filters.currency) {
      query.currency = filters.currency;
    }

    if (filters.transactionType) {
      if ((filters.transactionType as string) === "vendor_payment") {
        // Special handling for vendor payments - filter by category
        query.category = "vendor_payment";
      } else {
        query.type = filters.transactionType;
      }
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) {
        query.amount.$gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        query.amount.$lte = filters.maxAmount;
      }
    }

    // Text search in description, reference, or metadata
    if (filters.search) {
      query.$or = [
        { description: { $regex: filters.search, $options: 'i' } },
        { reference: { $regex: filters.search, $options: 'i' } },
        { 'metadata.recipientName': { $regex: filters.search, $options: 'i' } },
        { 'metadata.senderName': { $regex: filters.search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    const sort: any = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    const [transactions, total, summaryData] = await Promise.all([
      WalletTransaction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("walletId", "type currency"),
      WalletTransaction.countDocuments(query),
      this.getTransactionSummary(userId, filters)
    ]);

    return {
      transactions,
      total,
      pages: Math.ceil(total / limit),
      filters,
      summary: summaryData
    };
  }

  // Get transaction summary for analytics
  private async getTransactionSummary(
    userId: string,
    filters: any
  ): Promise<{
    totalAmount: number;
    depositCount: number;
    withdrawalCount: number;
    transferCount: number;
    pendingCount: number;
  }> {
    // Ensure ObjectId is used inside aggregation matches
    const baseQuery: any = { userId: new mongoose.Types.ObjectId(userId) };

    // Apply same filters as main query
    if (filters.currency) baseQuery.currency = filters.currency;
    if (filters.startDate || filters.endDate) {
      baseQuery.createdAt = {};
      if (filters.startDate) baseQuery.createdAt.$gte = filters.startDate;
      if (filters.endDate) baseQuery.createdAt.$lte = filters.endDate;
    }

    // Compute aggregates compatible with our schema: deductions are type 'payment'
    const [depositAgg, paymentAgg, transferCount, pendingCount, netAgg] = await Promise.all([
      WalletTransaction.aggregate([
        { $match: { ...baseQuery, type: 'deposit', status: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]),
      WalletTransaction.aggregate([
        { $match: { ...baseQuery, type: 'payment', status: 'completed' } },
        // payment.amount is negative; store count and absolute total for clarity
        { $group: { _id: null, count: { $sum: 1 }, totalAbs: { $sum: { $abs: '$amount' } }, total: { $sum: '$amount' } } }
      ]),
      WalletTransaction.countDocuments({ ...baseQuery, status: 'completed', category: { $in: ['transfer_in', 'transfer_out'] } }),
      WalletTransaction.countDocuments({ ...baseQuery, status: 'pending' }),
      WalletTransaction.aggregate([
        { $match: { ...baseQuery, status: 'completed' } },
        { $group: { _id: null, net: { $sum: '$amount' } } }
      ])
    ]);

    const depositsTotal = depositAgg[0]?.total || 0;
    const depositsCount = depositAgg[0]?.count || 0;
    const paymentsCount = paymentAgg[0]?.count || 0;
    const netAmount = netAgg[0]?.net || 0;

    return {
      totalAmount: netAmount,
      depositCount: depositsCount,
      withdrawalCount: paymentsCount,
      transferCount: transferCount,
      pendingCount: pendingCount
    };
  }

  // Freeze funds (for escrow, disputes, etc.)
  async freezeFunds(
    userId: string,
    amount: number,
    currency: "NGN",
    type: "user" | "vendor" = "user",
    reason: string
  ): Promise<void> {
    const wallet = await this.model.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      currency,
      type
    });
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.balance < amount) {
      throw new Error("Insufficient funds to freeze");
    }

    await this.model.updateOne(
      { _id: wallet._id },
      {
        balance: wallet.balance - amount,
        frozenBalance: wallet.frozenBalance + amount,
      }
    );

    // Create transaction record with unique idempotency key
    const idempotencyKey = `freeze_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    await WalletTransaction.create({
      walletId: wallet._id,
      userId,
      type: "adjustment",
      category: "adjustment",
      amount: -amount,
      currency,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance - amount,
      status: "completed",
      reference: `FREEZE_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      description: `Funds frozen: ${reason}`,
      processedAt: new Date(),
      metadata: {
        idempotencyKey,
        reason,
        action: 'freeze_funds'
      }
    });
  }

  // Unfreeze funds
  async unfreezeFunds(
    userId: string,
    amount: number,
    currency: "NGN",
    type: "user" | "vendor" = "user",
    reason: string
  ): Promise<void> {
    const wallet = await this.model.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      currency,
      type
    });
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.frozenBalance < amount) {
      throw new Error("Insufficient frozen funds to unfreeze");
    }

    await this.model.updateOne(
      { _id: wallet._id },
      {
        balance: wallet.balance + amount,
        frozenBalance: wallet.frozenBalance - amount,
      }
    );

    // Create transaction record with unique idempotency key
    const idempotencyKey = `unfreeze_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    await WalletTransaction.create({
      walletId: wallet._id,
      userId,
      type: "adjustment",
      category: "adjustment",
      amount,
      currency,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance + amount,
      status: "completed",
      reference: `UNFREEZE_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      description: `Funds unfrozen: ${reason}`,
      processedAt: new Date(),
      metadata: {
        idempotencyKey,
        reason,
        action: 'unfreeze_funds'
      }
    });
  }

  // Freeze wallet (Admin only)
  async freezeWallet(walletId: string, reason: string, adminNotes?: string) {
    try {
      // walletId parameter is actually the wallet's _id from the database
      const wallet = await Wallet.findById(walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.status === "frozen") {
        throw new Error("Wallet is already frozen");
      }

      // Update wallet status
      wallet.status = "frozen";
      wallet.frozenAt = new Date();
      wallet.freezeReason = reason;
      wallet.adminNotes = adminNotes;
      await wallet.save();

      // Create freeze transaction record using 'adjustment' type
      const idempotencyKey = `wallet_freeze_${wallet._id}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const freezeTransaction = new WalletTransaction({
        walletId: wallet._id,
        userId: wallet.userId,
        type: "adjustment",
        category: "adjustment",
        amount: 0,
        currency: wallet.currency,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
        status: "completed",
        reference: `FREEZE_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        description: `Wallet frozen: ${reason}`,
        processedAt: new Date(),
        metadata: {
          idempotencyKey,
          reason,
          adminNotes,
          frozenAt: new Date(),
          action: 'wallet_freeze'
        }
      });
      await freezeTransaction.save();

      // Send freeze notification
      await this.sendWalletStatusNotification(
        wallet.userId.toString(),
        'frozen',
        reason,
        adminNotes
      );

      // Send real-time status update
      try {
        realTimeNotificationService.sendWalletStatusUpdate(wallet.userId.toString(), {
          status: wallet.status,
          reason: wallet.freezeReason,
          adminNotes: wallet.adminNotes,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error("Failed to send real-time status update:", error);
      }

      return {
        walletId: walletId,
        status: wallet.status,
        frozenAt: wallet.frozenAt,
        reason: wallet.freezeReason
      };
    } catch (error) {
      console.error("Freeze wallet error:", error);
      throw error;
    }
  }

  // Unfreeze wallet (Admin only)
  async unfreezeWallet(walletId: string, reason: string, adminNotes?: string) {
    try {
      // walletId parameter is actually the wallet's _id from the database
      const wallet = await Wallet.findById(walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.status !== "frozen") {
        throw new Error("Wallet is not frozen");
      }

      // Update wallet status
      wallet.status = "active";
      wallet.unfrozenAt = new Date();
      wallet.unfreezeReason = reason;
      wallet.adminNotes = adminNotes;
      await wallet.save();

      // Create unfreeze transaction record using 'adjustment' type
      const idempotencyKey = `wallet_unfreeze_${wallet._id}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const unfreezeTransaction = new WalletTransaction({
        walletId: wallet._id,
        userId: wallet.userId,
        type: "adjustment",
        category: "adjustment",
        amount: 0,
        currency: wallet.currency,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
        status: "completed",
        reference: `UNFREEZE_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        description: `Wallet unfrozen: ${reason}`,
        processedAt: new Date(),
        metadata: {
          idempotencyKey,
          reason,
          adminNotes,
          unfrozenAt: new Date(),
          action: 'wallet_unfreeze'
        }
      });
      await unfreezeTransaction.save();

      // Send unfreeze notification
      await this.sendWalletStatusNotification(
        wallet.userId.toString(),
        'unfrozen',
        reason,
        adminNotes
      );

      // Send real-time status update
      try {
        realTimeNotificationService.sendWalletStatusUpdate(wallet.userId.toString(), {
          status: wallet.status,
          reason: wallet.unfreezeReason,
          adminNotes: wallet.adminNotes,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error("Failed to send real-time status update:", error);
      }

      return {
        walletId: walletId,
        status: wallet.status,
        unfrozenAt: wallet.unfrozenAt,
        reason: wallet.unfreezeReason
      };
    } catch (error) {
      console.error("Unfreeze wallet error:", error);
      throw error;
    }
  }

  // Get wallet freeze history (Admin only)
  async getWalletFreezeHistory(walletId: string, page: number = 1, limit: number = 10) {
    try {
      const wallet = await Wallet.findOne({ walletId });
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      const skip = (page - 1) * limit;

      const transactions = await WalletTransaction.find({
        walletId: wallet._id,
        type: { $in: ["freeze", "unfreeze"] }
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username email displayName");

      const total = await WalletTransaction.countDocuments({
        walletId: wallet._id,
        type: { $in: ["freeze", "unfreeze"] }
      });

      return {
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error("Get wallet freeze history error:", error);
      throw error;
    }
  }

  // Process order payment using wallet
  async processOrderPayment(
    userId: string,
    orderId: string,
    amount: number,
    currency: "NGN"
  ) {
    try {
      // Get order details
      const { Order } = await import("../models");
      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.paymentStatus === "completed") {
        throw new Error("Order already paid");
      }

      if (order.buyer.toString() !== userId) {
        throw new Error("Unauthorized: Order does not belong to user");
      }

      // Check wallet balance
      const wallet = await this.model.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        currency,
        type: "user"
      });

      if (!wallet) {
        throw new Error(`Wallet not found for currency ${currency}`);
      }

      // Check available funds (balance + available credit)
      const availableCredit = (wallet.creditLimit || 0) - (wallet.creditUsed || 0);
      const availableFunds = wallet.balance + availableCredit;

      if (availableFunds < amount) {
        throw new Error(`Insufficient funds. Required: ${amount}, Available: ${availableFunds} (Balance: ${wallet.balance}, Credit: ${availableCredit})`);
      }

      // Deduct funds from wallet (without session for development)
      const transaction = await this.deductFunds(
        userId,
        amount,
        currency,
        "user",
        `Payment for order ${orderId}`,
        { orderId, paymentType: "order_payment" },
        null, // No session for development
        "order_payment"
      );

      // Update order payment status
      await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: "completed",
          paymentMethod: "wallet",
          paymentReference: transaction._id.toString(),
          paidAt: new Date()
        }
      );

      // Send payment notification
      try {
        await this.sendWalletNotification(
          userId,
          "wallet_withdrawal_success",
          {
            orderId,
            amount: currency === 'NGN' ? amount.toFixed(2) : amount.toString(),
            currency,
            transactionId: transaction._id.toString(),
            description: `Payment for order ${orderId}`
          },
          "medium"
        );
      } catch (notificationError) {
        console.error("Failed to send payment notification:", notificationError);
        // Don't fail the payment for notification errors
      }

      return {
        success: true,
        message: "Payment processed successfully",
        transactionId: transaction._id.toString(),
        orderId,
        amount,
        currency,
        newBalance: wallet.balance - amount
      };
    } catch (error) {
      console.error("Process order payment error:", error);
      throw error;
    }
  }

  // Process wallet checkout (payment BEFORE order creation)
  async processWalletCheckout(
    userId: string,
    amount: number,
    currency: "NGN",
    lineItems: any[],
    metadata?: any
  ) {
    try {
      // Validate line items exist and calculate expected total
      const { Product } = await import("../models");
      let calculatedTotal = 0;

      for (const item of lineItems) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // Calculate discounted price
        const discountedPrice = typeof product.discount === "number" && product.discount > 0
          ? Math.max(0, Math.round((product.price * (100 - product.discount)) / 100))
          : product.price;

        calculatedTotal += discountedPrice * item.qty;
      }

      // Verify amount matches calculated total
      const expectedAmount = Math.round(calculatedTotal);
      if (Math.abs(amount - expectedAmount) > 100) { // Allow 1 NGN tolerance
        throw new Error(`Amount mismatch. Expected: ${expectedAmount}, Received: ${amount}`);
      }

      // Get wallet
      const wallet = await this.model.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        currency,
        type: "user"
      });

      if (!wallet) {
        throw new Error(`Wallet not found for currency ${currency}`);
      }

      // Use amount directly (standardized to Naira)
      const amountInNaira = amount;

      // Check available funds (balance + available credit)
      const availableCredit = (wallet.creditLimit || 0) - (wallet.creditUsed || 0);
      const availableFunds = wallet.balance + availableCredit;

      if (availableFunds < amountInNaira) {
        throw new Error(`Insufficient funds. Required: ${amountInNaira}, Available: ${availableFunds} (Balance: ${wallet.balance}, Credit: ${availableCredit})`);
      }

      // Deduct funds from wallet (in Naira)
      const transaction = await this.deductFunds(
        userId,
        amountInNaira,
        currency,
        "user",
        `Wallet checkout payment`,
        { ...metadata, paymentType: "checkout_payment", lineItems },
        null,
        "order_payment"
      );

      // Send payment notification
      try {
        await this.sendWalletNotification(
          userId,
          "wallet_withdrawal_success",
          {
            amount: currency === 'NGN' ? amount.toFixed(2) : amount.toString(),
            currency,
            transactionId: transaction._id.toString(),
            description: `Checkout payment for ${lineItems.length} items`
          },
          "medium"
        );
      } catch (notificationError) {
        console.error("Failed to send payment notification:", notificationError);
      }

      return {
        success: true,
        message: "Payment processed successfully",
        transactionId: transaction._id.toString(),
        amount,
        currency,
        newBalance: wallet.balance - amountInNaira
      };
    } catch (error) {
      console.error("Process wallet checkout error:", error);
      throw error;
    }
  }

  // Process order payment using wallet (DEPRECATED - use processWalletCheckout instead)

  // Export user transactions
  async exportTransactions(
    userId: string,
    format: string,
    filters: {
      startDate?: string;
      endDate?: string;
      type?: string;
      currency?: string;
    }
  ) {
    try {
      const { startDate, endDate, type, currency } = filters;

      // Build query
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      if (type) query.type = type;
      if (currency) query.currency = currency;

      // Get transactions
      const transactions = await WalletTransaction.find(query)
        .populate('walletId', 'currency type')
        .sort({ createdAt: -1 })
        .limit(10000); // Limit for performance

      if (format === 'csv') {
        return this.generateCSV(transactions);
      } else if (format === 'excel') {
        return this.generateExcel(transactions);
      } else {
        throw new Error('Unsupported format. Use csv or excel.');
      }
    } catch (error) {
      console.error("Export transactions error:", error);
      throw error;
    }
  }

  // Export all transactions (Admin)
  async exportAllTransactions(
    format: string,
    filters: {
      startDate?: string;
      endDate?: string;
      type?: string;
      currency?: string;
      userId?: string;
    }
  ) {
    try {
      const { startDate, endDate, type, currency, userId } = filters;

      // Build query
      const query: any = {};

      if (userId) {
        query.userId = new mongoose.Types.ObjectId(userId);
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      if (type) query.type = type;
      if (currency) query.currency = currency;

      // Get transactions with user data
      const transactions = await WalletTransaction.find(query)
        .populate('userId', 'username email displayName walletId')
        .populate('walletId', 'currency type')
        .sort({ createdAt: -1 })
        .limit(50000); // Higher limit for admin exports

      if (format === 'csv') {
        return this.generateCSV(transactions, true); // true for admin export
      } else if (format === 'excel') {
        return this.generateExcel(transactions, true);
      } else {
        throw new Error('Unsupported format. Use csv or excel.');
      }
    } catch (error) {
      console.error("Export all transactions error:", error);
      throw error;
    }
  }

  // Generate CSV content
  private generateCSV(transactions: any[], isAdmin = false) {
    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Amount',
      'Currency',
      'Status',
      'Description',
      'Reference'
    ];

    if (isAdmin) {
      headers.splice(1, 0, 'User', 'User Email', 'Wallet ID');
    }

    const csvRows = [headers.join(',')];

    transactions.forEach(transaction => {
      const row = [
        transaction._id.toString(),
        transaction.createdAt.toISOString(),
        transaction.type,
        transaction.amount.toString(),
        transaction.currency,
        transaction.status,
        `"${transaction.description || ''}"`,
        transaction.reference || ''
      ];

      if (isAdmin) {
        row.splice(1, 0,
          transaction.userId?.displayName || transaction.userId?.username || 'Unknown',
          transaction.userId?.email || '',
          transaction.userId?.walletId || ''
        );
      }

      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Generate Excel content (simplified - in production, use a proper Excel library)
  private generateExcel(transactions: any[], isAdmin = false) {
    // For now, return CSV format
    // In production, use libraries like 'exceljs' or 'xlsx'
    return this.generateCSV(transactions, isAdmin);
  }

  // Send wallet notification
  private async sendWalletNotification(
    userId: string,
    type: 'wallet_transfer_received' | 'wallet_transfer_sent' | 'wallet_deposit_success' | 'wallet_deposit_failed' | 'wallet_withdrawal_success' | 'wallet_withdrawal_failed' | 'wallet_frozen' | 'wallet_unfrozen' | 'wallet_low_balance',
    data: any,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ) {
    try {
      await this.notificationService.createNotification({
        userId,
        type,
        data,
        priority,
        channels: ['in_app', 'push']
      });
    } catch (error) {
      console.error(`Failed to send ${type} notification to user ${userId}:`, error);
    }
  }

  // Send transfer notifications
  private async sendTransferNotifications(
    fromUserId: string,
    toUserId: string,
    amount: number,
    currency: string,
    transactionId: string,
    description?: string
  ) {
    try {
      // Get user details for personalized notifications
      const [fromUser, toUser] = await Promise.all([
        User.findById(fromUserId).select('displayName username'),
        User.findById(toUserId).select('displayName username')
      ]);

      const senderName = fromUser?.displayName || fromUser?.username || 'Unknown User';
      const recipientName = toUser?.displayName || toUser?.username || 'Unknown User';

      // Send notification to sender
      await this.sendWalletNotification(
        fromUserId,
        'wallet_transfer_sent',
        {
          currency,
          amount: currency === 'NGN' ? amount.toFixed(2) : amount.toString(),
          recipientName,
          transactionId,
          description
        },
        'medium'
      );

      // Send notification to recipient
      await this.sendWalletNotification(
        toUserId,
        'wallet_transfer_received',
        {
          currency,
          amount: currency === 'NGN' ? amount.toFixed(2) : amount.toString(),
          senderName,
          transactionId,
          description
        },
        'high'
      );
    } catch (error) {
      console.error('Failed to send transfer notifications:', error);
    }
  }

  // Send deposit notification
  private async sendDepositNotification(
    userId: string,
    amount: number,
    currency: string,
    transactionId: string,
    success: boolean,
    reason?: string
  ) {
    const notificationType = success ? 'wallet_deposit_success' : 'wallet_deposit_failed';
    const priority = success ? 'high' : 'urgent';

    await this.sendWalletNotification(
      userId,
      notificationType,
      {
        currency,
        amount: currency === 'NGN' ? amount.toFixed(2) : amount.toString(),
        transactionId,
        reason
      },
      priority
    );
  }

  // Request withdrawal
  async requestWithdrawal(
    userId: string,
    amount: number, // in Naira
    bankDetails: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      bankCode?: string;
    },
    currency: "NGN" = "NGN"
  ) {
    return this.executeTransaction(async (session) => {
      const wallet = await this.model.findOne({ userId, currency, type: "user" }).session(session);
      if (!wallet) throw new Error("Wallet not found");
      if (wallet.status !== "active") throw new Error("Wallet is not active");
      if (wallet.balance < amount) throw new Error("Insufficient balance");

      // Freeze funds
      wallet.balance -= amount;
      wallet.frozenBalance += amount;
      await wallet.save({ session });

      // Create withdrawal request
      const { WithdrawalRequest } = require("../models");
      const requests = await WithdrawalRequest.create([{
        userId,
        amount,
        currency,
        bankDetails,
        status: "pending",
        reference: `WDR_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      }], { session });
      const request = requests[0];

      // Send notification
      await this.notificationService.createNotification({
        userId: String(userId),
        type: 'withdrawal_requested' as const,
        title: 'Withdrawal Request Submitted',
        message: `Your withdrawal request for ${currency} ${amount.toLocaleString()} has been submitted`,
        data: {
          currency,
          amount: amount.toLocaleString(),
          reference: request.reference
        },
        priority: 'high' as const
      });

      return request;
    });
  }

  // Approve withdrawal
  async approveWithdrawal(requestId: string, adminId: string) {
    return this.executeTransaction(async (session) => {
      const { WithdrawalRequest } = require("../models");
      const request = await WithdrawalRequest.findById(requestId).session(session);
      if (!request) throw new Error("Request not found");
      if (request.status !== "pending") throw new Error("Request is not pending");

      request.status = "processing";
      request.adminNote = `Approved by admin ${adminId}`;
      await request.save({ session });

      // Handle Commission Payouts
      if (request.metadata?.type === "commission_payout" && request.metadata?.commissionIds) {
        const CommissionService = require("./CommissionService").default;
        for (const commissionId of request.metadata.commissionIds) {
          await CommissionService.payCommission(commissionId, session);
        }
      }

      // Trigger payout logic
      let transferReference;

      // Handle test bank simulation
      if (request.bankDetails.bankCode === "001") {
        transferReference = `TEST_TRF_${Date.now()}`;
        // Simulate successful transfer immediately
        request.status = "approved";
        request.transactionReference = transferReference;

        // Deduct permanently (funds are gone)
        const wallet = await this.model.findOne({ userId: request.userId, currency: request.currency, type: "user" }).session(session);
        if (wallet) {
          if (request.metadata?.type === "commission_payout") {
            // Commissions were added to balance by payCommission, so we deduct from balance
            wallet.balance -= request.amount;
          } else {
            // Normal withdrawals deduct from frozen balance
            wallet.frozenBalance -= request.amount;
          }
          wallet.totalWithdrawn += request.amount;
          await wallet.save({ session });
        }

        // Create wallet transaction record
        await WalletTransaction.create([{
          walletId: wallet?._id,
          userId: request.userId,
          amount: request.amount,
          currency: request.currency,
          type: "withdrawal",
          category: "withdrawal",
          status: "completed",
          balanceBefore: wallet ? wallet.balance + request.amount : 0,
          balanceAfter: wallet ? wallet.balance : 0,
          reference: request.reference,
          externalReference: transferReference,
          description: "Withdrawal to bank account",
          metadata: {
            bankName: request.bankDetails.bankName,
            accountNumber: request.bankDetails.accountNumber,
            accountName: request.bankDetails.accountName,
            idempotencyKey: `withdrawal_${request._id}_${Date.now()}`
          }
        }], { session });

      } else {
        // Real Paystack Transfer
        try {
          // 1. Create Transfer Recipient
          const recipient = await this.providers.paystack.createRecipient({
            name: request.bankDetails.accountName,
            accountNumber: request.bankDetails.accountNumber,
            bankCode: request.bankDetails.bankCode
          });

          const transfer = await this.providers.paystack.transfer({
            recipientCode: recipient.recipientCode,
            amount: Math.round(request.amount * 100), // amount in kobo
            reason: `Withdrawal: ${request.reference}`
          });

          transferReference = transfer.transferId;
          request.transactionReference = transferReference;

          // Note: We don't deduct frozen balance yet for real transfers.
          // We wait for the webhook 'transfer.success' to complete it.
          // OR we can deduct it now and refund if it fails.
          // For simplicity, let's deduct now and mark as approved.
          // In a production system, we might want to keep it "processing" until webhook confirms.

          request.status = "approved";

          const wallet = await this.model.findOne({ userId: request.userId, currency: request.currency, type: "user" }).session(session);
          if (wallet) {
            if (request.metadata?.type === "commission_payout") {
              wallet.balance -= request.amount;
            } else {
              wallet.frozenBalance -= request.amount;
            }
            wallet.totalWithdrawn += request.amount;
            await wallet.save({ session });
          }

          // Create wallet transaction record
          await WalletTransaction.create([{
            walletId: wallet?._id,
            userId: request.userId,
            amount: request.amount,
            currency: request.currency,
            type: "withdrawal",
            category: "withdrawal",
            status: "completed",
            balanceBefore: wallet ? wallet.balance + request.amount : 0,
            balanceAfter: wallet ? wallet.balance : 0,
            reference: request.reference,
            externalReference: transferReference,
            description: "Withdrawal to bank account",
            metadata: {
              bankName: request.bankDetails.bankName,
              accountNumber: request.bankDetails.accountNumber,
              accountName: request.bankDetails.accountName,
              idempotencyKey: `withdrawal_${request._id}_${Date.now()}`
            }
          }], { session });

        } catch (paystackError: any) {
          throw new Error(`Paystack Transfer Failed: ${paystackError.message}`);
        }
      }

      await request.save({ session });
      // Send notification
      await this.notificationService.createNotification({
        userId: String(request.userId),
        type: 'withdrawal_approved' as const,
        title: 'Withdrawal Approved',
        message: `Your withdrawal request for ${request.currency} ${request.amount.toLocaleString()} has been approved and processed.`,
        data: {
          currency: request.currency,
          amount: request.amount.toLocaleString(),
          reference: request.reference
        },
        priority: 'high' as const
      });

      return request;
    });
  }

  // Reject withdrawal
  async rejectWithdrawal(requestId: string, adminId: string, reason: string) {
    return this.executeTransaction(async (session) => {
      const { WithdrawalRequest } = require("../models");
      const request = await WithdrawalRequest.findById(requestId).session(session);
      if (!request) throw new Error("Request not found");
      if (request.status !== "pending") throw new Error("Request is not pending");

      request.status = "rejected";
      request.adminNote = `Rejected by admin ${adminId}: ${reason}`;
      await request.save({ session });

      // Handle Commission Payout Rejection
      if (request.metadata?.type === "commission_payout" && request.metadata?.commissionIds) {
        const Commission = require("../models/Commission").default;
        await Commission.updateMany(
          { _id: { $in: request.metadata.commissionIds } },
          { $set: { status: "approved" }, $unset: { "metadata.withdrawalId": "" } }
        ).session(session);
      } else {
        // Unfreeze funds for normal withdrawals
        const wallet = await this.model.findOne({ userId: request.userId, currency: request.currency, type: "user" }).session(session);
        if (wallet) {
          wallet.balance += request.amount;
          wallet.frozenBalance -= request.amount;
          await wallet.save({ session });
        }
      }

      // Send notification
      await this.notificationService.createNotification({
        userId: String(request.userId),
        type: 'withdrawal_rejected' as const,
        title: 'Withdrawal Request Rejected',
        message: `Your withdrawal request for ${request.currency} ${request.amount.toLocaleString()} has been rejected`,
        data: {
          currency: request.currency,
          amount: request.amount.toLocaleString(),
          reference: request.reference,
          reason
        },
        priority: 'urgent' as const
      });

      return request;
    });
  }

  // Complete withdrawal (after successful payout)
  async completeWithdrawal(requestId: string, transactionReference: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { WithdrawalRequest } = require("../models");
      const request = await WithdrawalRequest.findById(requestId).session(session);
      if (!request) throw new Error("Request not found");
      if (request.status !== "processing") throw new Error("Request is not processing");

      request.status = "completed";
      await request.save({ session });

      // Deduct frozen funds permanently
      const wallet = await this.model.findOne({ userId: request.userId, currency: request.currency, type: "user" }).session(session);
      if (wallet) {
        wallet.frozenBalance -= request.amount;
        wallet.totalWithdrawn += request.amount;
        await wallet.save({ session });

        // Record transaction
        const transaction = await WalletTransaction.create([{
          walletId: wallet._id,
          userId: request.userId,
          type: "withdrawal",
          amount: request.amount,
          currency: request.currency,
          balanceBefore: wallet.balance + request.amount, // Approximate
          balanceAfter: wallet.balance,
          status: "completed",
          reference: transactionReference,
          description: "Withdrawal to bank account",
          metadata: { withdrawalRequestId: request._id }
        }], { session });

        request.transactionId = transaction[0]._id;
        await request.save({ session });
      }

      await session.commitTransaction();

      // Send notification
      await this.notificationService.createNotification({
        userId: String(request.userId),
        type: 'withdrawal_completed' as const,
        title: 'Withdrawal Completed',
        message: `${request.currency} ${request.amount.toLocaleString()} has been successfully transferred to your bank account`,
        data: {
          currency: request.currency,
          amount: request.amount.toLocaleString(),
          reference: transactionReference,
          bankName: request.bankDetails.bankName
        },
        priority: 'high' as const
      });

      return request;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Set credit limit (Admin only)
  async setCreditLimit(userId: string, limit: number): Promise<IWallet> {
    const wallet = await this.model.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      type: "user",
      currency: "NGN"
    });

    if (!wallet) {
      // If NGN wallet doesn't exist, try to create it or throw error
      // For now, we'll throw error as user should have a wallet by now
      throw new Error("NGN Wallet not found");
    }

    wallet.creditLimit = limit;
    await wallet.save();
    return wallet;
  }

  // Send withdrawal notification
  private async sendWithdrawalNotification(
    userId: string,
    amount: number,
    currency: string,
    transactionId: string,
    success: boolean,
    reason?: string
  ) {
    const notificationType = success ? 'wallet_withdrawal_success' : 'wallet_withdrawal_failed';
    const priority = success ? 'high' : 'urgent';

    await this.sendWalletNotification(
      userId,
      notificationType,
      {
        currency,
        amount: amount.toLocaleString(),
        transactionId,
        reason
      },
      priority
    );
  }

  // Send wallet status notification
  private async sendWalletStatusNotification(
    userId: string,
    status: 'frozen' | 'unfrozen',
    reason: string,
    adminNotes?: string
  ) {
    const notificationType = status === 'frozen' ? 'wallet_frozen' : 'wallet_unfrozen';
    const priority = status === 'frozen' ? 'urgent' : 'high';

    await this.sendWalletNotification(
      userId,
      notificationType,
      {
        reason,
        adminNotes
      },
      priority
    );
  }

  // Check and send low balance notification
  private async checkLowBalanceNotification(
    userId: string,
    currency: string,
    balance: number
  ) {
    const threshold = 100000; // ₦1000 (in kobo)
    const isLow = currency === 'NGN' ? balance < threshold : balance < threshold;

    if (isLow) {
      await this.sendWalletNotification(
        userId,
        'wallet_low_balance',
        {
          currency,
          amount: balance.toLocaleString()
        },
        'medium'
      );
    }
  }

  // Send real-time wallet updates
  private async sendRealTimeWalletUpdate(
    userId: string,
    currency: string,
    transaction: IWalletTransaction
  ) {
    try {
      const wallet = await this.model.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        currency
      });

      if (wallet) {
        // Send balance update
        realTimeNotificationService.sendWalletBalanceUpdate(userId, {
          currency: wallet.currency as 'NGN',
          available: wallet.balance,
          frozen: wallet.frozenBalance,
          total: wallet.balance + wallet.frozenBalance,
          lastUpdated: new Date()
        });

        // Send transaction update
        realTimeNotificationService.sendWalletTransactionUpdate(userId, {
          transactionId: transaction._id.toString(),
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt
        });
      }
    } catch (error) {
      console.error("Failed to send real-time wallet update:", error);
    }
  }

  // Get wallet analytics
  async getWalletAnalytics(
    userId: string,
    period: string = '30d',
    currency: string = 'all',
    type: string = 'all'
  ) {
    try {
      const endDate = new Date();
      const startDate = this.getStartDateFromPeriod(period);

      // Build currency filter
      const currencyFilter = currency === 'all' ? {} : { currency };

      // Build type filter
      const typeFilter = type === 'all' ? {} : { type };

      // Get transaction data
      const transactions = await WalletTransaction.find({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate },
        ...currencyFilter,
        ...typeFilter
      }).sort({ createdAt: -1 });

      // Calculate analytics
      const totalTransactions = transactions.length;
      const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const totalDeposits = transactions
        .filter(tx => tx.type === 'deposit' && tx.category !== 'transfer_in')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const totalWithdrawals = transactions
        .filter(tx => tx.type === 'payment' && tx.category === 'transfer_out')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const totalTransfers = transactions
        .filter(tx => (tx.type === 'payment' && tx.category === 'transfer_out') ||
          (tx.type === 'deposit' && tx.category === 'transfer_in'))
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      // Calculate averages
      const avgTransactionAmount = totalTransactions > 0 ? totalVolume / totalTransactions : 0;
      const avgDailyVolume = this.calculateDailyAverage(totalVolume, startDate, endDate);

      // Get balance history
      const balanceHistory = await this.getBalanceHistory(userId, startDate, endDate, currency);

      // Calculate spending patterns
      const spendingPatterns = this.calculateSpendingPatterns(transactions);

      return {
        period,
        currency,
        type,
        summary: {
          totalTransactions,
          totalVolume,
          totalDeposits,
          totalWithdrawals,
          totalTransfers,
          avgTransactionAmount,
          avgDailyVolume
        },
        balanceHistory,
        spendingPatterns,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error("Error getting wallet analytics:", error);
      throw error;
    }
  }

  // Get spending insights
  async getSpendingInsights(
    userId: string,
    period: string = '30d',
    currency: string = 'all',
    category: string = 'all'
  ) {
    try {
      const endDate = new Date();
      const startDate = this.getStartDateFromPeriod(period);

      const currencyFilter = currency === 'all' ? {} : { currency };
      const categoryFilter = category === 'all' ? {} : { category };

      const transactions = await WalletTransaction.find({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate },
        type: { $in: ['withdrawal', 'transfer', 'payment'] },
        ...currencyFilter,
        ...categoryFilter
      }).sort({ createdAt: -1 });

      // Calculate insights
      const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const avgSpending = transactions.length > 0 ? totalSpent / transactions.length : 0;

      // Top spending categories
      const categorySpending = this.calculateCategorySpending(transactions);

      // Spending by day of week
      const dayOfWeekSpending = this.calculateDayOfWeekSpending(transactions);

      // Spending trends
      const spendingTrends = this.calculateSpendingTrends(transactions, startDate, endDate);

      return {
        period,
        currency,
        category,
        totalSpent,
        avgSpending,
        transactionCount: transactions.length,
        categorySpending,
        dayOfWeekSpending,
        spendingTrends,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error("Error getting spending insights:", error);
      throw error;
    }
  }

  // Get transaction trends
  async getTransactionTrends(
    userId: string,
    period: string = '30d',
    currency: string = 'all',
    granularity: string = 'daily'
  ) {
    try {
      const endDate = new Date();
      const startDate = this.getStartDateFromPeriod(period);

      const currencyFilter = currency === 'all' ? {} : { currency };

      const transactions = await WalletTransaction.find({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate },
        ...currencyFilter
      }).sort({ createdAt: -1 });

      // Group by granularity
      const trends = this.groupTransactionsByGranularity(transactions, granularity, startDate, endDate);

      return {
        period,
        currency,
        granularity,
        trends,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error("Error getting transaction trends:", error);
      throw error;
    }
  }

  // Helper methods for analytics
  private getStartDateFromPeriod(period: string): Date {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private calculateDailyAverage(total: number, startDate: Date, endDate: Date): number {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? total / days : 0;
  }

  private async getBalanceHistory(userId: string, startDate: Date, endDate: Date, currency: string) {
    // This would ideally query a balance history collection
    // For now, we'll return a simplified version
    const wallets = await this.model.find({
      userId: new mongoose.Types.ObjectId(userId),
      ...(currency !== 'all' ? { currency } : {})
    });

    return wallets.map(wallet => ({
      currency: wallet.currency,
      balance: wallet.balance,
      frozenBalance: wallet.frozenBalance,
      total: wallet.balance + wallet.frozenBalance,
      date: new Date()
    }));
  }

  private calculateSpendingPatterns(transactions: IWalletTransaction[]) {
    const patterns = {
      mostActiveDay: '',
      mostActiveHour: 0,
      avgTransactionSize: 0,
      largestTransaction: 0,
      smallestTransaction: 0
    };

    if (transactions.length === 0) return patterns;

    // Calculate most active day
    const dayCounts: { [key: string]: number } = {};
    transactions.forEach(tx => {
      const day = new Date(tx.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    patterns.mostActiveDay = Object.keys(dayCounts).reduce((a, b) =>
      dayCounts[a] > dayCounts[b] ? a : b
    ) || '';

    // Calculate most active hour
    const hourCounts: { [key: number]: number } = {};
    transactions.forEach(tx => {
      const hour = new Date(tx.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    patterns.mostActiveHour = parseInt(Object.keys(hourCounts).reduce((a, b) =>
      hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
    )) || 0;

    // Calculate transaction sizes
    const amounts = transactions.map(tx => tx.amount);
    patterns.avgTransactionSize = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    patterns.largestTransaction = Math.max(...amounts);
    patterns.smallestTransaction = Math.min(...amounts);

    return patterns;
  }

  private calculateCategorySpending(transactions: IWalletTransaction[]) {
    const categoryMap: { [key: string]: number } = {};

    transactions.forEach(tx => {
      const category = tx.category || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + tx.amount;
    });

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calculateDayOfWeekSpending(transactions: IWalletTransaction[]) {
    const dayMap: { [key: string]: number } = {};

    transactions.forEach(tx => {
      const day = new Date(tx.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayMap[day] = (dayMap[day] || 0) + tx.amount;
    });

    return Object.entries(dayMap)
      .map(([day, amount]) => ({ day, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calculateSpendingTrends(transactions: IWalletTransaction[], startDate: Date, endDate: Date) {
    // Group by day
    const dailySpending: { [key: string]: number } = {};

    transactions.forEach(tx => {
      const date = new Date(tx.createdAt).toISOString().split('T')[0];
      dailySpending[date] = (dailySpending[date] || 0) + tx.amount;
    });

    return Object.entries(dailySpending)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private groupTransactionsByGranularity(
    transactions: IWalletTransaction[],
    granularity: string,
    startDate: Date,
    endDate: Date
  ) {
    const groups: { [key: string]: { count: number; volume: number; deposits: number; withdrawals: number } } = {};

    transactions.forEach(tx => {
      let key: string;
      const txDate = new Date(tx.createdAt);

      switch (granularity) {
        case 'daily':
          key = txDate.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(txDate);
          weekStart.setDate(txDate.getDate() - txDate.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = txDate.toISOString().split('T')[0];
      }

      if (!groups[key]) {
        groups[key] = { count: 0, volume: 0, deposits: 0, withdrawals: 0 };
      }

      groups[key].count++;
      groups[key].volume += tx.amount;

      if (tx.type === 'deposit') {
        groups[key].deposits += tx.amount;
      } else if (tx.type === 'withdrawal') {
        groups[key].withdrawals += tx.amount;
      }
    });

    return Object.entries(groups)
      .map(([period, data]) => ({ period, ...data }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  // ==================== ADMIN WALLET MANAGEMENT ====================

  /**
   * Get comprehensive wallet details for admin view
   * Includes user info, statistics, recent transactions, and freeze history
   */
  async getWalletDetails(walletId: string) {
    try {
      // Fetch wallet with populated user data
      const wallet = await Wallet.findById(walletId).populate({
        path: 'userId',
        select: 'displayName username email phoneNumber profileImage isVerified kycStatus kycLevel role createdAt lastSeen'
      }).lean();

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Get recent transactions (last 20)
      const recentTransactions = await WalletTransaction.find({
        walletId: wallet._id
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      // Get freeze history
      const freezeHistory = await WalletTransaction.find({
        walletId: wallet._id,
        type: { $in: ['freeze', 'unfreeze'] }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      // Calculate available credit
      const availableCredit = Math.max(0, (wallet.creditLimit || 0) - (wallet.creditUsed || 0));

      return {
        wallet: {
          _id: wallet._id,
          userId: wallet.userId,
          type: wallet.type,
          currency: wallet.currency,
          balance: wallet.balance,
          frozenBalance: wallet.frozenBalance,
          totalDeposited: wallet.totalDeposited,
          totalWithdrawn: wallet.totalWithdrawn,
          totalSpent: wallet.totalSpent,
          totalEarned: wallet.totalEarned,
          creditLimit: wallet.creditLimit || 0,
          creditUsed: wallet.creditUsed || 0,
          availableCredit,
          status: wallet.status,
          frozenAt: wallet.frozenAt,
          unfrozenAt: wallet.unfrozenAt,
          freezeReason: wallet.freezeReason,
          unfreezeReason: wallet.unfreezeReason,
          adminNotes: wallet.adminNotes,
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt
        },
        recentTransactions,
        freezeHistory,
        statistics: {
          totalTransactions: await WalletTransaction.countDocuments({ walletId: wallet._id }),
          totalDeposits: await WalletTransaction.countDocuments({ walletId: wallet._id, type: 'deposit' }),
          totalWithdrawals: await WalletTransaction.countDocuments({ walletId: wallet._id, type: 'withdrawal' }),
          totalPayments: await WalletTransaction.countDocuments({ walletId: wallet._id, type: 'payment' }),
          averageTransactionAmount: await this.getAverageTransactionAmount(wallet._id.toString())
        }
      };
    } catch (error) {
      console.error("Get wallet details error:", error);
      throw error;
    }
  }

  /**
   * Helper method to calculate average transaction amount
   */
  private async getAverageTransactionAmount(walletId: string): Promise<number> {
    const result = await WalletTransaction.aggregate([
      { $match: { walletId: new mongoose.Types.ObjectId(walletId) } },
      { $group: { _id: null, avgAmount: { $avg: "$amount" } } }
    ]);
    return result.length > 0 ? Math.abs(result[0].avgAmount) : 0;
  }

  /**
   * Adjust wallet balance (admin only)
   * Adds or deducts funds with full audit trail
   */
  async adjustBalance(
    walletId: string,
    amount: number, // in Naira, positive for add, negative for deduct
    reason: string,
    adminId: string
  ) {
    try {
      const wallet = await Wallet.findById(walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Validate that deduction doesn't result in negative balance
      if (amount < 0 && wallet.balance + amount < 0) {
        throw new Error("Insufficient balance for deduction");
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance + amount;

      // Update wallet balance
      wallet.balance = balanceAfter;

      // Update totalDeposited or totalWithdrawn based on adjustment type
      if (amount > 0) {
        wallet.totalDeposited += amount;
      } else {
        wallet.totalWithdrawn += Math.abs(amount);
      }

      await wallet.save();

      // Create transaction record
      const reference = `ADMIN_ADJ_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const transaction = await WalletTransaction.create({
        walletId: wallet._id,
        userId: wallet.userId,
        type: 'adjustment',
        category: 'admin_adjustment',
        amount,
        currency: wallet.currency,
        balanceBefore,
        balanceAfter,
        status: 'completed',
        reference,
        description: `Admin balance adjustment: ${reason}`,
        processedAt: new Date(),
        metadata: {
          adminId,
          reason,
          adjustmentType: amount > 0 ? 'credit' : 'debit',
          idempotencyKey: reference
        }
      });

      // Send notification to user
      await this.notificationService.createNotification({
        userId: wallet.userId.toString(),
        type: 'announcement',
        title: amount > 0 ? 'Wallet Credited' : 'Wallet Debited',
        message: `Your wallet has been ${amount > 0 ? 'credited with' : 'debited'} ${this.formatCurrency(Math.abs(amount), wallet.currency)}. Reason: ${reason}`,
        data: {
          walletId: wallet._id.toString(),
          amount,
          transactionId: transaction._id.toString()
        }
      });

      // Send real-time update
      try {
        realTimeNotificationService.sendWalletBalanceUpdate(wallet.userId.toString(), {
          currency: wallet.currency,
          available: wallet.balance,
          frozen: wallet.frozenBalance,
          total: wallet.balance + wallet.frozenBalance,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error("Failed to send real-time balance update:", error);
      }

      return {
        wallet: {
          _id: wallet._id,
          balance: wallet.balance,
          frozenBalance: wallet.frozenBalance,
          currency: wallet.currency
        },
        transaction
      };
    } catch (error) {
      console.error("Adjust balance error:", error);
      throw error;
    }
  }

  /**
   * Add admin note to wallet
   */
  async addAdminNote(walletId: string, note: string, adminId: string) {
    try {
      const wallet = await Wallet.findById(walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Get admin user details
      const admin = await User.findById(adminId).select('displayName username').lean();
      const adminName = admin?.displayName || admin?.username || 'Admin';

      // Append note with timestamp and admin info
      const timestamp = new Date().toISOString();
      const noteEntry = `[${timestamp}] ${adminName}: ${note}`;

      wallet.adminNotes = wallet.adminNotes
        ? `${wallet.adminNotes}\n${noteEntry}`
        : noteEntry;

      await wallet.save();

      return {
        success: true,
        note: noteEntry
      };
    } catch (error) {
      console.error("Add admin note error:", error);
      throw error;
    }
  }

  /**
   * Helper method to format currency
   */
  private formatCurrency(amount: number, currency: string): string {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  }
}
