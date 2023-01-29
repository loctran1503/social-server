export interface CreateMediaDto {
    
  name: string;

  fileName: string;

  mimeType: string;

  size: number;

  key: string;
}

export interface MediaDto{
  originalname: string,
  mimetype: string,
  size:number,
  buffer:Buffer
}
