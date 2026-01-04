import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * This route handles incoming webhooks from various integration providers.
 * It doesn't require authentication because external services call this endpoint.
 * Instead, security is provided through webhook secrets or signature validation.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the integration provider from the URL
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const integrationId = searchParams.get('id');
    
    if (!provider || !integrationId) {
      return NextResponse.json(
        { error: 'Missing provider or integration ID' },
        { status: 400 }
      );
    }
    
    // Get the raw body
    const rawBody = await request.text();
    
    // For actual implementation, we'd validate the webhook signature here
    // Each provider has their own method of signing webhooks
    // Example pseudo-code:
    // const isValidWebhook = validateWebhookSignature(provider, request.headers, rawBody);
    // if (!isValidWebhook) {
    //   return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    // }
    
    // Parse the body
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error('Failed to parse webhook body as JSON:', e);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    console.log(`Received webhook from ${provider} for integration ${integrationId}:`, body);
    
    // Process the webhook based on provider type
    switch (provider.toLowerCase()) {
      case 'stripe':
        return handleStripeWebhook(body, integrationId);
      
      case 'github':
        return handleGitHubWebhook(body, integrationId);
      
      case 'slack':
        return handleSlackWebhook(body, integrationId);
        
      case 'google':
        return handleGoogleWebhook(body, integrationId);
        
      default:
        // For any other provider, log the payload and return a success response
        console.log(`Unhandled provider webhook (${provider}):`, body);
        
        // Add to generic webhook log
        const logEntry = {
          provider,
          integrationId,
          eventType: body.event || body.type || 'unknown',
          receivedAt: new Date().toISOString(),
          payload: body
        };
        console.log('Generic webhook log entry:', logEntry);
        
        // In a real implementation, this would be saved to the database
        
        return NextResponse.json({ 
          success: true, 
          message: `Webhook from ${provider} received successfully`
        });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle Stripe webhooks
 */
async function handleStripeWebhook(body: any, integrationId: string) {
  // Stripe webhook types: https://stripe.com/docs/api/events/types
  const eventType = body.type;
  
  console.log(`Processing Stripe webhook: ${eventType}`);
  
  // Handle different event types
  switch (eventType) {
    case 'payment_intent.succeeded':
      // Process successful payment
      const paymentIntent = body.data.object;
      
      // In a real implementation, we would update our database
      console.log(`Payment succeeded: ${paymentIntent.id} for ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
      
      // Log the payment in our system
      const paymentLog = {
        provider: 'stripe',
        integrationId,
        type: 'payment',
        status: 'success',
        externalId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        timestamp: new Date().toISOString(),
        metadata: paymentIntent.metadata
      };
      console.log('Payment log:', paymentLog);
      
      break;
      
    case 'charge.failed':
      // Handle failed charge
      const failedCharge = body.data.object;
      
      console.log(`Charge failed: ${failedCharge.id}, reason: ${failedCharge.failure_message}`);
      
      // In a real implementation, we would update our database and notify the user
      break;
      
    // Add more event types as needed
    
    default:
      // Log unhandled event types
      console.log(`Unhandled Stripe event type: ${eventType}`);
      break;
  }
  
  // Always return a 200 response to Stripe to acknowledge receipt
  return NextResponse.json({ 
    success: true, 
    message: 'Stripe webhook processed successfully'
  });
}

/**
 * Handle GitHub webhooks
 */
async function handleGitHubWebhook(body: any, integrationId: string) {
  // GitHub sends the event type in the X-GitHub-Event header
  // For demo purposes, we'll assume it's in the body
  const eventType = body.event || 'ping';
  
  console.log(`Processing GitHub webhook: ${eventType}`);
  
  // Handle different event types
  switch (eventType) {
    case 'push':
      // Handle push event
      const pushEvent = body;
      
      // Log the push event
      console.log(`Repository push: ${pushEvent.repository?.full_name}, by ${pushEvent.sender?.login}`);
      
      break;
      
    case 'pull_request':
      // Handle pull request event
      const prEvent = body;
      const action = prEvent.action;
      const prNumber = prEvent.number;
      
      console.log(`Pull request #${prNumber} ${action}`);
      
      break;
      
    // Add more event types as needed
    
    default:
      // Log unhandled event types
      console.log(`Unhandled GitHub event type: ${eventType}`);
      break;
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'GitHub webhook processed successfully'
  });
}

/**
 * Handle Slack webhooks
 */
async function handleSlackWebhook(body: any, integrationId: string) {
  // Slack events API: https://api.slack.com/events-api
  // Slack sends different types of payloads, including URL verification
  
  // Handle URL verification challenge
  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge });
  }
  
  // For actual events
  if (body.type === 'event_callback') {
    const event = body.event;
    const eventType = event.type;
    
    console.log(`Processing Slack event: ${eventType}`);
    
    // Handle different event types
    switch (eventType) {
      case 'message':
        // Handle message event
        console.log(`Message in channel ${event.channel}: ${event.text}`);
        break;
        
      // Add more event types as needed
      
      default:
        // Log unhandled event types
        console.log(`Unhandled Slack event type: ${eventType}`);
        break;
    }
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'Slack webhook processed successfully'
  });
}

/**
 * Handle Google webhooks
 */
async function handleGoogleWebhook(body: any, integrationId: string) {
  // Google Cloud Pub/Sub pushes messages in this format
  // https://cloud.google.com/pubsub/docs/push
  
  const message = body.message;
  if (message) {
    // Decode the base64-encoded data if present
    let data = message.data ? Buffer.from(message.data, 'base64').toString() : null;
    
    if (data) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }
    
    console.log('Google Pub/Sub message:', {
      messageId: message.messageId,
      publishTime: message.publishTime,
      data
    });
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'Google webhook processed successfully'
  });
}

// GET handler for webhook configuration and testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  
  // Handle subscription verification (for services like Facebook)
  if (mode === 'subscribe') {
    const challenge = searchParams.get('hub.challenge');
    const verifyToken = searchParams.get('hub.verify_token');
    
    // Verify the token (this should match your configured token)
    // In a real implementation, this would be stored securely
    const expectedToken = 'your-webhook-verify-token';
    
    if (verifyToken === expectedToken) {
      return new NextResponse(challenge);
    } else {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 403 });
    }
  }
  
  // Default response for other GET requests
  return NextResponse.json({ 
    success: true, 
    message: 'Integration webhooks endpoint', 
    documentation: 'Configure external services to send webhooks to this URL with ?provider=X&id=Y query parameters'
  });
}
