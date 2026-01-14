import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

// For MVP, we'll use local file storage
const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const siteKey = formData.get('siteKey') as string;
    const formId = formData.get('formId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!siteKey) {
      return NextResponse.json(
        { error: 'Site key required' },
        { status: 400 }
      );
    }

    // TODO: Validate site key against database
    // For MVP, we'll accept any non-empty site key

    // Generate unique file ID
    const fileId = crypto.randomBytes(16).toString('hex');
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to local storage
    const filePath = join(UPLOAD_DIR, fileName);
    await writeFile(filePath, buffer);

    // TODO: Store file metadata in database
    const fileMetadata = {
      fileId,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      siteKey,
      formId,
      uploadedAt: new Date().toISOString(),
      path: filePath
    };

    // For MVP, we'll store in memory (replace with DB later)
    global.uploadedFiles = global.uploadedFiles || new Map();
    global.uploadedFiles.set(fileId, fileMetadata);

    return NextResponse.json({
      success: true,
      fileId,
      name: file.name,
      size: file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// Add types for global storage (temporary for MVP)
declare global {
  var uploadedFiles: Map<string, any>;
}