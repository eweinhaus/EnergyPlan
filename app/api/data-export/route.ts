import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { exportUserData, logAuditEvent } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify the user exists (basic validation)
    try {
      await getAuth().getUser(userId);
    } catch (error) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Export user data
    const userData = await exportUserData(userId);

    // Log the export event
    await logAuditEvent(userId, 'data_export', {
      exportFormat: 'json',
      exportedAt: new Date().toISOString(),
      dataTypes: Object.keys(userData),
    });

    // Return the data as JSON
    return NextResponse.json({
      data: userData,
      exportedAt: new Date().toISOString(),
      format: 'json',
      includesPersonalData: true,
    });

  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

// Also support GET requests for browser-based downloads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify the user exists
    try {
      await getAuth().getUser(userId);
    } catch (error) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Export user data
    const userData = await exportUserData(userId);

    // Log the export event
    await logAuditEvent(userId, 'data_export', {
      exportFormat: 'json',
      exportedAt: new Date().toISOString(),
      dataTypes: Object.keys(userData),
      method: 'download',
    });

    // Return as downloadable JSON file
    const jsonString = JSON.stringify(userData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="energy-plan-data-${userId}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (error) {
    console.error('Data export download error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
