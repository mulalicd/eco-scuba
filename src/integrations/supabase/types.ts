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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          messages: Json | null
          project_id: string
          protocol: string
          section_id: string | null
          token_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          project_id: string
          protocol: string
          section_id?: string | null
          token_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          project_id?: string
          protocol?: string
          section_id?: string | null
          token_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "project_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      change_log: {
        Row: {
          affected_sections: string[] | null
          apa_analysis: string | null
          apa_elaboration: string | null
          applied_at: string | null
          change_description: string
          created_at: string | null
          id: string
          project_id: string
          requested_by: string
          status: string | null
        }
        Insert: {
          affected_sections?: string[] | null
          apa_analysis?: string | null
          apa_elaboration?: string | null
          applied_at?: string | null
          change_description: string
          created_at?: string | null
          id?: string
          project_id: string
          requested_by: string
          status?: string | null
        }
        Update: {
          affected_sections?: string[] | null
          apa_analysis?: string | null
          apa_elaboration?: string | null
          applied_at?: string | null
          change_description?: string
          created_at?: string | null
          id?: string
          project_id?: string
          requested_by?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_log_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_tasks: {
        Row: {
          assigned_by: string
          assigned_to: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string
          section_id: string | null
          status: string | null
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_by: string
          assigned_to: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id: string
          section_id?: string | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string
          assigned_to?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          section_id?: string | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_tasks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "project_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          project_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          project_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          project_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          organization: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          organization?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          organization?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_collaborators: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          project_id: string
          role: string
          section_assignments: string[] | null
          status: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          project_id: string
          role?: string
          section_assignments?: string[] | null
          status?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          project_id?: string
          role?: string
          section_assignments?: string[] | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_sections: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          content_html: string | null
          created_at: string | null
          display_order: number
          id: string
          is_optional: boolean | null
          project_id: string
          section_key: string
          section_title_bs: string
          status: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          content_html?: string | null
          created_at?: string | null
          display_order: number
          id?: string
          is_optional?: boolean | null
          project_id: string
          section_key: string
          section_title_bs: string
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          content_html?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          is_optional?: boolean | null
          project_id?: string
          section_key?: string
          section_title_bs?: string
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_sections_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_sections_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          apa_collected_data: Json | null
          apa_state: Json | null
          created_at: string | null
          direct_beneficiaries: number | null
          donor_deadline: string | null
          donor_name: string | null
          final_html: string | null
          final_pdf_url: string | null
          form_template_analysis: Json | null
          form_template_url: string | null
          id: string
          indirect_beneficiaries: number | null
          own_contribution_km: number | null
          owner_id: string
          priority_area: string | null
          project_duration_months: number | null
          project_end_date: string | null
          project_language: string | null
          project_locations: Json | null
          project_start_date: string | null
          requested_budget_km: number | null
          rip_data: Json | null
          slug: string | null
          status: string | null
          tags: string[] | null
          title: string
          total_budget_km: number | null
          updated_at: string | null
        }
        Insert: {
          apa_collected_data?: Json | null
          apa_state?: Json | null
          created_at?: string | null
          direct_beneficiaries?: number | null
          donor_deadline?: string | null
          donor_name?: string | null
          final_html?: string | null
          final_pdf_url?: string | null
          form_template_analysis?: Json | null
          form_template_url?: string | null
          id?: string
          indirect_beneficiaries?: number | null
          own_contribution_km?: number | null
          owner_id: string
          priority_area?: string | null
          project_duration_months?: number | null
          project_end_date?: string | null
          project_language?: string | null
          project_locations?: Json | null
          project_start_date?: string | null
          requested_budget_km?: number | null
          rip_data?: Json | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          total_budget_km?: number | null
          updated_at?: string | null
        }
        Update: {
          apa_collected_data?: Json | null
          apa_state?: Json | null
          created_at?: string | null
          direct_beneficiaries?: number | null
          donor_deadline?: string | null
          donor_name?: string | null
          final_html?: string | null
          final_pdf_url?: string | null
          form_template_analysis?: Json | null
          form_template_url?: string | null
          id?: string
          indirect_beneficiaries?: number | null
          own_contribution_km?: number | null
          owner_id?: string
          priority_area?: string | null
          project_duration_months?: number | null
          project_end_date?: string | null
          project_language?: string | null
          project_locations?: Json | null
          project_start_date?: string | null
          requested_budget_km?: number | null
          rip_data?: Json | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          total_budget_km?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      section_revisions: {
        Row: {
          change_description: string | null
          change_requested_by: string | null
          content_html: string
          created_at: string | null
          generated_by: string | null
          id: string
          project_id: string
          section_id: string
          version: number
        }
        Insert: {
          change_description?: string | null
          change_requested_by?: string | null
          content_html: string
          created_at?: string | null
          generated_by?: string | null
          id?: string
          project_id: string
          section_id: string
          version: number
        }
        Update: {
          change_description?: string | null
          change_requested_by?: string | null
          content_html?: string
          created_at?: string | null
          generated_by?: string | null
          id?: string
          project_id?: string
          section_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "section_revisions_change_requested_by_fkey"
            columns: ["change_requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_revisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_revisions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "project_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_templates: {
        Row: {
          display_order: number
          id: string
          is_optional: boolean | null
          section_key: string
          section_title_bs: string
        }
        Insert: {
          display_order: number
          id?: string
          is_optional?: boolean | null
          section_key: string
          section_title_bs: string
        }
        Update: {
          display_order?: number
          id?: string
          is_optional?: boolean | null
          section_key?: string
          section_title_bs?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_can_access_project: {
        Args: { project_uuid: string }
        Returns: boolean
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
