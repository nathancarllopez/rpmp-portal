import {
  Profile,
  CamelCase,
  Database,
  SettingsRow,
  ContainerSize,
  Order,
} from "./shared";

export interface NewUserInfo {
  email: string;
  role: string;
  profileData: {
    first_name: string;
    last_name: string;
    role: string;
    email: string;
    kitchen_rate: number | null;
    driving_rate: number | null;
  };
}

export type InsertBackstockRow =
  Database["public"]["Tables"]["backstock_proteins"]["Insert"];

export interface UpdateBackstockInfo {
  [id: string]: {
    weight: number;
    created_at: string; // timestampz in supabase, new Date().toISOString() here
    deleted_on?: string | null; // Including this property performs a soft delete, i.e., it changes the column in the backstock table, and excluding it ignores that column. The string is a timestampz and null undoes the soft delete
  };
}

type SupaAllBackstockRow = Database["public"]["Views"]["all_backstock"]["Row"];
export type AllBackstockRow = {
  [K in keyof SupaAllBackstockRow as CamelCase<
    K & string
  >]: SupaAllBackstockRow[K];
};

type SupaProteinRow = Database["public"]["Tables"]["proteins"]["Row"];
export type ProteinRow = {
  [K in keyof SupaProteinRow as CamelCase<K & string>]: SupaProteinRow[K];
};

type SupaFlavorRow = Database["public"]["Tables"]["flavors"]["Row"];
export type FlavorRow = {
  [K in keyof SupaFlavorRow as CamelCase<K & string>]: SupaFlavorRow[K];
};

type SupaOrderHeaderRow = Database["public"]["Tables"]["order_headers"]["Row"];
export type OrderHeaderRow = {
  [K in keyof SupaOrderHeaderRow as CamelCase<
    K & string
  >]: SupaOrderHeaderRow[K];
};

type SupaProteinWithFlavors =
  Database["public"]["Views"]["proteins_with_flavors"]["Row"];
export type ProteinWithFlavors = {
  [K in keyof SupaProteinWithFlavors as CamelCase<
    K & string
  >]: SupaProteinWithFlavors[K];
};

type SupaRoleInfoRow = Database["public"]["Tables"]["role_info"]["Row"];
export type RoleInfoRow = {
  [K in keyof SupaRoleInfoRow as CamelCase<K & string>]: SupaRoleInfoRow[K];
};

export interface DashboardRouteInfo {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  hasPermission: string[];
}

interface NavbarLinkInfo {
  id: string;
  label: string;
  href?: string;
}
export interface NavbarInfo extends NavbarLinkInfo {
  hasPermission: string[];
  icon: React.ReactNode;
  sublinks?: NavbarLinkInfo[];
}

export interface SelectedBackstockRow extends AllBackstockRow {
  action: "edit" | "delete";
}

export interface CreatedUserInfo {
  profile: Profile;
  profilePicUrl: string;
  settings: SettingsRow;
}

export interface IngredientAmounts {
  [name: string]: {
    label: string;
    amount: number;
    lbsPer: number;
    units: string;
  };
}

export interface OrderStatistics {
  orders: number;
  mealCount: number;
  veggieMeals: number;
  thankYouBags: number;
  totalProteinWeight: number;
  teriyakiCuppyCount: number;
  extraRoastedVeggies: number;
  proteinCubes: Record<string, number>;
  containers: Partial<Record<ContainerSize, number>>;
  proteins: IngredientAmounts;
  veggieCarbs: IngredientAmounts;
}

export interface OrderError {
  error: Error | null;
  message: string;
  order: Order;
}

export interface ProteinWeights {
  [protein: string]: {
    [flavor: string]: {
      proteinLabel: string;
      flavorLabel: string;
      weight: number;
    };
  };
}

export interface Meal {
  protein: string;
  proteinLabel: string;
  flavor: string;
  flavorLabel: string;
  originalWeight: number;
  weight: number;
  weightLbOz: string;
  backstockWeight: number;
  cookedWeight: number;
  displayColor: string | null;
}

export interface OrderReportInfo {
  orderData: Order[];
  stats: OrderStatistics;
  orderErrors: OrderError[];
  meals: Meal[];
  usedBackstockIds: Set<number>;
  pullListDatas: PullListDatas[];
}

type SupaVeggieCarbInfoRow =
  Database["public"]["Tables"]["veggie_carb_info"]["Row"];
export type VeggieCarbInfoRow = {
  [K in keyof SupaVeggieCarbInfoRow as CamelCase<
    K & string
  >]: K extends "amounts"
    ? { [amount: number]: number }
    : SupaVeggieCarbInfoRow[K];
};

export interface TimecardValues extends Profile {
  hasChanged: boolean;
  renderKey: number;
  profilePicUrl: string;
  drivingRate: number;
  kitchenRate: number;
  sundayStart: string;
  sundayEnd: string;
  sundayTotalHours: number;
  sundayOvertimeHours: number;
  sundayOvertimePay: number;
  sundayRegularPay: number;
  sundayTotalPay: number;
  mondayStart: string;
  mondayEnd: string;
  mondayTotalHours: number;
  mondayOvertimeHours: number;
  mondayOvertimePay: number;
  mondayRegularPay: number;
  mondayTotalPay: number;
  drivingStart: string;
  drivingEnd: string;
  drivingTotalHours: number;
  drivingOvertimeHours: number;
  drivingOvertimePay: number;
  drivingRegularPay: number;
  drivingTotalPay: number;
  costPerStop: number;
  drivingTotalCost: number;
  route1: number | "";
  route2: number | "";
  stops: number;
  miscDescription: string;
  miscAmount: number | "";
  miscPayCode: string;
  grandTotal: number;
}
export type TimecardFormValues = {
  employees: TimecardValues[];
};

type SupaPullListRow = Database["public"]["Tables"]["pull_list"]["Row"];
export type PullListRow = {
  [K in keyof SupaPullListRow as CamelCase<K & string>]: SupaPullListRow[K];
};

export interface PullListDatas {
  label: string;
  sunday: string;
  monday: string;
}

export type TimecardDisplayValues = {
  [K in keyof TimecardValues]: string | null;
};

type SupaTimecardHistoryRow =
  Database["public"]["Tables"]["timecards_history"]["Row"];
export type TimecardHistoryRow = {
  [K in keyof SupaTimecardHistoryRow as CamelCase<K & string>]: K extends "data"
    ? TimecardValues[]
    : SupaTimecardHistoryRow[K];
};

export type InsertTimecardHistoryRow =
  Database["public"]["Tables"]["timecards_history"]["Insert"];

type SupaOrderHistoryRow = Database["public"]["Tables"]["order_history"]["Row"];
export type OrderHistoryRow = {
  [K in keyof SupaOrderHistoryRow as CamelCase<K & string>]: K extends "data"
    ? OrderReportInfo
    : SupaOrderHistoryRow[K];
};

export type InsertOrderHistoryRow = Database["public"]["Tables"]["order_history"]["Insert"];
