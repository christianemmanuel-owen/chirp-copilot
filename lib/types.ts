export type OrderStatus =
  | "For Evaluation"
  | "Confirmed"
  | "For Delivery"
  | "Out for Delivery"
  | "For Refund"
  | "Refunded"
  | "Completed"
  | "Cancelled"

export interface ProductCustomizationOptions {
  colors?: string[]
  sizes?: string[]
}

export interface ProductVariantSize {
  size: string | null
  price: number
  stock: number
}

export type PreorderDownPaymentType = "percent" | "amount"

export interface PreorderDownPaymentConfig {
  type: PreorderDownPaymentType
  value: number
}

export interface PreorderDownPaymentSummary extends PreorderDownPaymentConfig {
  perUnitAmount: number
  totalAmount: number
}

export interface ProductVariant {
  id: number
  productId: number
  sku?: string | null
  color?: string | null
  description?: string | null
  size?: string | null
  image?: string
  images: string[]
  price: number
  stock: number
  isPreorder: boolean
  isActive: boolean
  sizes: ProductVariantSize[]
  preorderDownPayment?: PreorderDownPaymentConfig | null
  preorderMessage?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ProductCategory {
  id: number
  name: string
}

export interface ProductBrand {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  image: string
  images: string[]
  price: number
  stock: number
  categories: ProductCategory[]
  brand: ProductBrand | null
  variants: ProductVariant[]
  customizationOptions: ProductCustomizationOptions
  createdAt?: string
  updatedAt?: string
}

export interface ProductCategoryInput {
  id?: number
  name?: string | null
}

export interface ProductBrandInput {
  id?: number
  name?: string | null
}

export interface ProductVariantSizeInput {
  size?: string | null
  price: number
  stock: number
}

export interface ProductVariantInput {
  id?: number
  sku?: string | null
  color?: string | null
  description?: string | null
  image?: string | null
  images?: string[]
  isPreorder?: boolean
  isActive?: boolean
  sizes: ProductVariantSizeInput[]
  preorderDownPayment?: PreorderDownPaymentConfig | null
  preorderMessage?: string | null
}

export interface NewProductInput {
  name: string
  image?: string
  images?: string[] | null
  variants: ProductVariantInput[]
  categories?: ProductCategoryInput[]
  brand?: ProductBrandInput | null
}

export interface DiscountCampaignVariant {
  id: number
  campaignId: string
  variantId: number
  productId: number
  productName: string
  variantLabel: string | null
  sku: string | null
  color: string | null
  image: string
  basePrice: number
  discountPercent: number
  createdAt?: string
  updatedAt?: string
}

export interface DiscountCampaign {
  id: string
  name: string
  description?: string | null
  bannerImage?: string | null
  startDate: string
  endDate: string
  isActive: boolean
  variants: DiscountCampaignVariant[]
  createdAt?: string
  updatedAt?: string
}

export interface DiscountCampaignVariantInput {
  variantId: number
  discountPercent: number
}

export interface NewDiscountCampaignInput {
  name: string
  description?: string | null
  bannerImageUrl?: string | null
  startDate: string
  endDate: string
  isActive?: boolean
  variants: DiscountCampaignVariantInput[]
}

export interface UpdateProductInput {
  name?: string
  image?: string
  images?: string[] | null
  variants?: ProductVariantInput[]
  categories?: ProductCategoryInput[] | null
  brand?: ProductBrandInput | null
}

export interface OrderItem {
  productId: number
  variantId: number
  name: string
  image: string
  customizations: Record<string, string>
  price: number
  quantity: number
  preorderDownPayment?: PreorderDownPaymentSummary | null
}

export interface CustomerDetails {
  firstName: string
  lastName: string
  phone: string
  email: string
  instagramHandle?: string | null
}

export interface DeliveryDetails {
  unit: string
  lot: string
  street: string
  city: string
  region: string
  zipCode: string
  country: string
}

export type FulfillmentMethod = "delivery" | "pickup"

export interface PickupDetails {
  locationName: string
  unit: string
  lot: string
  street: string
  city: string
  region: string
  zipCode: string
  country: string
  notes: string
  scheduledDate: string | null
  scheduledTime: string | null
}

export interface Order {
  id: string
  date: string
  customer: CustomerDetails
  delivery: DeliveryDetails
  fulfillmentMethod: FulfillmentMethod
  pickup?: PickupDetails | null
  items: OrderItem[]
  paymentMethod: string
  proofOfPayment?: string | null
  subtotal: number
  vat: number
  shippingFee: number
  total: number
  trackingId: string | null
  status: OrderStatus
  isRead: boolean
  inventoryAdjusted?: boolean
  updatedAt?: string
}

export interface PaymentMethodConfig {
  id: string
  provider: string
  qrCodeUrl?: string | null
  accountName?: string | null
  instructions?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type NewPaymentMethodInput = Omit<PaymentMethodConfig, "id" | "createdAt" | "updatedAt">
export type UpdatePaymentMethodInput = Partial<NewPaymentMethodInput>

export type NewOrderInput = Omit<Order, "id" | "date" | "status" | "isRead" | "inventoryAdjusted"> & {
  captchaToken?: string
}
