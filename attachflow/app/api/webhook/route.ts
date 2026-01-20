import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { readFile } from 'fs/promises';

// Email configuration (for MVP using Gmail)
// In production, use proper email service like SendGrid
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Type for parsed AttachFlow data
interface AttachFlowFieldData {
  siteKey: string;
  formId: string;
  files: Array<{
    id: string;
    name: string;
    size: number;
  }>;
}

// Type for organized file attachments by field
interface FilesByField {
  [fieldName: string]: AttachFlowFieldData;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract all AttachFlow fields (they start with _attachflow_)
    const filesByField: FilesByField = {};
    const formData: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(body)) {
      if (key.startsWith('_attachflow_')) {
        // Extract field name from _attachflow_{fieldName}
        const fieldName = key.replace('_attachflow_', '');
        try {
          filesByField[fieldName] = JSON.parse(value as string);
        } catch (e) {
          console.error(`Failed to parse AttachFlow data for field ${fieldName}:`, e);
        }
      } else {
        // Regular form field
        formData[key] = value;
      }
    }
    
    const hasAttachments = Object.keys(filesByField).length > 0;
    
    if (hasAttachments) {
      // Get site configuration
      // TODO: Fetch from database based on siteKey
      const siteConfig = {
        email: 'user@example.com', // This should come from DB
        siteName: 'Example Site'
      };
      
      // Prepare email attachments organized by field
      const attachments: Array<{
        filename: string;
        content: Buffer;
      }> = [];
      
      // Build file list HTML organized by field name
      let filesHtml = '';
      
      for (const [fieldName, fieldData] of Object.entries(filesByField)) {
        const fieldFiles: string[] = [];
        
        for (const fileInfo of fieldData.files) {
          const fileMetadata = global.uploadedFiles?.get(fileInfo.id);
          if (fileMetadata) {
            try {
              const fileBuffer = await readFile(fileMetadata.path);
              // Prefix filename with field name for clarity
              const prefixedFilename = `${fieldName}_${fileMetadata.originalName}`;
              attachments.push({
                filename: prefixedFilename,
                content: fileBuffer
              });
              fieldFiles.push(fileMetadata.originalName);
            } catch (error) {
              console.error('Error reading file:', error);
            }
          }
        }
        
        if (fieldFiles.length > 0) {
          filesHtml += `
            <p><strong>${formatFieldName(fieldName)}:</strong></p>
            <ul>
              ${fieldFiles.map(f => `<li>${f}</li>`).join('')}
            </ul>
          `;
        }
      }
      
      // Format regular form data for email
      const formDataHtml = Object.entries(formData)
        .map(([key, value]) => `<p><strong>${formatFieldName(key)}:</strong> ${value}</p>`)
        .join('');
      
      // Send email with attachments
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: siteConfig.email,
        subject: `New form submission from ${siteConfig.siteName}`,
        html: `
          <h2>New Form Submission</h2>
          ${formDataHtml}
          <h3>Uploaded Files (${attachments.length} total)</h3>
          ${filesHtml || '<p>No files uploaded</p>'}
        `,
        attachments
      };
      
      await transporter.sendMail(mailOptions);
      
      // Clean up files after sending (optional for MVP)
      // In production, implement proper cleanup strategy
    }
    
    // Forward to original webhook if configured
    const originalWebhook = request.headers.get('X-Original-Webhook');
    if (originalWebhook) {
      await fetch(originalWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Helper to format field names for display (snake_case -> Title Case)
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}
