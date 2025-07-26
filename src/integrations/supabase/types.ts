export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          badge_type: string
          created_at: string
          criteria: Json
          description: string
          icon_emoji: string
          id: string
          name: string
        }
        Insert: {
          badge_type: string
          created_at?: string
          criteria: Json
          description: string
          icon_emoji: string
          id?: string
          name: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          criteria?: Json
          description?: string
          icon_emoji?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      handicap_history: {
        Row: {
          created_at: string
          handicap_value: number
          id: string
          recorded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          handicap_value: number
          id?: string
          recorded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          handicap_value?: number
          id?: string
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          current_handicap: number | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          photo_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_handicap?: number | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          photo_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_handicap?: number | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          photo_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      progress_tracker: {
        Row: {
          created_at: string | null
          id: string
          improvement_areas: string[] | null
          notes: string | null
          overall_score: number | null
          progress_summary: string | null
          strengths: string[] | null
          swing_data_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          improvement_areas?: string[] | null
          notes?: string | null
          overall_score?: number | null
          progress_summary?: string | null
          strengths?: string[] | null
          swing_data_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          improvement_areas?: string[] | null
          notes?: string | null
          overall_score?: number | null
          progress_summary?: string | null
          strengths?: string[] | null
          swing_data_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_tracker_swing_data_id_fkey"
            columns: ["swing_data_id"]
            isOneToOne: false
            referencedRelation: "swing_data"
            referencedColumns: ["id"]
          },
        ]
      }
      swing_data: {
        Row: {
          club_type: string
          coaching_notes: string | null
          created_at: string | null
          id: string
          is_baseline: boolean | null
          session_name: string | null
          structured_baseline_metrics: Json | null
          structured_metrics: Json | null
          swing_score: number | null
          trackman_image_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          club_type: string
          coaching_notes?: string | null
          created_at?: string | null
          id?: string
          is_baseline?: boolean | null
          session_name?: string | null
          structured_baseline_metrics?: Json | null
          structured_metrics?: Json | null
          swing_score?: number | null
          trackman_image_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          club_type?: string
          coaching_notes?: string | null
          created_at?: string | null
          id?: string
          is_baseline?: boolean | null
          session_name?: string | null
          structured_baseline_metrics?: Json | null
          structured_metrics?: Json | null
          swing_score?: number | null
          trackman_image_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          created_at: string
          earned_at: string
          id: string
          is_new: boolean | null
          progress_data: Json | null
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string
          earned_at?: string
          id?: string
          is_new?: boolean | null
          progress_data?: Json | null
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string
          earned_at?: string
          id?: string
          is_new?: boolean | null
          progress_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          assignment_type: string
          completed_at: string | null
          created_at: string
          current_handicap: number | null
          current_value: number | null
          goal_type: string
          id: string
          is_completed: boolean | null
          metric_name: string | null
          progress_percentage: number | null
          target_date: string
          target_handicap: number | null
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_type: string
          completed_at?: string | null
          created_at?: string
          current_handicap?: number | null
          current_value?: number | null
          goal_type: string
          id?: string
          is_completed?: boolean | null
          metric_name?: string | null
          progress_percentage?: number | null
          target_date: string
          target_handicap?: number | null
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_type?: string
          completed_at?: string | null
          created_at?: string
          current_handicap?: number | null
          current_value?: number | null
          goal_type?: string
          id?: string
          is_completed?: boolean | null
          metric_name?: string | null
          progress_percentage?: number | null
          target_date?: string
          target_handicap?: number | null
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          accuracy_average: number | null
          created_at: string | null
          id: string
          improvement_score: number | null
          last_updated: string | null
          longest_drive: number | null
          total_swings: number | null
          user_id: string
        }
        Insert: {
          accuracy_average?: number | null
          created_at?: string | null
          id?: string
          improvement_score?: number | null
          last_updated?: string | null
          longest_drive?: number | null
          total_swings?: number | null
          user_id: string
        }
        Update: {
          accuracy_average?: number | null
          created_at?: string | null
          id?: string
          improvement_score?: number | null
          last_updated?: string | null
          longest_drive?: number | null
          total_swings?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_video_views: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          video_title: string
          video_url: string
          watched_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          video_title: string
          video_url: string
          watched_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          video_title?: string
          video_url?: string
          watched_at?: string
        }
        Relationships: []
      }
      video_thumbnails: {
        Row: {
          created_at: string
          id: string
          thumbnail_path: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          thumbnail_path: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          thumbnail_path?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_accuracy_average: {
        Args: { user_uuid: string }
        Returns: number
      }
      calculate_longest_drive: {
        Args: { user_uuid: string }
        Returns: number
      }
      update_user_stats: {
        Args: { user_uuid: string }
        Returns: undefined
      }
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
