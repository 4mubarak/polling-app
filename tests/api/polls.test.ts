
import { POST } from '@/app/api/polls/route';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'poll-123' }, error: null })),
        })),
      })),
    })),
  })),
}));

describe('/api/polls', () => {
  it('should create a new poll', async () => {
    const requestBody = {
      title: 'Test Poll',
      description: 'This is a test poll.',
      options: [{ text: 'Option 1' }, { text: 'Option 2' }],
      settings: {
        allowMultipleVotes: false,
        showResults: 'after_vote',
        isPublic: true,
      },
      expires_at: null,
    };

    const req = new NextRequest('http://localhost/api/polls', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData.poll.id).toBe('poll-123');
  });
});
