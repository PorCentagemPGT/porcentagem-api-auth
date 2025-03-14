import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SessionsService } from '../sessions/sessions.service';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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
    const expiresIn = this.calculateExpirationInSeconds(accessTokenTtl);

    this.logger.log(`Token generation completed - userId: ${userId}`);

    return {
      accessToken,
      refreshToken,
      expiresIn,
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

  /**
   * Realiza o logout do usuário invalidando sua sessão
   * @param token Token de refresh da sessão
   * @returns Informações sobre o logout
   */
  async logout(token: string): Promise<{
    message: string;
    sessionId: string;
    logoutTime: string;
  }> {
    this.logger.log('Logout request started');

    try {
      // Verifica se o token é válido
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (!payload.sub) {
        this.logger.warn('Token payload does not contain user ID');
        throw new UnauthorizedException('Invalid token format');
      }

      // Invalida a sessão usando o userId do token
      const session = await this.sessionsService.invalidateByUserId(
        payload.sub,
      );
      this.logger.log(`Logout completed - sessionId: ${session.id}`);

      return {
        message: 'Logout successful',
        sessionId: session.id,
        logoutTime: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Logout failed - Error: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Renova os tokens usando um refresh token válido
   * @param refreshToken Token de refresh atual
   * @returns Novos tokens de acesso e refresh
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenDto> {
    this.logger.log('Token refresh started');

    try {
      // Verifica se o refresh token é válido
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      if (!payload.sub) {
        this.logger.warn('Token payload does not contain user ID');
        throw new UnauthorizedException('Invalid token format');
      }

      // Valida e rotaciona o refresh token
      await this.sessionsService.validateAndRotateRefreshToken(
        payload.sub,
        refreshToken,
      );

      // Gera novos tokens
      const newTokens = await this.generateTokens(payload.sub);

      this.logger.log(`Token refresh completed - userId: ${payload.sub}`);

      return newTokens;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Token refresh failed - Error: ${errorMessage}`);
      throw error;
    }
  }

  private calculateExpirationInSeconds(ttl: string): number {
    const value = parseInt(ttl.replace(/[a-z]/i, ''));
    const unit = ttl.slice(-1).toLowerCase();

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60;
      case 'h':
        return value * 60 * 60;
      case 'm':
        return value * 60;
      case 's':
        return value;
      default:
        throw new Error('Invalid TTL format');
    }
  }
}
