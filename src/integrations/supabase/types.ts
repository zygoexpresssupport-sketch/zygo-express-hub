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
      quote_requests: {
        Row: {
          assigned_rider_id: string | null
          confirmed_at: string | null
          created_at: string
          delivered_at: string | null
          details: string | null
          dropoff: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          id: string
          name: string
          notes: string | null
          paid_at: string | null
          payment_provider: string | null
          payment_reference: string | null
          phone: string
          pickup: string
          pickup_lat: number | null
          pickup_lng: number | null
          price: number | null
          route_distance_m: number | null
          route_duration_s: number | null
          source: string
          status: string
          tracking_code: string | null
        }
        Insert: {
          assigned_rider_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          details?: string | null
          dropoff: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          name: string
          notes?: string | null
          paid_at?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          phone: string
          pickup: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          price?: number | null
          route_distance_m?: number | null
          route_duration_s?: number | null
          source?: string
          status?: string
          tracking_code?: string | null
        }
        Update: {
          assigned_rider_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          details?: string | null
          dropoff?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          name?: string
          notes?: string | null
          paid_at?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          phone?: string
          pickup?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          price?: number | null
          route_distance_m?: number | null
          route_duration_s?: number | null
          source?: string
          status?: string
          tracking_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_assigned_rider_id_fkey"
            columns: ["assigned_rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      riders: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string
          signed_in_at: string | null
          slot: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string
          signed_in_at?: string | null
          slot: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string
          signed_in_at?: string | null
          slot?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      assign_next_rider: { Args: { _quote_id: string }; Returns: string }
      claim_first_admin: { Args: never; Returns: boolean }
      confirm_quote: { Args: { _id: string }; Returns: string }
      customer_history: {
        Args: { _phone: string }
        Returns: {
          delivered: number
          first_seen: string
          last_seen: string
          tier: string
          total_requests: number
          total_spent: number
        }[]
      }
      generate_tracking_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_manual_request: {
        Args: {
          _details: string
          _dropoff: string
          _name: string
          _phone: string
          _pickup: string
          _source: string
        }
        Returns: string
      }
      lookup_tracking: {
        Args: { _code: string }
        Returns: {
          confirmed_at: string
          created_at: string
          dropoff: string
          dropoff_lat: number
          dropoff_lng: number
          paid_at: string
          pickup: string
          pickup_lat: number
          pickup_lng: number
          price: number
          status: string
          tracking_code: string
        }[]
      }
      mark_quote_paid: {
        Args: { _provider: string; _reference: string; _tracking_code: string }
        Returns: boolean
      }
      rider_daily_stats: {
        Args: { _day: string }
        Returns: {
          deliveries: number
          in_progress: number
          is_active: boolean
          name: string
          revenue: number
          rider_id: string
          signed_in_at: string
          slot: number
        }[]
      }
      rider_sign_in: { Args: { _id: string }; Returns: boolean }
      rider_sign_out: { Args: { _id: string }; Returns: boolean }
      set_quote_price: {
        Args: { _id: string; _price: number }
        Returns: boolean
      }
      update_quote_status: {
        Args: { _id: string; _status: string }
        Returns: boolean
      }
      update_rider: {
        Args: { _id: string; _name: string; _phone: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
