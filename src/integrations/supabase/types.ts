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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_recovery: {
        Row: {
          code_hash: string
          user_id: string
        }
        Insert: {
          code_hash: string
          user_id: string
        }
        Update: {
          code_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          created_at: string
          due_at: string | null
          grade: string
          id: string
          kind: string
          room: string | null
          school_code: string
          subject: string
          target: string
          teacher_id: string
          title: string
        }
        Insert: {
          created_at?: string
          due_at?: string | null
          grade: string
          id?: string
          kind: string
          room?: string | null
          school_code: string
          subject: string
          target?: string
          teacher_id: string
          title: string
        }
        Update: {
          created_at?: string
          due_at?: string | null
          grade?: string
          id?: string
          kind?: string
          room?: string | null
          school_code?: string
          subject?: string
          target?: string
          teacher_id?: string
          title?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          at: string
          id: string
          items: Json
          kind: string
          label: string
          level: string
          ms: number | null
          subject: string
          user_id: string
        }
        Insert: {
          at?: string
          id: string
          items?: Json
          kind: string
          label: string
          level: string
          ms?: number | null
          subject: string
          user_id: string
        }
        Update: {
          at?: string
          id?: string
          items?: Json
          kind?: string
          label?: string
          level?: string
          ms?: number | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      drill_sets: {
        Row: {
          created_at: string
          items: Json
          level: string
          subject: string
          topic: string
        }
        Insert: {
          created_at?: string
          items?: Json
          level: string
          subject: string
          topic: string
        }
        Update: {
          created_at?: string
          items?: Json
          level?: string
          subject?: string
          topic?: string
        }
        Relationships: []
      }
      essay_answers: {
        Row: {
          ai_feedback: string | null
          ai_score: number | null
          answer: string
          attempt_id: string
          comment: string | null
          created_at: string
          graded_at: string | null
          graded_by: string | null
          max_points: number
          no: string
          prompt: string
          qid: string
          score: number | null
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_score?: number | null
          answer?: string
          attempt_id: string
          comment?: string | null
          created_at?: string
          graded_at?: string | null
          graded_by?: string | null
          max_points?: number
          no?: string
          prompt?: string
          qid: string
          score?: number | null
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          ai_score?: number | null
          answer?: string
          attempt_id?: string
          comment?: string | null
          created_at?: string
          graded_at?: string | null
          graded_by?: string | null
          max_points?: number
          no?: string
          prompt?: string
          qid?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          first_name: string
          grade: string | null
          id: string
          last_name: string
          room: string | null
          school_code: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          first_name: string
          grade?: string | null
          id: string
          last_name: string
          room?: string | null
          school_code: string
        }
        Update: {
          active?: boolean
          created_at?: string
          first_name?: string
          grade?: string | null
          id?: string
          last_name?: string
          room?: string | null
          school_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_code_fkey"
            columns: ["school_code"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["code"]
          },
        ]
      }
      reset_attempts: {
        Row: {
          at: string
          id: number
          key: string
        }
        Insert: {
          at?: string
          id?: never
          key: string
        }
        Update: {
          at?: string
          id?: never
          key?: string
        }
        Relationships: []
      }
      school_sites: {
        Row: {
          code: string
          opened_at: string
          opened_by: string | null
        }
        Insert: {
          code: string
          opened_at?: string
          opened_by?: string | null
        }
        Update: {
          code?: string
          opened_at?: string
          opened_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_sites_code_fkey"
            columns: ["code"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["code"]
          },
        ]
      }
      schools: {
        Row: {
          amphoe: string | null
          area: string | null
          code: string
          name: string
          province: string | null
        }
        Insert: {
          amphoe?: string | null
          area?: string | null
          code: string
          name: string
          province?: string | null
        }
        Update: {
          amphoe?: string | null
          area?: string | null
          code?: string
          name?: string
          province?: string | null
        }
        Relationships: []
      }
      teacher_classes: {
        Row: {
          created_at: string
          grade: string
          id: string
          room: string
          subject: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          room?: string
          subject: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          room?: string
          subject?: string
          teacher_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      my_school: { Args: { _user_id: string }; Returns: string }
      teacher_school: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "teacher" | "student" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["teacher", "student", "admin"],
    },
  },
} as const
