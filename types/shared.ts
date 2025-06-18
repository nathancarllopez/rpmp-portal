import { MergeDeep } from "type-fest";
import { Database as GenDatabase, Json, Constants } from "./database.types";

export type Database = MergeDeep<
  GenDatabase,
  {
    public: {
      Views: {
        all_backstock: {
          Row: {
            available: boolean;
            created_at: string;
            display_color: string | null
            id: number;
            is_protein: boolean;
            name: string;
            name_label: string;
            sub_name: string | null
            sub_name_label: string | null
            weight: number;
          }
        },
        backstock_view: {
          Row: {
            available: boolean;
            created_at: string;
            display_color: string;
            flavor: string;
            id: number;
            protein: string;
            weight: number;
            protein_label: string;
            flavor_label: string;
          }
        },
        proteins_with_flavors: {
          Row: {
            flavor_labels: string[];
            flavor_names: string[];
            protein_label: string;
            protein_name: string;
            flavors: {
              name: string,
              label: string,
            }[];
          }
        }
      }
    }
  }
>

export type CamelCase<S extends string> = S extends `${infer P}_${infer R}`
  ? `${P}${Capitalize<CamelCase<R>>}`
  : S;

type SupaProfile = Database['public']['Tables']['profiles']['Row'];
export type Profile = {
  [K in keyof SupaProfile as CamelCase<K & string>]: SupaProfile[K]
};

export type ContainerSize = Database['public']['Enums']['container_size'];
export const containerSizes = Constants['public']['Enums']['container_size'];

export interface Order {
  fullName: string;
  itemName: string;
  container: ContainerSize;
  weight: number;
  flavor: string;
  flavorLabel: string;
  protein: string;
  proteinLabel: string;
  quantity: number;
};

export interface GeneralSettings extends Record<string, Json> {}
export interface OrderSettings extends Record<string, Json> {
  skipEdits: boolean;
}
export interface BackstockSettings extends Record<string, Json> {}
export interface TimecardsSettings extends Record<string, Json> {}
export interface FinancesSettings extends Record<string, Json> {}
export interface MenuSettings extends Record<string, Json> {}
export interface EmployeesSettings extends Record<string, Json> {}
export interface SettingsRow {
  userId: string;
  general: GeneralSettings;
  orders: OrderSettings;
  backstock: BackstockSettings;
  timecards: TimecardsSettings;
  finances: FinancesSettings;
  menu: MenuSettings;
  employees: EmployeesSettings;
}

export type UpdateSettingsInfo = Database['public']['Tables']['settings']['Update'];