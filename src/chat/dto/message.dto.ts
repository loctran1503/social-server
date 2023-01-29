// import { MediaDto } from "./media.dto";

export interface CreateCommunityMessage{
    content:string;
    media?:any
}

export interface MediaDto{
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    size:number,
    buffer:Buffer
  }
  