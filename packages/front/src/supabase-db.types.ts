export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      board: {
        Row: {
          created_at: string
          id: number
          opened_card_number_to_use: number | null
          pulled_card_number_to_change: number | null
          turn_user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          opened_card_number_to_use?: number | null
          pulled_card_number_to_change?: number | null
          turn_user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          opened_card_number_to_use?: number | null
          pulled_card_number_to_change?: number | null
          turn_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_opened_card_number_to_use_fkey"
            columns: ["opened_card_number_to_use"]
            isOneToOne: false
            referencedRelation: "card_variant"
            referencedColumns: ["number"]
          },
          {
            foreignKeyName: "board_pulled_card_number_to_change_fkey"
            columns: ["pulled_card_number_to_change"]
            isOneToOne: false
            referencedRelation: "card_variant"
            referencedColumns: ["number"]
          },
          {
            foreignKeyName: "board_turn_user_id_fkey"
            columns: ["turn_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      card_in_board_deck: {
        Row: {
          board_id: number | null
          card_number: number
          created_at: string
          id: number
        }
        Insert: {
          board_id?: number | null
          card_number: number
          created_at?: string
          id?: number
        }
        Update: {
          board_id?: number | null
          card_number?: number
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_in_board_deck_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_in_board_deck_card_number_fkey"
            columns: ["card_number"]
            isOneToOne: false
            referencedRelation: "card_variant"
            referencedColumns: ["number"]
          }
        ]
      }
      card_in_board_discard_deck: {
        Row: {
          board_id: number
          card_number: number
          created_at: string
          id: number
        }
        Insert: {
          board_id: number
          card_number: number
          created_at?: string
          id?: number
        }
        Update: {
          board_id?: number
          card_number?: number
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_in_board_discard_deck_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_in_board_discard_deck_card_number_fkey"
            columns: ["card_number"]
            isOneToOne: false
            referencedRelation: "card_variant"
            referencedColumns: ["number"]
          }
        ]
      }
      card_in_tower: {
        Row: {
          card_number: number
          card_tower_id: number
          created_at: string
          id: number
        }
        Insert: {
          card_number: number
          card_tower_id: number
          created_at?: string
          id?: number
        }
        Update: {
          card_number?: number
          card_tower_id?: number
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_in_tower_card_number_fkey"
            columns: ["card_number"]
            isOneToOne: false
            referencedRelation: "card_variant"
            referencedColumns: ["number"]
          },
          {
            foreignKeyName: "card_in_tower_card_tower_id_fkey"
            columns: ["card_tower_id"]
            isOneToOne: false
            referencedRelation: "card_tower"
            referencedColumns: ["id"]
          }
        ]
      }
      card_tower: {
        Row: {
          board_id: number
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          board_id: number
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          board_id?: number
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_tower_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_tower_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      card_variant: {
        Row: {
          number: number
          power: Database["public"]["Enums"]["Power"]
        }
        Insert: {
          number?: number
          power: Database["public"]["Enums"]["Power"]
        }
        Update: {
          number?: number
          power?: Database["public"]["Enums"]["Power"]
        }
        Relationships: []
      }
      user_in_lobby: {
        Row: {
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_in_lobby_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      Power:
        | "Remove_top"
        | "Remove_middle"
        | "Remove_bottom"
        | "Protect"
        | "Swap_neighbours"
        | "Swap_through_one"
        | "Move_down_by_two"
        | "Move_up_by_two"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
