export type ContainerSizes = '2.5oz' | '4oz' | '6oz' | '8oz' | '10oz' | 'bulk';

export type ContainerCount = Record<ContainerSizes, number>;

export interface Order {
  fullName: string,
  itemName: string,
  flavor: string,
  flavorLabel: string,
  protein: string,
  proteinLabel: string,
  quantity: number,
}

export interface OrderStatistics {
  orders: number,
  meals: number,
  veggieMeals: number,
  thankYouBags: number,
  containers: ContainerCount,
}

export interface OrderError {
  error: Error | null,
  message: string,
  order: Order
}

export interface Meal {
  protein: string,
  flavor: string,
  weightOz: number,
  weightLbOz: string,
  backstockWeight: number,
  cookedWeightOz: number
}

export interface Ingredients {
  [protein: string]: { 
    [flavor: string]: number 
  }
}