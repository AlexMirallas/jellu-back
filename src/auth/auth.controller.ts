import { Controller, Request, Post, UseGuards, Res, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard'; 
import { JwtAuthGuard } from './guards/jwt-auth.guard';  
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from './decorators/public.decorator';
import { Response } from 'express'; // Import Response from express
import { UsersService } from '../users/users.service'; // Import UsersService if needed for registration 

@Controller('auth') 
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Handles user login using the LocalStrategy.
   * POST /auth/login
   * Expects { username: '...', password: '...' } in the request body.
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Res({ passthrough: true }) response: Response) { // Inject Response
    const { access_token } = await this.authService.login(req.user);

    response.cookie('access_token', access_token, { // Use a suitable cookie name
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only set Secure in production (requires HTTPS)
      sameSite: 'lax', // Or 'strict'
      maxAge: 3600000, 
      path: '/',
    });

    // You might return the user object or just a success message now
    // The token itself is in the cookie, not the body
    return { message: 'Login successful', user: req.user };
  }

  /**
   * Handles user registration.
   * POST /auth/register
   * Expects user details (like username, email, password) in the request body.
   */
  @Public() // Mark this route as public
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) { // Use a DTO for validation
    // Note: The register method in AuthService needs to handle password hashing
    // and user creation via UsersService.
    console.log('Register request DTO:', createUserDto); // Add logging
    // You might want to return only specific fields or the result of login() after registration
    const registeredUser = await this.authService.register(createUserDto);
    // Optionally log the user in immediately after registration:
    // return this.authService.login(registeredUser);
    // Or just return a success message or the created user (without password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = registeredUser;
    return result;
  }

  /**
   * Example of a protected route. Requires a valid JWT.
   * GET /auth/profile
   */
  @UseGuards(JwtAuthGuard) // Apply the JwtAuthGuard (which uses JwtStrategy)
  @Get('profile')
  getProfile(@Request() req) {
    // If JwtAuthGuard succeeds, req.user contains the payload returned by JwtStrategy.validate()
    console.log('Profile request user:', req.user); // Add logging
    // // This is the user object returned by JwtStrategy.validate()
    return req.user; // Return the user info from the JWT payload
  }

   /**
   * Example of a logout route (optional, depends on requirements).
   * POST /auth/logout
   */
   @UseGuards(JwtAuthGuard) // Still need JWT guard for logout logic
   @Post('logout')
   @HttpCode(HttpStatus.OK)
   async logout(@Res({ passthrough: true }) response: Response) {
       response.cookie('access_token', '', { // Clear the cookie
           httpOnly: true,
           secure: process.env.NODE_ENV === 'production',
           sameSite: 'lax',
           expires: new Date(0), 
           path: '/',
       });
       return { message: 'Logout successful' };
   }
}