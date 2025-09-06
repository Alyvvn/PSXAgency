import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Define types for the request body
type OrderItem = {
  itemId: string;
  itemName: string;
  size: string;
  quantity: number;
  price: number;
};

type ShippingInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes?: string;
};

type OrderData = {
  items: OrderItem[];
  shipping: ShippingInfo;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
};

const resend = new Resend(process.env.EMAIL_API_KEY);

export async function POST(request: Request) {
  try {
    if (!process.env.EMAIL_API_KEY) {
      console.error('EMAIL_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const orderData: OrderData = await request.json();

    // Basic validation
    if (!orderData.items || !orderData.items.length) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    if (!orderData.shipping) {
      return NextResponse.json(
        { error: 'Shipping information is required' },
        { status: 400 }
      );
    }

    // Format order items for email
    const itemsHtml = orderData.items
      .map(
        (item) => `
        <tr>
          <td>${item.itemName} (${item.size})</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    // Create email HTML
    const emailHtml = `
      <h2>New Merch Order Received</h2>
      
      <h3>Order Summary</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
            <td>$${orderData.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Shipping:</strong></td>
            <td>$${orderData.shippingCost.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Tax:</strong></td>
            <td>$${orderData.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
            <td><strong>$${orderData.total.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>Shipping Information</h3>
      <p>
        ${orderData.shipping.firstName} ${orderData.shipping.lastName}<br>
        ${orderData.shipping.email}<br>
        ${orderData.shipping.phone}<br>
        ${orderData.shipping.address}${orderData.shipping.address2 ? '<br>' + orderData.shipping.address2 : ''}<br>
        ${orderData.shipping.city}, ${orderData.shipping.state} ${orderData.shipping.zipCode}<br>
        ${orderData.shipping.country}
      </p>
      ${orderData.shipping.notes ? `<h4>Order Notes:</h4><p>${orderData.shipping.notes}</p>` : ''}
    `;

    // Send email to PSX agency
    const emailResponse = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.TO_EMAIL || 'duhcatdevs@proton.me',
      replyTo: orderData.shipping.email,
      subject: `New Merch Order from ${orderData.shipping.firstName} ${orderData.shipping.lastName}`,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error('Failed to send order email:', emailResponse.error);
      throw new Error('Failed to send order email');
    }

    // Send confirmation email to customer
    const confirmationResponse = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: orderData.shipping.email,
      subject: 'Your PSX Merch Order Confirmation',
      html: `
        <h2>Thank you for your order!</h2>
        <p>We've received your order and will process it shortly.</p>
        <p>Order Total: $${orderData.total.toFixed(2)}</p>
        <p>If you have any questions, please reply to this email.</p>
        <p>Thank you for supporting PSX!</p>
      `,
    });

    if (confirmationResponse.error) {
      console.error('Failed to send confirmation email:', confirmationResponse.error);
      // Don't fail the request if confirmation email fails
      console.log('Order was processed but confirmation email failed to send');
    }

    return NextResponse.json({ 
      success: true,
      message: 'Order submitted successfully',
      orderId: emailResponse.data?.id
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process order',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
