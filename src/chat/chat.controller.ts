import { Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MediaService } from "./media.service";

@Controller('chats')
export class ChatController{
    constructor(private mediaService : MediaService){

    }

    @Post('upload-file')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file){
        return this.mediaService.uploadFile(file)
    }

    @Post('get-file')
    getFile(@Body() {key} : {key : string}){
        return this.mediaService.getFile(key)
    }
}