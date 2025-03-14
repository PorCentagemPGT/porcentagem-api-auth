import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { ApiBearerAuthWithDocs } from './decorators/api-bearer-auth.decorator';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login do usuário',
    description: `
      Endpoint para autenticação do usuário.
      Retorna um par de tokens (access e refresh) para acesso aos recursos.
      
      O access token deve ser enviado no header Authorization de todas as requisições.
      O refresh token deve ser armazenado de forma segura e usado apenas para
      obter um novo par de tokens quando o access token expirar.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens gerados com sucesso',
    type: AuthResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Login request started - userId: ${loginDto.userId}`);
    const result = await this.authService.generateTokens(loginDto.userId);
    this.logger.log(`Login request completed - userId: ${loginDto.userId}`);
    return result;
  }

  @Get('validate')
  @ApiBearerAuthWithDocs()
  @ApiOperation({
    summary: 'Valida um token JWT',
    description: `
      Endpoint para validar um token JWT.
      Retorna informações sobre a validade do token, incluindo:
      - ID do usuário dono do token
      - Se o token é válido
      - Tempo restante de validade em segundos
      
      Útil para verificar se um token ainda é válido antes de
      fazer uma requisição que o utilize.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Token validado com sucesso',
    type: ValidateTokenDto,
  })
  async validate(
    @Headers('authorization') authHeader: string,
  ): Promise<ValidateTokenDto> {
    this.logger.log('Token validation request started');

    if (!authHeader) {
      this.logger.warn(
        'Token validation failed - No authorization header provided',
      );
      throw new UnauthorizedException('Token not provided or invalid format');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn(
        'Token validation failed - Invalid authorization header format',
      );
      throw new UnauthorizedException('Token not provided or invalid format');
    }

    const token = authHeader.substring(7);
    const result = await this.authService.validateToken(token);

    this.logger.log(
      `Token validation completed - userId: ${result.userId}, valid: ${result.isValid}`,
    );

    return result;
  }

  @Post('refresh')
  @ApiBearerAuthWithDocs()
  @ApiOperation({
    summary: 'Refresh de tokens',
    description: `
      Endpoint para renovar os tokens de acesso.
      Utiliza o refresh token para gerar um novo par de tokens.
      
      O refresh token deve ser enviado no header Authorization.
      Após o refresh, o token antigo será invalidado e não poderá
      mais ser usado.
      
      Retorna um novo par de tokens (access e refresh).
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens renovados com sucesso',
    type: RefreshTokenDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado ou sessão não encontrada',
  })
  async refresh(
    @Headers('authorization') authHeader: string,
  ): Promise<RefreshTokenDto> {
    this.logger.log('Token refresh request started');

    if (!authHeader) {
      this.logger.warn(
        'Token refresh failed - No authorization header provided',
      );
      throw new UnauthorizedException('Token not provided or invalid format');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn(
        'Token refresh failed - Invalid authorization header format',
      );
      throw new UnauthorizedException('Token not provided or invalid format');
    }

    const token = authHeader.substring(7);
    const result = await this.authService.refreshToken(token);

    this.logger.log('Token refresh completed');

    return result;
  }

  @Post('logout')
  @ApiBearerAuthWithDocs()
  @ApiOperation({
    summary: 'Logout do usuário',
    description: `
      Endpoint para realizar o logout do usuário.
      Invalida a sessão atual, impedindo o uso do refresh token.
      
      O token de refresh deve ser enviado no header Authorization.
      Após o logout, o token de refresh não poderá mais ser usado
      para obter novos tokens.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  @ApiResponse({
    status: 404,
    description: 'Sessão não encontrada ou já invalidada',
  })
  async logout(
    @Headers('authorization') authHeader: string,
  ): Promise<LogoutResponseDto> {
    this.logger.log('Logout request started');

    if (!authHeader) {
      this.logger.warn('Logout failed - No authorization header provided');
      throw new UnauthorizedException('Token not provided or invalid format');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn('Logout failed - Invalid authorization header format');
      throw new UnauthorizedException('Token not provided or invalid format');
    }

    const token = authHeader.substring(7);
    const result = await this.authService.logout(token);

    this.logger.log(`Logout completed - sessionId: ${result.sessionId}`);

    return result;
  }
}
