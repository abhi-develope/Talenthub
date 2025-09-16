import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs';
import * as path from 'path';

// Utility helpers
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sanitizeFilename(originalName: string): string {
  const name = path.parse(originalName).name.replace(/[^a-zA-Z0-9-_]/g, '_');
  const ext = path.parse(originalName).ext.toLowerCase();
  return `${name}${ext}`;
}

function generateStoredFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const base = sanitizeFilename(originalName);
  const ext = path.extname(base).toLowerCase();
  const nameOnly = path.basename(base, ext);
  return `${nameOnly}_${timestamp}_${random}${ext}`;
}

// Universal factory
export type AllowedList = ReadonlyArray<string>;

export interface UniversalMulterOptions {
  baseUploadDir?: string; // default 'uploads'
  subDirectory?: string; // e.g. 'resumes', 'images'
  allowedMimeTypes?: AllowedList; // optional: if omitted, MIME is not checked
  allowedExtensions?: AllowedList; // optional: if omitted, extension is not checked
  maxFileSizeBytes?: number; // default 5MB
  maxFiles?: number; // default 1
  customFileNamer?: (originalName: string) => string; // default generateStoredFilename
  useMemoryStorage?: boolean; // if true, stores files in memory (buffer) for cloud uploads
}

export function createMulterOptions(opts: UniversalMulterOptions = {}): MulterOptions {
  const {
    baseUploadDir = 'uploads',
    subDirectory = '',
    allowedMimeTypes,
    allowedExtensions,
    maxFileSizeBytes = 5 * 1024 * 1024,
    maxFiles = 1,
    customFileNamer,
    useMemoryStorage = false,
  } = opts;

  const destinationDir = path.resolve(process.cwd(), baseUploadDir, subDirectory);
  if (!useMemoryStorage) {
    ensureDirectoryExists(destinationDir);
  }

  return {
    storage: useMemoryStorage
      ? memoryStorage()
      : diskStorage({
          destination: (_req, _file, cb) => {
            cb(null, destinationDir);
          },
          filename: (_req, file, cb) => {
            try {
              const filename = (customFileNamer ?? generateStoredFilename)(file.originalname);
              cb(null, filename);
            } catch (err) {
              cb(err as Error, '');
            }
          },
        }),
    limits: {
      fileSize: maxFileSizeBytes,
      files: maxFiles,
    },
    fileFilter: (_req, file, cb) => {
      if (allowedMimeTypes && allowedMimeTypes.length > 0) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type (MIME)') as unknown as null, false);
        }
      }

      if (allowedExtensions && allowedExtensions.length > 0) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
          return cb(
            new BadRequestException(
              `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
            ) as unknown as null,
            false,
          );
        }
      }

      cb(null, true);
    },
  };
}

// Opinionated presets
export function resumeUploadOptions(): MulterOptions {
  const ALLOWED_RESUME_MIME_TYPES: AllowedList = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const ALLOWED_RESUME_EXTENSIONS: AllowedList = ['.pdf', '.doc', '.docx'];

  return createMulterOptions({
    subDirectory: 'resumes',
    allowedMimeTypes: ALLOWED_RESUME_MIME_TYPES,
    allowedExtensions: ALLOWED_RESUME_EXTENSIONS,
    maxFileSizeBytes: 5 * 1024 * 1024,
    maxFiles: 1,
  });
}

export function imageUploadOptions(): MulterOptions {
  const ALLOWED_IMAGE_MIME_TYPES: AllowedList = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  const ALLOWED_IMAGE_EXTENSIONS: AllowedList = ['.jpg', '.jpeg', '.png', '.webp'];

  return createMulterOptions({
    subDirectory: 'images',
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
    allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
    maxFileSizeBytes: 2 * 1024 * 1024,
    maxFiles: 1,
  });
}

// Backward-compatible alias
export function getResumeMulterOptions(): MulterOptions {
  return resumeUploadOptions();
}

// Convenience helper to create an interceptor inline
export function createFileInterceptor(
  fieldName: string,
  options?: UniversalMulterOptions,
) {
  return FileInterceptor(fieldName, createMulterOptions(options));
}


