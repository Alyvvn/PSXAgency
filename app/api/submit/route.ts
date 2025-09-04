import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.EMAIL_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received submission:', JSON.stringify(body, null, 2));

    if (!process.env.EMAIL_API_KEY) {
      console.error('EMAIL_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Format the email content based on submission type
    let emailContent = '';
    let emailSubject = 'New PSX Creative Factory Submission';

    if (body.type === 'bootstrap-store-order') {
      emailSubject = `🛍️ New Bootstrap Store Order: ${body.project?.name || 'New Order'}`;
      emailContent = `
🚀 **New Bootstrap Store Order**  
**Submitted:** ${new Date().toLocaleString()}

**Project Name:**  
${body.project?.name || 'N/A'}

**Contact:**  
${body.contact?.socials || 'N/A'}

**Order Details:**  
${body.description || 'No additional details provided'}

**Order Items:**  
${body.cart || 'No items in cart'}

**Next Steps:**  
1. Review the order details  
2. Contact the customer to confirm requirements  
3. Process the order in the system

---
This is an automated message from PSX Creative Engine.`;
    } else {
      // Original email format for other submissions
      emailContent = `
🎯 **New PSX Creative Factory Submission**

**Project Details:**
- Name: ${body.project?.name || 'N/A'}
- Chain: ${body.project?.chain || 'N/A'}
- Timeline: ${body.project?.timeline || 'N/A'}
- Budget: $${body.budget?.toLocaleString() || 'N/A'}

**Contact Information:**
- Name: ${body.contact?.name || 'N/A'}
- Email: ${body.contact?.email || 'N/A'}

**Selections:**
- Channels: ${body.selections?.channels?.join(', ') || 'N/A'}
- Content Types: ${body.selections?.content?.join(', ') || 'N/A'}
- Style Preferences: ${body.selections?.styles?.join(', ') || 'N/A'}

**Created At:** ${new Date().toLocaleString()}

**Full Submission:**
\`\`\`json
${JSON.stringify(body, null, 2)}
\`\`\``;
    }

    console.log('Sending email with content:', emailContent);

    // Send email using Resend SDK
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@psxcreative.com',
      to: process.env.TO_EMAIL || 'duhcatdevs@proton.me',
      subject: emailSubject,
      text: emailContent,
      replyTo: body.contact?.email || undefined
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send email notification',
          details: error.message || String(error)
        },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Submission received successfully',
      emailId: data?.id 
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
