import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Yêu cầu 3: Đăng ký người dùng
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  // Yêu cầu 4: Đăng nhập nhận JWT Token (Trả về token trong headers)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto.username, dto.password);
    
    // Thiết lập token vào header Authorization chuẩn
    res.setHeader('Authorization', `Bearer ${result.access_token}`);
    
    // Thiết lập thêm vào custom header để dễ kiểm tra trong Postman
    res.setHeader('x-access-token', result.access_token);
    
    return {
      message: 'Đăng nhập thành công!',
      user: result.user,
    };
  }

  // Yêu cầu 4: Bảo vệ API (Authorization) với JWT
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    // Trả về thông tin user đã giải mã từ JWT token
    return req['user'];
  }

  // Yêu cầu 1: Cài đặt Cookies (Demo ghi)
  @Get('set-cookie')
  setCookie(@Res({ passthrough: true }) res: Response) {
    res.cookie('antigravity_test_cookie', 'nest_cookies_work_fine', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });
    return { message: 'Đã tạo cookie thành công!' };
  }

  // Yêu cầu 1: Cài đặt Cookies (Demo đọc)
  @Get('get-cookie')
  getCookie(@Req() req: Request) {
    const cookieValue = req.cookies?.['test_cookie'];
    return {
      message: 'Đọc cookie từ Client',
      cookie: cookieValue || 'Không tìm thấy cookie test_cookie',
    };
  }

  // Yêu cầu 2: Cài đặt Session (Demo ghi)
  @Get('set-session')
  setSession(@Req() req: any) {
    req.session.username = 'NestUser';
    req.session.views = (req.session.views || 0) + 1;
    return {
      message: 'Đã lưu thông tin vào Session thành công!',
      session: {
        username: req.session.username,
        views: req.session.views,
      },
    };
  }

  // Yêu cầu 2: Cài đặt Session (Demo đọc)
  @Get('get-session')
  getSession(@Req() req: any) {
    return {
      message: 'Đọc thông tin từ Session',
      session: {
        username: req.session.username || 'Chưa thiết lập',
        views: req.session.views || 0,
      },
    };
  }
}
