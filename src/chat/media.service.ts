import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { getMimeType } from 'src/util/getMimeType';
import { DataSource } from 'typeorm';
import { MediaDto } from './dto/media.dto';
import { MediaMessage } from './entities/media-message.entity';

@Injectable()
export class MediaService {
  private readonly region: string;
  private readonly accessKey: string;
  private readonly secretAccesskey: string;
  private readonly publicBucketName: string;
  private readonly logger = new Logger(MediaService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.region = configService.get('AWS_S3_REGION');
    this.accessKey = configService.get('AWS_ACCESS_KEY');
    this.secretAccesskey = configService.get('AWS_SECRET_ACCESS_KEY');
    this.publicBucketName = configService.get('AWS_S3_BUCKET_KEY');
  }

  getLinkMediaKey(media_key: string) {
    const s3 = this.getS3();
    return s3.getSignedUrl('getObject', {
      Key: media_key,
      Bucket: this.publicBucketName,
    });
  }

  // async uploadACL(media_id : string){
  //     const mediaRepository = this.dataSource.getRepository(MediaMessage);
  //     const mediaExisting = await mediaRepository.findOne({
  //         where:{
  //             mediaId:media_id
  //         }
  //     })
  //     if(!mediaExisting) return{
  //         success:false,
  //         code:404,

  //     }
  //     const s3 = this.getS3();
  //     s3.putObjectAcl({
  //         Bucket:this.publicBucketName,
  //         Key:mediaExisting.key,
  //         ACL:'public-read'
  //     },(err,data) => {
  //         if(err) this.logger.error(err);
  //         if(data) console.log('data: ',data);

  //     })

  //     return `${s3.endpoint.protocol}//${this.publicBucketName}.${s3.endpoint.hostname}`
  // }

  async getFile(key: string) {
    try {
      console.log(key);
      
      const s3 = this.getS3();
      s3.getObject(
        {
          Bucket: this.publicBucketName,
          Key: key,
        },
        (err, data) => {
          if (err) this.logger.error(err);
          if (data) console.log('data', data);
        },
      );
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
      };
    }
  }
  async uploadFile(file : MediaDto) : Promise<MediaMessage | null> {

    try {
      const params = {
        Bucket: this.publicBucketName,
        Key: file.originalname,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
        ContentDisposition: 'inline',
        CreateBucketConfiguration: {
          LocationConstraint: this.region,
        },
      };

      const s3 = this.getS3();
      const result = await s3
        .upload(params)
        .promise()
        .catch((err) => console.log(err));

      if(result){
        const mediaRepository = this.dataSource.getRepository(MediaMessage)
        return mediaRepository.create({
          key:result.Key,
          mimeType:getMimeType(file.mimetype),
          location:result.Location,
          size:file.size
        })
      }else{
        return null
      }
      
    } catch (error) {
      this.logger.error(error);
      return null
    }
  }

  getS3() {
    return new S3({
      region: this.region,
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretAccesskey,
    });
  }
}
