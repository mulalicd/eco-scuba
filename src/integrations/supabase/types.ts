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
      projects: {
        Row: {
          created_at: string | null
          donor_deadline: string | null
          donor_name: string | null
          id: string
          language: string | null
          owner_id: string
          priority_area: string | null
          project_duration_months: number | null
          slug: string | null
          status: string | null
          tags: string[] | null
          title: string
          total_budget_km: number | null
          updated_at: string | null
          project_locations: Json | null
          requested_budget_km: number | null
          own_contribution_km: number | null
          direct_beneficiaries: number | null
          apa_state: Json | null
          rip_data: Json | null
          apa_collected_data: Json | null
          final_html: string | null
          final_pdf_url: string | null
        }
        Insert: {
          created_at?: string | null
          donor_deadline?: string | null
          donor_name?: string | null
          id?: string
          language?: string | null
          owner_id: string
          priority_area?: string | null
          project_duration_months?: number | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          total_budget_km?: number | null
          updated_at?: string | null
          project_locations?: Json | null
          requested_budget_km?: number | null
          own_contribution_km?: number | null
          direct_beneficiaries?: number | null
          apa_state?: Json | null
          rip_data?: Json | null
          apa_collected_data?: Json | null
          final_html?: string | null
          final_pdf_url?: string | null
        }
        Update: {
          created_at?: string | null
          donor_deadline?: string | null
          donor_name?: string | null
          id?: string
          language?: string | null
          owner_id?: string
          priority_area?: string | null
          project_duration_months?: number | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          total_budget_km?: number | null
          updated_at?: string | null
          project_locations?: Json | null
          requested_budget_km?: number | null
          own_contribution_km?: number | null
          direct_beneficiaries?: number | null
          apa_state?: Json | null
          rip_data?: Json | null
          apa_collected_data?: Json | null
          final_html?: string | null
          final_pdf_url?: string | null
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
      project_sections: {
        Row: {
          id: string
          project_id: string
          section_key: string
          section_title_bs: string
          content_html: string | null
          status: string
          version: number
          is_optional: boolean
          display_order: number
          assigned_to: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          section_key: string
          section_title_bs: string
          content_html?: string | null
          status?: string
          version?: number
          is_optional?: boolean
          display_order: number
          assigned_to?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          section_key?: string
          section_title_bs?: string
          content_html?: string | null
          status?: string
          version?: number
          is_optional?: boolean
          display_order?: number
          assigned_to?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      project_collaborators: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: [
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
          }
        ]
      }
      change_log: {
        Row: {
          id: string
          project_id: string
          section: string
          description: string
          apa_analysis: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          section: string
          description: string
          apa_analysis?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          section?: string
          description?: string
          apa_analysis?: string | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    collaboration_tasks: {
      Row: {
        id: string
        project_id: string
        section_id: string | null
        assigned_to: string
        assigned_by: string
        task_type: string
        title: string
        description: string | null
        due_date: string | null
        status: string
        priority: string
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        project_id: string
        section_id?: string | null
        assigned_to: string
        assigned_by: string
        task_type: string
        title: string
        description?: string | null
        due_date?: string | null
        status?: string
        priority?: string
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        project_id?: string
        section_id?: string | null
        assigned_to?: string
        assigned_by?: string
        task_type?: string
        title?: string
        description?: string | null
        due_date?: string | null
        status?: string
        priority?: string
        created_at?: string
        updated_at?: string
      }
      Relationships: [
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
        }
      ]
    }
    notifications: {
      Row: {
        id: string
        user_id: string
        project_id: string | null
        type: string
        title: string
        message: string | null
        is_read: boolean
        action_url: string | null
        created_at: string
      }
      Insert: {
        id?: string
        user_id: string
        project_id?: string | null
        type: string
        title: string
        message?: string | null
        is_read?: boolean
        action_url?: string | null
        created_at?: string
      }
      Update: {
        id?: string
        user_id?: string
        project_id?: string | null
        type?: string
        title?: string
        message?: string | null
        is_read?: boolean
        action_url?: string | null
        created_at?: string
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
        }
      ]
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
