// Types shared by the frontend and backend

export interface Order {
  fullName: string;
  itemName: string;
  flavor: string;
  flavorLabel: string;
  protein: string;
  proteinLabel: string;
  quantity: number;
}