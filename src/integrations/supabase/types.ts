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
      embedding_documents: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          namespace: string
          title: string | null
          trigger_metrics: string[] | null
          type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          namespace: string
          title?: string | null
          trigger_metrics?: string[] | null
          type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          namespace?: string
          title?: string | null
          trigger_metrics?: string[] | null
          type?: string | null
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
      insights: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          description: string
          drills: Json | null
          feels: Json | null
          id: string
          insight_type: string | null
          swing_id: string
          title: string
          video_url: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          description: string
          drills?: Json | null
          feels?: Json | null
          id?: string
          insight_type?: string | null
          swing_id: string
          title: string
          video_url?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          drills?: Json | null
          feels?: Json | null
          id?: string
          insight_type?: string | null
          swing_id?: string
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_swing_id_fkey"
            columns: ["swing_id"]
            isOneToOne: false
            referencedRelation: "swings"
            referencedColumns: ["id"]
          },
        ]
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
      swings: {
        Row: {
          attack_angle: number | null
          ball_speed: number | null
          carry: number | null
          club_path: number | null
          club_speed: number | null
          club_type: string
          created_at: string | null
          curve: number | null
          d_plane_tilt: number | null
          dynamic_lie: number | null
          dynamic_loft: number | null
          face_angle: number | null
          face_to_path: number | null
          hang_time: number | null
          height: number | null
          id: string
          impact_height: number | null
          impact_offset: number | null
          landing_angle: number | null
          launch_angle: number | null
          launch_direction: number | null
          low_point: number | null
          low_point_height: number | null
          low_point_side: number | null
          max_height_distance: number | null
          session_name: string | null
          side: string | null
          side_total: string | null
          smash_factor: number | null
          spin_axis: number | null
          spin_loft: number | null
          spin_rate: number | null
          swing_direction: number | null
          swing_plane: number | null
          swing_radius: number | null
          total: number | null
          trackman_image_url: string | null
          user_id: string
        }
        Insert: {
          attack_angle?: number | null
          ball_speed?: number | null
          carry?: number | null
          club_path?: number | null
          club_speed?: number | null
          club_type: string
          created_at?: string | null
          curve?: number | null
          d_plane_tilt?: number | null
          dynamic_lie?: number | null
          dynamic_loft?: number | null
          face_angle?: number | null
          face_to_path?: number | null
          hang_time?: number | null
          height?: number | null
          id?: string
          impact_height?: number | null
          impact_offset?: number | null
          landing_angle?: number | null
          launch_angle?: number | null
          launch_direction?: number | null
          low_point?: number | null
          low_point_height?: number | null
          low_point_side?: number | null
          max_height_distance?: number | null
          session_name?: string | null
          side?: string | null
          side_total?: string | null
          smash_factor?: number | null
          spin_axis?: number | null
          spin_loft?: number | null
          spin_rate?: number | null
          swing_direction?: number | null
          swing_plane?: number | null
          swing_radius?: number | null
          total?: number | null
          trackman_image_url?: string | null
          user_id: string
        }
        Update: {
          attack_angle?: number | null
          ball_speed?: number | null
          carry?: number | null
          club_path?: number | null
          club_speed?: number | null
          club_type?: string
          created_at?: string | null
          curve?: number | null
          d_plane_tilt?: number | null
          dynamic_lie?: number | null
          dynamic_loft?: number | null
          face_angle?: number | null
          face_to_path?: number | null
          hang_time?: number | null
          height?: number | null
          id?: string
          impact_height?: number | null
          impact_offset?: number | null
          landing_angle?: number | null
          launch_angle?: number | null
          launch_direction?: number | null
          low_point?: number | null
          low_point_height?: number | null
          low_point_side?: number | null
          max_height_distance?: number | null
          session_name?: string | null
          side?: string | null
          side_total?: string | null
          smash_factor?: number | null
          spin_axis?: number | null
          spin_loft?: number | null
          spin_rate?: number | null
          swing_direction?: number | null
          swing_plane?: number | null
          swing_radius?: number | null
          total?: number | null
          trackman_image_url?: string | null
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_accuracy_average: {
        Args: { user_uuid: string }
        Returns: number
      }
      calculate_longest_drive: {
        Args: { user_uuid: string }
        Returns: number
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_embedding: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          filter_namespace?: string
        }
        Returns: {
          id: string
          namespace: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_user_stats: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
