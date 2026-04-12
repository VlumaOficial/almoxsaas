export type UserRole = 'super_admin' | 'owner' | 'manager' | 'operator';
export type CompanyStatus = 'trial' | 'active' | 'blocked' | 'cancelled';
export type SubscriptionType = 'trial' | 'monthly' | 'monthly_non_recurring' | 'quarterly' | 'semiannual' | 'annual' | 'lifetime';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type MovementType = 'entrada' | 'saida' | 'transferencia' | 'inventario' | 'ajuste';
export type MovementStatus = 'rascunho' | 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado';
export type PlanType = 'starter' | 'professional' | 'enterprise';

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          email: string;
          cnpj: string | null;
          phone: string | null;
          logo_url: string | null;
          status: CompanyStatus;
          plan: PlanType;
          trial_ends_at: string;
          is_email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          full_name: string;
          email: string;
          role: UserRole;
          is_active: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          company_id: string;
          category_id: string | null;
          supplier_id: string | null;
          name: string;
          description: string | null;
          sku: string | null;
          unit: string;
          min_stock: number;
          cost_price: number | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      stock: {
        Row: {
          id: string;
          company_id: string;
          product_id: string;
          warehouse_id: string;
          quantity: number;
          updated_at: string;
        };
      };
      // ... outras tabelas podem ser adicionadas conforme necessário
    };
  };
}