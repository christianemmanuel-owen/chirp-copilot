import type { PaymentMethodConfig } from "@/lib/types"

export interface PaymentMethodCatalogEntry {
  id: string
  name: string
  description?: string
  brandColor: string
  logo: string
  sortOrder: number
}

export const PAYMENT_METHOD_CATALOG: PaymentMethodCatalogEntry[] = [
  {
    id: "gcash",
    name: "GCash",
    description: "Mobile wallet powered by Globe Telecom.",
    brandColor: "#007DFE",
    logo: "/payment-logos/gcash.png",
    sortOrder: 1,
  },
  {
    id: "maya",
    name: "Maya",
    description: "All-in-one digital bank and wallet (formerly PayMaya).",
    brandColor: "#000000",
    logo: "/payment-logos/maya.svg",
    sortOrder: 2,
  },
  {
    id: "bpi",
    name: "BPI Online",
    description: "Bank of the Philippine Islands fund transfer.",
    brandColor: "#B20000",
    logo: "/payment-logos/bpi.png",
    sortOrder: 3,
  },
  {
    id: "bdo",
    name: "BDO Pay",
    description: "BDO Unibank QR and online fund transfer.",
    brandColor: "#1556A7",
    logo: "/payment-logos/bdo.svg",
    sortOrder: 4,
  },
  {
    id: "unionbank",
    name: "UnionBank",
    description: "UnionBank of the Philippines fund transfer.",
    brandColor: "#FFFFFF",
    logo: "/payment-logos/unionbank.svg",
    sortOrder: 5,
  },
  {
    id: "gotyme",
    name: "GoTyme",
    description: "Digital bank powered by GoTyme Bank.",
    brandColor: "#00F0FB",
    logo: "/payment-logos/gotyme.svg",
    sortOrder: 6,
  },
] satisfies PaymentMethodCatalogEntry[]

export const SUPPORTED_PAYMENT_PROVIDERS = PAYMENT_METHOD_CATALOG.map((entry) => entry.id)

export function getPaymentMethodCatalogEntry(provider: string): PaymentMethodCatalogEntry | null {
  return PAYMENT_METHOD_CATALOG.find((entry) => entry.id === provider) ?? null
}

export function isSupportedPaymentProvider(provider: string): provider is (typeof SUPPORTED_PAYMENT_PROVIDERS)[number] {
  return SUPPORTED_PAYMENT_PROVIDERS.includes(provider)
}

export function getUnusedPaymentProviders(usedProviders: string[]): PaymentMethodCatalogEntry[] {
  const used = new Set(usedProviders)
  return PAYMENT_METHOD_CATALOG.filter((entry) => !used.has(entry.id))
}

export interface PaymentMethodOption {
  configId: string
  provider: string
  name: string
  description?: string
  brandColor: string
  logo: string
  qrCodeUrl?: string | null
  accountName?: string
  instructions?: string
  isActive: boolean
}

export function mapPaymentConfigsToOptions(configs: PaymentMethodConfig[]): PaymentMethodOption[] {
  return configs
    .flatMap((config) => {
      const catalogEntry = getPaymentMethodCatalogEntry(config.provider)
      if (!catalogEntry) {
        return []
      }

      return [
        {
          configId: config.id,
          provider: config.provider,
          name: catalogEntry.name,
          description: catalogEntry.description,
          brandColor: catalogEntry.brandColor,
          logo: catalogEntry.logo,
          qrCodeUrl: config.qrCodeUrl ?? null,
          accountName: config.accountName ?? undefined,
          instructions: config.instructions ?? undefined,
          isActive: config.isActive,
          sortOrder: catalogEntry.sortOrder,
        },
      ]
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder: _sortOrder, ...entry }) => entry)
}
