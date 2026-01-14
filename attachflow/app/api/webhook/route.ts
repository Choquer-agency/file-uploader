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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract AttachFlow data if present
    const attachFlowData = body._attachflow_files ? JSON.parse(body._attachflow_files) : null;
    
    // Remove AttachFlow internal field from form data
    const formData = { ...body };
    delete formData._attachflow_files;
    
    if (attachFlowData) {
      // Get site configuration
      // TODO: Fetch from database based on siteKey
      const siteConfig = {
        email: 'user@example.com', // This should come from DB
        siteName: 'Example Site'
      };
      
      // Prepare email
      const attachments = [];
      
      // Get uploaded files
      for (const fileInfo of attachFlowData.files) {
        const fileMetadata = global.uploadedFiles?.get(fileInfo.id);
        if (fileMetadata) {
          try {
            const fileBuffer = await readFile(fileMetadata.path);
            attachments.push({
              filename: fileMetadata.originalName,
              content: fileBuffer
            });
          } catch (error) {
            console.error('Error reading file:', error);
          }
        }
      }
      
      // Format form data for email
      const formDataHtml = Object.entries(formData)
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
        .join('');
      
      // Send email with attachments
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: siteConfig.email,
        subject: `New form submission from ${siteConfig.siteName}`,
        html: `
          <h2>New Form Submission</h2>
          ${formDataHtml}
          <p><strong>Files attached:</strong> ${attachments.length}</p>
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