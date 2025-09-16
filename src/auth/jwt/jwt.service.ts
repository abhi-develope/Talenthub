import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'models/auth/access-token/accessToken.schema';
import { RefreshToken } from 'models/auth/refresh-token/refreshToken.schema';
import { User, ROLE_VALUES } from 'models/user/user.schema';
import { AuthService } from '../auth.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: ROLE_VALUES;
  subRole?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(AccessToken.name) private readonly accessTokenModel: Model<AccessToken>,
    @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * Generate access and refresh token pair
   */
  async generateTokenPair(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: (user._id as Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
      subRole: user.subRole,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store tokens in database
    await this.storeTokens(user._id as Types.ObjectId, accessToken, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Store access and refresh tokens in database
   */
  private async storeTokens(userId: Types.ObjectId, accessToken: string, refreshToken: string): Promise<void> {
    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Clean up old tokens for this user
    await this.cleanupOldTokens(userId);

    // Store new tokens
    await Promise.all([
      this.accessTokenModel.create({
        userId: userId as Types.ObjectId,
        token: accessToken,
        expiresAt: accessTokenExpiry,
      }),
      this.refreshTokenModel.create({
        userId: userId as Types.ObjectId,
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
      }),
    ]);
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      }) as JwtPayload;

      // Check if token exists in database and is not expired
      const storedToken = await this.accessTokenModel.findOne({
        token,
        expiresAt: { $gt: new Date() },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid or expired access token');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      // Check if token exists in database and is not expired or revoked
      const storedToken = await this.refreshTokenModel.findOne({
        token,
        expiresAt: { $gt: new Date() },
        isRevoked: false,
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);

    // Get user from database
    const user = await this.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke the used refresh token
    await this.revokeRefreshToken(refreshToken);

    // Generate new token pair
    return this.generateTokenPair(user);
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenModel.updateOne(
      { token },
      { isRevoked: true }
    );
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await Promise.all([
      this.accessTokenModel.deleteMany({ userId: new Types.ObjectId(userId) }),
      this.refreshTokenModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        { isRevoked: true }
      ),
    ]);
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    await Promise.all([
      this.accessTokenModel.deleteMany({ expiresAt: { $lt: new Date() } }),
      this.refreshTokenModel.deleteMany({ expiresAt: { $lt: new Date() } }),
    ]);
  }

  /**
   * Clean up old tokens for a specific user (keep only latest 5 refresh tokens)
   */
  private async cleanupOldTokens(userId: Types.ObjectId): Promise<void> {
    // Keep only the latest 5 refresh tokens per user
    const oldRefreshTokens = await this.refreshTokenModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(5);

    if (oldRefreshTokens.length > 0) {
      const oldTokenIds = oldRefreshTokens.map(token => token._id);
      await this.refreshTokenModel.deleteMany({ _id: { $in: oldTokenIds } });
    }

    // Clean up expired access tokens
    await this.accessTokenModel.deleteMany({
      userId,
      expiresAt: { $lt: new Date() },
    });
  }

  /**
   * Get user by ID using auth service
   */
  private async getUserById(userId: string): Promise<User | null> {
    return this.authService.getUserById(userId);
  }
}
