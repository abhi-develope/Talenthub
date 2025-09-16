import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

let isConfigured = false;

function configureCloudinaryFromEnv(): void {
  if (isConfigured) return;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new InternalServerErrorException('Cloudinary environment variables are not set');
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  isConfigured = true;
}

export interface UploadBufferOptions {
  folder?: string; // e.g. 'resumes'
  publicId?: string;
  overwrite?: boolean;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: UploadBufferOptions = {},
): Promise<UploadApiResponse> {
  configureCloudinaryFromEnv();

  const uploadOptions: UploadApiOptions = {
    folder: options.folder,
    public_id: options.publicId,
    overwrite: options.overwrite ?? true,
    resource_type: options.resourceType ?? 'auto',
  };

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(new BadRequestException(error.message || 'Failed to upload file to Cloudinary'));
      }
      if (!result) {
        return reject(new InternalServerErrorException('Cloudinary returned no result'));
      }
      resolve(result);
    });

    uploadStream.end(buffer);
  });
}


