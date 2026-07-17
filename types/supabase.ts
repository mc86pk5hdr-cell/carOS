export type FuelType = "petrol" | "diesel" | "hybrid" | "electric" | "other";
export type MileageUnit = "km" | "mi";
export type VehicleStatus = "active" | "archived";
export type TransmissionType = "automatic" | "manual";

export type ReminderItemType =
  | "road_tax"
  | "insurance"
  | "inspection"
  | "license"
  | "battery"
  | "oil"
  | "oil_filter"
  | "air_filter"
  | "brake_pads"
  | "coolant"
  | "transmission_oil"
  | "timing_belt"
  | "spark_plugs"
  | "tyres"
  | "custom";

export type MaintenanceCategory = ReminderItemType;
export type AttachmentFileType = "image" | "pdf";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          make: string;
          model: string;
          year: number | null;
          license_plate: string;
          engine_number: string | null;
          chassis_number: string | null;
          fuel_type: FuelType | null;
          transmission: TransmissionType | null;
          mileage: number | null;
          mileage_unit: MileageUnit;
          color: string | null;
          photo_path: string | null;
          purchase_date: string | null;
          status: VehicleStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          make: string;
          model: string;
          year?: number | null;
          license_plate: string;
          engine_number?: string | null;
          chassis_number?: string | null;
          fuel_type?: FuelType | null;
          transmission?: TransmissionType | null;
          mileage?: number | null;
          mileage_unit?: MileageUnit;
          color?: string | null;
          photo_path?: string | null;
          purchase_date?: string | null;
          status?: VehicleStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          make?: string;
          model?: string;
          year?: number | null;
          license_plate?: string;
          engine_number?: string | null;
          chassis_number?: string | null;
          fuel_type?: FuelType | null;
          transmission?: TransmissionType | null;
          mileage?: number | null;
          mileage_unit?: MileageUnit;
          color?: string | null;
          photo_path?: string | null;
          purchase_date?: string | null;
          status?: VehicleStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reminder_items: {
        Row: {
          id: string;
          vehicle_id: string;
          user_id: string;
          item_type: ReminderItemType;
          label: string | null;
          due_date: string | null;
          due_mileage: number | null;
          last_service_date: string | null;
          interval_days: number | null;
          interval_mileage: number | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          user_id: string;
          item_type: ReminderItemType;
          label?: string | null;
          due_date?: string | null;
          due_mileage?: number | null;
          last_service_date?: string | null;
          interval_days?: number | null;
          interval_mileage?: number | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          user_id?: string;
          item_type?: ReminderItemType;
          label?: string | null;
          due_date?: string | null;
          due_mileage?: number | null;
          last_service_date?: string | null;
          interval_days?: number | null;
          interval_mileage?: number | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      maintenance_records: {
        Row: {
          id: string;
          vehicle_id: string;
          user_id: string;
          date: string;
          workshop_name: string | null;
          invoice_number: string | null;
          mileage: number | null;
          cost: number | null;
          currency: string;
          category: MaintenanceCategory;
          notes: string | null;
          parts_replaced: string | null;
          labour_cost: number | null;
          next_recommended_service_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          user_id: string;
          date: string;
          workshop_name?: string | null;
          invoice_number?: string | null;
          mileage?: number | null;
          cost?: number | null;
          currency?: string;
          category: MaintenanceCategory;
          notes?: string | null;
          parts_replaced?: string | null;
          labour_cost?: number | null;
          next_recommended_service_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          user_id?: string;
          date?: string;
          workshop_name?: string | null;
          invoice_number?: string | null;
          mileage?: number | null;
          cost?: number | null;
          currency?: string;
          category?: MaintenanceCategory;
          notes?: string | null;
          parts_replaced?: string | null;
          labour_cost?: number | null;
          next_recommended_service_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      maintenance_attachments: {
        Row: {
          id: string;
          maintenance_record_id: string;
          user_id: string;
          file_path: string;
          file_type: AttachmentFileType;
          file_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          maintenance_record_id: string;
          user_id: string;
          file_path: string;
          file_type: AttachmentFileType;
          file_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          maintenance_record_id?: string;
          user_id?: string;
          file_path?: string;
          file_type?: AttachmentFileType;
          file_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type ReminderItem = Database["public"]["Tables"]["reminder_items"]["Row"];
export type MaintenanceRecord = Database["public"]["Tables"]["maintenance_records"]["Row"];
export type MaintenanceAttachment = Database["public"]["Tables"]["maintenance_attachments"]["Row"];
