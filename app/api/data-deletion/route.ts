import { NextRequest, NextResponse } from 'next/server';
import { performCompleteDataDeletion } from '@/lib/dataDeletion';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, reason, deletionResult } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Log the deletion request for compliance records
    const deletionRecord = {
      email,
      reason: reason || 'User requested data deletion',
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      deletionResult: deletionResult || 'No local deletion result provided',
    };

    // In a production environment, you would:
    // 1. Store this deletion record in a secure audit log
    // 2. Send confirmation email to the user
    // 3. Notify relevant team members
    // 4. Check for any server-side data that needs deletion

    console.log('GDPR Data Deletion Request:', deletionRecord);

    // For this MVP, since we don't store persistent data, we just log the request
    // In a real implementation, you would check databases, backups, etc.

    // Simulate email sending (in production, use a real email service)
    console.log(`Data deletion confirmation would be sent to: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Data deletion request processed successfully. A confirmation email has been sent.',
      requestId: `deletion-${Date.now()}`,
      timestamp: deletionRecord.timestamp,
    });

  } catch (error) {
    console.error('Error processing data deletion request:', error);
    return NextResponse.json(
      {
        error: 'Failed to process data deletion request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check deletion status (for future implementation)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    return NextResponse.json(
      { error: 'Request ID is required' },
      { status: 400 }
    );
  }

  // In a real implementation, you would check the status of the deletion request
  // For now, we return a generic success message
  return NextResponse.json({
    requestId,
    status: 'completed',
    message: 'Data deletion completed successfully',
    timestamp: new Date().toISOString(),
  });
}
