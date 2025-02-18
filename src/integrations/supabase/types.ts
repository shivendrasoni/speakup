export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          post_type: Database["public"]["Enums"]["post_type"]
          sector_id: string | null
          title: string
          updated_at: string
          upvotes: number | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_type: Database["public"]["Enums"]["post_type"]
          sector_id?: string | null
          title: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_type?: Database["public"]["Enums"]["post_type"]
          sector_id?: string | null
          title?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_updates: {
        Row: {
          complaint_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          complaint_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          complaint_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_updates_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          additional_details: Json | null
          ai_category: string | null
          attachments: Json | null
          complaint_id: string | null
          compliment_recipient: string | null
          created_at: string
          date: string | null
          description: string
          district: string | null
          district_id: number | null
          email: string | null
          feedback_category:
            | Database["public"]["Enums"]["feedback_category"]
            | null
          id: string
          is_public: boolean
          language: string
          phone: string | null
          phone_number: string | null
          pincode: string | null
          sector_id: string
          sector_specific_answers: Json | null
          sector_specific_data: Json | null
          shares: number | null
          state: string | null
          state_id: number | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          submission_type: Database["public"]["Enums"]["submission_type"]
          title: string | null
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
          view_count: number
          views: number | null
        }
        Insert: {
          additional_details?: Json | null
          ai_category?: string | null
          attachments?: Json | null
          complaint_id?: string | null
          compliment_recipient?: string | null
          created_at?: string
          date?: string | null
          description: string
          district?: string | null
          district_id?: number | null
          email?: string | null
          feedback_category?:
            | Database["public"]["Enums"]["feedback_category"]
            | null
          id?: string
          is_public?: boolean
          language?: string
          phone?: string | null
          phone_number?: string | null
          pincode?: string | null
          sector_id: string
          sector_specific_answers?: Json | null
          sector_specific_data?: Json | null
          shares?: number | null
          state?: string | null
          state_id?: number | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          submission_type?: Database["public"]["Enums"]["submission_type"]
          title?: string | null
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          view_count?: number
          views?: number | null
        }
        Update: {
          additional_details?: Json | null
          ai_category?: string | null
          attachments?: Json | null
          complaint_id?: string | null
          compliment_recipient?: string | null
          created_at?: string
          date?: string | null
          description?: string
          district?: string | null
          district_id?: number | null
          email?: string | null
          feedback_category?:
            | Database["public"]["Enums"]["feedback_category"]
            | null
          id?: string
          is_public?: boolean
          language?: string
          phone?: string | null
          phone_number?: string | null
          pincode?: string | null
          sector_id?: string
          sector_specific_answers?: Json | null
          sector_specific_data?: Json | null
          shares?: number | null
          state?: string | null
          state_id?: number | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          submission_type?: Database["public"]["Enums"]["submission_type"]
          title?: string | null
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          view_count?: number
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          id: number
          name: string
          state_id: number
        }
        Insert: {
          id?: number
          name: string
          state_id: number
        }
        Update: {
          id?: number
          name?: string
          state_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "districts_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      ngo_profiles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key_areas: string[] | null
          logo_url: string | null
          name: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key_areas?: string[] | null
          logo_url?: string | null
          name: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key_areas?: string[] | null
          logo_url?: string | null
          name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_upvotes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      sectors: {
        Row: {
          created_at: string
          id: string
          name: string
          questions: Json | null
          sub_categories: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          questions?: Json | null
          sub_categories?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          questions?: Json | null
          sub_categories?: Json | null
        }
        Relationships: []
      }
      states: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      webinar_registrations: {
        Row: {
          created_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinar_registrations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "webinar_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      webinar_sessions: {
        Row: {
          created_at: string
          description: string
          duration_minutes: number
          id: string
          max_participants: number | null
          ngo_id: string | null
          scheduled_at: string
          speaker_name: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          duration_minutes: number
          id?: string
          max_participants?: number | null
          ngo_id?: string | null
          scheduled_at: string
          speaker_name: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          max_participants?: number | null
          ngo_id?: string | null
          scheduled_at?: string
          speaker_name?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinar_sessions_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngo_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      complaint_status: "pending" | "in_progress" | "resolved" | "rejected"
      feedback_category:
        | "platform_experience"
        | "response_time"
        | "accessibility"
        | "other"
      post_type:
        | "discussion"
        | "success_story"
        | "resource"
        | "peer_support"
        | "qa_session"
      submission_type: "complaint" | "feedback" | "compliment"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
