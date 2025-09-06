import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key
const resendApiKey = process.env.EMAIL_API_KEY;

if (!resendApiKey) {
  console.error('ERROR: EMAIL_API_KEY is not set in environment variables');
} else {
  console.log('Resend API key found, initializing...');
}

const resend = new Resend(resendApiKey);

export async function POST(request: NextRequest) {
  try {
    console.log('Incoming request to /api/submit');
    
    if (!resendApiKey) {
      console.error('EMAIL_API_KEY is not set in environment variables');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error: EMAIL_API_KEY is not set',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('Received submission:', JSON.stringify(body, null, 2));
    
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
    } else if (body.type === 'merch-store-order') {
      emailSubject = `🛒 New Merchandise Order: ${body.project?.name || 'New Order'}`;
      const cartItems = Array.isArray(body.cart) 
        ? body.cart.map((item: any) => 
            `- ${item.title || 'Item'}: $${item.price || 0}`
          ).join('\n')
        : 'No items in cart';
      
      emailContent = `
🛍️ **New Merchandise Order**

**Submitted:** ${new Date().toLocaleString()}

**Project Name:**  
${body.project?.name || 'N/A'}

**Contact:**  
${body.contact?.socials || 'N/A'}

**Order Items:**  
${cartItems}

**Order Total:** $${body.total?.toLocaleString() || '0'}

**Order Details:**
- Design Count: ${body.metadata?.designs || 'N/A'}
- Production Method: ${body.metadata?.method || 'N/A'}
- Platform: ${body.metadata?.platform || 'N/A'}
- Quantity: ${body.metadata?.quantity || 'N/A'}
- Margin: ${body.metadata?.margin ? `${body.metadata.margin * 100}%` : 'N/A'}

**Next Steps:**  
1. Review the order details  
2. Contact the customer to confirm requirements  
3. Process the order in the system

---
This is an automated message from PSX Creative Engine.`;
    } else if (body.type === 'creative-factory-submission') {
      emailSubject = `🎬 New Creative Factory Submission: ${body.project?.name || 'New Project'}`;
      emailContent = `
🎯 **New PSX Creative Factory Submission**

**Project Details:**
- Name: ${body.project?.name || 'N/A'}
- Chain: ${body.project?.chain || 'N/A'}
- Timeline: ${body.project?.timeline || 'N/A'}
- Budget: $${body.project?.budget?.toLocaleString() || 'N/A'}
- Vision: ${body.project?.vision || 'N/A'}

**Contact Information:**
- Name: ${body.contact?.name || 'N/A'}
- Email: ${body.contact?.email || 'N/A'}
- Telegram: ${body.contact?.telegram || 'N/A'}

**Selections:**
- Channels: ${body.selections?.channels?.join(', ') || 'N/A'}
- Content Types: ${body.selections?.content?.join(', ') || 'N/A'}
- Style Preferences: ${body.selections?.styles?.join(', ') || 'N/A'}

**Created At:** ${new Date().toLocaleString()}

**Full Submission:**
\`\`\`json
${JSON.stringify(body, null, 2)}
\`\`\``;
    } else {
      emailContent = `
🎯 **New Submission**

**Type:** ${body.type || 'Unknown'}
**Submitted At:** ${new Date().toLocaleString()}

**Full Submission:**
\`\`\`json
${JSON.stringify(body, null, 2)}
\`\`\``;
    }

    console.log('Sending email...');
    console.log('From:', process.env.FROM_EMAIL || 'noreply@psxcreative.com');
    console.log('To:', process.env.TO_EMAIL || 'duhcatdevs@proton.me');
    console.log('Subject:', emailSubject);

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
          details: error.message || String(error),
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Submission received successfully',
      emailId: data?.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
