export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      build_room_documents: {
        Row: {
          content: string
          created_at: string
          document_type: string
          id: string
          idea_id: string
          label: string
          status: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          document_type?: string
          id?: string
          idea_id: string
          label?: string
          status?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          document_type?: string
          id?: string
          idea_id?: string
          label?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "build_room_documents_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      deep_dive_reports: {
        Row: {
          archive: string
          broadcaster_fit: string
          commission_check: string
          created_at: string
          format_recommendation: string
          full_story: string
          generated_at: string
          id: string
          idea_id: string
          people: string
          red_flags: string
          rights_detail: string
          sources: string
          story_verified: boolean
          verdict: string
          verdict_reason: string
          verified_detail: string
          why_now: string
        }
        Insert: {
          archive?: string
          broadcaster_fit?: string
          commission_check?: string
          created_at?: string
          format_recommendation?: string
          full_story?: string
          generated_at?: string
          id?: string
          idea_id: string
          people?: string
          red_flags?: string
          rights_detail?: string
          sources?: string
          story_verified?: boolean
          verdict?: string
          verdict_reason?: string
          verified_detail?: string
          why_now?: string
        }
        Update: {
          archive?: string
          broadcaster_fit?: string
          commission_check?: string
          created_at?: string
          format_recommendation?: string
          full_story?: string
          generated_at?: string
          id?: string
          idea_id?: string
          people?: string
          red_flags?: string
          rights_detail?: string
          sources?: string
          story_verified?: boolean
          verdict?: string
          verdict_reason?: string
          verified_detail?: string
          why_now?: string
        }
        Relationships: [
          {
            foreignKeyName: "deep_dive_reports_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: true
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          archive_status: string
          commission_check: string
          comparables: string
          created_at: string
          format: string
          genre: string
          hook: string
          id: string
          location: string
          logline: string
          people_access: string
          rights_status: string
          slate_id: string
          sources: string
          target_broadcaster: string
          title: string
          why_now: string
        }
        Insert: {
          archive_status?: string
          commission_check?: string
          comparables?: string
          created_at?: string
          format?: string
          genre?: string
          hook?: string
          id?: string
          location?: string
          logline?: string
          people_access?: string
          rights_status?: string
          slate_id?: string
          sources?: string
          target_broadcaster?: string
          title: string
          why_now?: string
        }
        Update: {
          archive_status?: string
          commission_check?: string
          comparables?: string
          created_at?: string
          format?: string
          genre?: string
          hook?: string
          id?: string
          location?: string
          logline?: string
          people_access?: string
          rights_status?: string
          slate_id?: string
          sources?: string
          target_broadcaster?: string
          title?: string
          why_now?: string
        }
        Relationships: []
      }
      user_decisions: {
        Row: {
          created_at: string
          decision: string
          id: string
          idea_id: string
        }
        Insert: {
          created_at?: string
          decision: string
          id?: string
          idea_id: string
        }
        Update: {
          created_at?: string
          decision?: string
          id?: string
          idea_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_decisions_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pipeline: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          notes: string[]
          slate_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          notes?: string[]
          slate_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          notes?: string[]
          slate_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pipeline_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: true
            referencedRelation: "ideas"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
