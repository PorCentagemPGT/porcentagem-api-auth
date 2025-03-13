import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SessionsService } from '../sessions/sessions.service';
import { ValidateTokenDto } from './dto/validate-token.dto';

interface JwtPayload {
  sub: string;
  exp: number;
  [key: string]: any;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionsService: SessionsService,
  ) {}

  /**
   * Generates access and refresh tokens for a user
   * @param userId User ID
   * @returns Access and refresh tokens
   */
  async generateTokens(userId: string): Promise<AuthResponseDto> {
    this.logger.log(`Token generation started - userId: ${userId}`);

    // Generate JWT payload
    const payload = { sub: userId };

    // Generate access token
    const accessToken = await this.jwtService.signAsync(payload);

    // Generate refresh token with longer TTL
    const refreshTokenTtl = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: refreshTokenTtl,
    });

    // Calculate refresh token expiration date
    const expiresAt = new Date();
    const days = parseInt(refreshTokenTtl.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + days);

    // Save session with refresh token
    await this.sessionsService.create({
      userId,
      refreshToken,
      expiresAt,
    });

    // Calculate access token expiration
    const accessTokenTtl = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    const minutes = parseInt(accessTokenTtl.replace('m', ''));

    this.logger.log(`Token generation completed - userId: ${userId}`);

    return {
      accessToken,
      refreshToken,
      expiresIn: minutes * 60, // Convert minutes to seconds
    };
  }

  /**
   * Validates a JWT token and returns information about its validity
   * @param token JWT token to validate
   * @returns Information about token validity
   */
  async validateToken(token: string): Promise<ValidateTokenDto> {
    this.logger.log(`Token validation started - token: ${token}`);

    try {
      // Verify token and decode payload
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      // Calculate remaining time
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const expiresIn = Math.max(
        0,
        Math.floor((expirationTime - currentTime) / 1000),
      );

      this.logger.log(
        `Token validation successful - userId: ${payload.sub}, expiresIn: ${expiresIn}s`,
      );

      return {
        userId: payload.sub,
        isValid: true,
        expiresIn,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Token validation failed - Error: ${errorMessage}`);

      return {
        userId: '',
        isValid: false,
        expiresIn: 0,
      };
    }
  }
}
