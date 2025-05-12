import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseUUIDPipe } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { VotesService } from '../votes/votes.service';

@Controller('posts') 
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly votesService: VotesService 
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createPostDto: CreatePostDto, @Request() req) {
        return this.postsService.create(createPostDto, req.user);
    }

    @Public()
    @Get()
    findAll(
        @Query('limit') limit?: string,
        @Query('offset') offset?: string
    ) {
        const take = limit ? parseInt(limit, 10) : 20;
        const skip = offset ? parseInt(offset, 10) : 0;
        return this.postsService.findAll(take, skip);
    }

    @Public()
    @Get('/subjellu/:subjelluId')
    findAllBySubjellu(
        @Param('subjelluId', ParseUUIDPipe) subjelluId: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string
    ) {
        const take = limit ? parseInt(limit, 10) : 20;
        const skip = offset ? parseInt(offset, 10) : 0;
        return this.postsService.findAllBySubjellu(subjelluId, take, skip);
    }


    @Public()
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.postsService.findOne(id);
    }

    @Public() 
    @Get(':id/with-comments') 
    findOneWithComments(@Param('id', ParseUUIDPipe) id: string) {
        return this.postsService.findOneWithComments(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePostDto: UpdatePostDto,
        @Request() req
    ) {
        return this.postsService.update(id, updatePostDto, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        return this.postsService.remove(id, req.user.id);
    }

    @Post(':id/vote')
@   UseGuards(JwtAuthGuard)
    async voteOnPost(@Param('id') postId: string, @Body('value') value: number, @Request() req) {
        const user = req.user;
        return this.votesService.voteOnPost(user, postId, value);
    }
}