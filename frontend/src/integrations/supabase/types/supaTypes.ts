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
      backstock: {
        Row: {
          available: boolean
          created_at: string
          deleted_on: string | null
          flavor: string | null
          id: number
          protein: string
          weight: number
        }
        Insert: {
          available?: boolean
          created_at?: string
          deleted_on?: string | null
          flavor?: string | null
          id?: number
          protein: string
          weight: number
        }
        Update: {
          available?: boolean
          created_at?: string
          deleted_on?: string | null
          flavor?: string | null
          id?: number
          protein?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "backstock_flavor_fkey"
            columns: ["flavor"]
            isOneToOne: false
            referencedRelation: "flavors"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "backstock_protein_fkey"
            columns: ["protein"]
            isOneToOne: false
            referencedRelation: "proteins"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "backstock_protein_fkey"
            columns: ["protein"]
            isOneToOne: false
            referencedRelation: "proteins_with_flavors"
            referencedColumns: ["protein_name"]
          },
        ]
      }
      flavors: {
        Row: {
          created_at: string
          id: number
          label: string
          name: string
          proteins: string[] | null
        }
        Insert: {
          created_at?: string
          id?: number
          label: string
          name: string
          proteins?: string[] | null
        }
        Update: {
          created_at?: string
          id?: number
          label?: string
          name?: string
          proteins?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          driving_rate: number | null
          email: string
          first_name: string
          full_name: string
          id: number
          kitchen_rate: number | null
          last_name: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          driving_rate?: number | null
          email?: string
          first_name: string
          full_name?: string
          id?: number
          kitchen_rate?: number | null
          last_name: string
          role?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          driving_rate?: number | null
          email?: string
          first_name?: string
          full_name?: string
          id?: number
          kitchen_rate?: number | null
          last_name?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      proteins: {
        Row: {
          created_at: string
          display_color: string | null
          flavors: string[] | null
          id: number
          label: string
          name: string
          shrink: number
        }
        Insert: {
          created_at?: string
          display_color?: string | null
          flavors?: string[] | null
          id?: number
          label?: string
          name: string
          shrink?: number
        }
        Update: {
          created_at?: string
          display_color?: string | null
          flavors?: string[] | null
          id?: number
          label?: string
          name?: string
          shrink?: number
        }
        Relationships: []
      }
    }
    Views: {
      backstock_view: {
        Row: {
          available: boolean | null
          created_at: string | null
          display_color: string | null
          flavor: string | null
          id: number | null
          protein: string | null
          weight: number | null
        }
        Relationships: []
      }
      proteins_with_flavors: {
        Row: {
          flavor_labels: string[] | null
          flavor_names: string[] | null
          protein_label: string | null
          protein_name: string | null
        }
        Insert: {
          flavor_labels?: never
          flavor_names?: string[] | null
          protein_label?: string | null
          protein_name?: string | null
        }
        Update: {
          flavor_labels?: never
          flavor_names?: string[] | null
          protein_label?: string | null
          protein_name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      update_backstock_rows: {
        Args: { updates: Json }
        Returns: {
          id: number
          weight: number
          created_at: string
          deleted_on: string
        }[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
