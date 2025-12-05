import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { deleteUserData, logAuditEvent } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId, confirmationCode } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify confirmation code (simple implementation - in production, use more secure method)
    const expectedCode = `DELETE_${userId}_${new Date().toISOString().split('T')[0]}`;
    if (confirmationCode !== expectedCode) {
      return NextResponse.json(
        { error: 'Invalid confirmation code' },
        { status: 400 }
      );
    }

    // Log the deletion request before proceeding
    await logAuditEvent(userId, 'data_deletion', {
      action: 'deletion_requested',
      confirmationCode: confirmationCode.substring(0, 10) + '...', // Partial logging for security
      requestedAt: new Date().toISOString(),
    });

    // Perform complete data deletion
    const deletedCollections = await deleteUserData(userId);

    // Delete Firebase Auth user
    try {
      await getAuth().deleteUser(userId);
    } catch (authError) {
      console.error('Error deleting auth user:', authError);
      // Continue even if auth deletion fails, as data is already deleted
    }

    // Log successful deletion
    await logAuditEvent(userId, 'data_deletion', {
      action: 'deletion_completed',
      deletedCollections,
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      status: 'deleted',
      deletedAt: new Date().toISOString(),
      deletedCollections,
      message: 'All user data has been permanently deleted.',
    });

  } catch (error) {
    console.error('Data deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}

// GET endpoint to generate confirmation code for user
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

    // Generate confirmation code
    const confirmationCode = `DELETE_${userId}_${new Date().toISOString().split('T')[0]}`;

    // Log the confirmation code request
    await logAuditEvent(userId, 'data_deletion', {
      action: 'confirmation_code_requested',
      requestedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      confirmationCode,
      message: 'Use this confirmation code to proceed with account deletion. This action cannot be undone.',
      warning: 'This will permanently delete all your data including saved recommendations, usage data, and account information.',
    });

  } catch (error) {
    console.error('Confirmation code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate confirmation code' },
      { status: 500 }
    );
  }
}