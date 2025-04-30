import { Controller, Get, Query,ParseUUIDPipe } from '@nestjs/common';
import { SubredditsService } from './subreddits.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { Subreddit } from './entities/subreddit.entity';
import { CreateSubredditDto } from './dto/create-sub.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Body, Post, UseGuards, Request,Param,Patch,Delete } from '@nestjs/common/decorators';
import { UpdateSubredditDto } from './dto/update-sub.dto';


@Controller('subreddits')
export class SubredditsController {
    constructor(private readonly subredditService: SubredditsService) {}

    @UseGuards(JwtAuthGuard) // Require login to create
    @Post()
    create(@Body() createSubredditDto: CreateSubredditDto, @Request() req) {
        // req.user should be populated by JwtAuthGuard/Strategy
        return this.subredditService.create(createSubredditDto, req.user);
    }

    @Public()
    @Get()
    async findAll(@Query('limit') limit?:string, @Query('offset')offset?: string): Promise<Subreddit[] | null> {
        const take = limit ? parseInt(limit, 10) : 10;
        const skip = offset ? parseInt(offset, 10) : 0;
        return this.subredditService.findAll(); 
    }

    @Public() // Allow public access
    @Get(':idOrName') // Can accept ID or name
    findOne(@Param('idOrName') idOrName: string) {
        return this.subredditService.findOne(idOrName);
    }

    @UseGuards(JwtAuthGuard) // Require login to update
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string, // Validate ID is UUID if finding by ID only
        @Body() updateSubredditDto: UpdateSubredditDto,
        @Request() req
    ) {
        return this.subredditService.update(id, updateSubredditDto, req.user.id);
    }

    @UseGuards(JwtAuthGuard) // Require login to delete
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        return this.subredditService.remove(id, req.user.id);
    }




}
