export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string
          title: string
          description: string | null
          creator_id: string | null
          share_id: string
          options: PollOption[]
          settings: PollSettings
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          creator_id?: string | null
          share_id?: string
          options: PollOption[]
          settings?: PollSettings
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          creator_id?: string | null
          share_id?: string
          options?: PollOption[]
          settings?: PollSettings
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          user_id: string
          option_index: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          user_id: string
          option_index: number
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          user_id?: string
          option_index?: number
          created_at?: string
        }
      }
      anonymous_votes: {
        Row: {
          id: string
          poll_id: string
          option_index: number
          ip_hash: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_index: number
          ip_hash?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_index?: number
          ip_hash?: string | null
          session_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

export interface PollOption {
  id: string
  text: string
  color?: string
}

export interface PollSettings {
  allowMultipleVotes: boolean
  showResults: "immediately" | "after_vote" | "after_end"
  isPublic: boolean
  requireAuth?: boolean
}

export type Poll = Database["public"]["Tables"]["polls"]["Row"]
export type Vote = Database["public"]["Tables"]["votes"]["Row"]
export type AnonymousVote = Database["public"]["Tables"]["anonymous_votes"]["Row"]
