import type { Product, ProductBrandInput, ProductCategoryInput } from "@/lib/types"

export interface ManagedImageItem {
  id: string
  previewUrl: string
  file?: File
  originalUrl?: string
}

export type BulkSizeRow = {
  key: string
  type: "existing" | "new"
  sizeValue: string
  label: string
  price: string
  stock: string
  isMarkedForRemoval?: boolean
  _priceMixed?: boolean
  _stockMixed?: boolean
}

export type GroupByMode = "product" | "category" | "brand"
export type SizeViewMode = "compact" | "expanded"

export const DEFAULT_SIZE_KEY = "__default__"
export const PLACEHOLDER_IMAGE = "/placeholder.svg?height=400&width=400"

export interface VariantSizeEntry {
  value: string
  label: string
  price: number
  stock: number
  size: string | null
}

export interface VariantTableRow {
  product: Product
  variant: Product["variants"][number]
  sizeEntries: VariantSizeEntry[]
}

export interface ProductGroup {
  key: string
  label: string
  product: Product | null
  rows: VariantTableRow[]
}

export interface ImageGalleryEditorProps {
  images: ManagedImageItem[]
  onAdd: (files: FileList | null) => void
  onReplace: (files: FileList | null) => void
  onRemove: (id: string) => void
  onClearAll: () => void
  onEditTarget: (id: string) => void
  disabled?: boolean
  label?: string
  description?: string
}

export interface TaxonomyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productCategories: { id: number; name: string }[]
  productBrands: { id: number; name: string }[]
  onCreateCategory: (name: string) => Promise<any>
  onUpdateCategory: (id: number, name: string) => Promise<any>
  onDeleteCategory: (id: number) => Promise<any>
  onCreateBrand: (name: string) => Promise<any>
  onUpdateBrand: (id: number, name: string) => Promise<any>
  onDeleteBrand: (id: number) => Promise<any>
}

export interface ProductFormDialogProps {
  mode: "add" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  productCategories: { id: number; name: string }[]
  productBrands: { id: number; name: string }[]
  onSubmit: (data: {
    name: string
    images: ManagedImageItem[]
    categories: ProductCategoryInput[]
    brand: ProductBrandInput | null
  }) => Promise<void>
  isSaving?: boolean
}

export interface VariantFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  product: Product | null
  variantId: number | null
  initialData: {
    sku: string
    name: string
    description: string
    isPreorder: boolean
    isActive: boolean
    preorderDownPaymentType: "none" | "percent" | "amount"
    preorderDownPaymentValue: string
    preorderMessage: string
    sizes: Array<{ key: string; size: string; price: string; stock: string }>
    images: ManagedImageItem[]
  }
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSaving: boolean
  // Variant field setters
  onSkuChange: (value: string) => void
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onIsPreorderChange: (value: boolean) => void
  onIsActiveChange: (value: boolean) => void
  onPreorderDownPaymentTypeChange: (value: "none" | "percent" | "amount") => void
  onPreorderDownPaymentValueChange: (value: string) => void
  onPreorderMessageChange: (value: string) => void
  // Size rows
  onAddSizeRow: () => void
  onUpdateSizeRow: (key: string, field: "size" | "price" | "stock", value: string) => void
  onRemoveSizeRow: (key: string) => void
  // Image management
  onImagesAdd: (files: FileList | null) => void
  onImageReplace: (files: FileList | null) => void
  onImageRemove: (id: string) => void
  onImageEditTarget: (id: string) => void
  onImageAddRequest: () => void
  // Carousel
  variantCarouselApi: any | null
  setVariantCarouselApi: (api: any) => void
  downPaymentPreview: string | null
}

export interface FilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  isBulkEditMode: boolean
  bulkSelectionCount: number
  onBulkModeToggle: (value: boolean | "indeterminate") => void
  groupBy: GroupByMode
  onGroupByChange: (value: GroupByMode) => void
  sizeView: SizeViewMode
  onSizeViewChange: (value: SizeViewMode) => void
  productCategories: { id: number; name: string }[]
  productBrands: { id: number; name: string }[]
  categoryFilterIds: number[]
  brandFilterId: number | null
  onCategoryFilterToggle: (categoryId: number, isChecked: boolean) => void
  onBrandFilterChange: (brandId: number | null) => void
  onClearAllFilters: () => void
}

export interface InventoryTableProps {
  products: Product[]
  filteredProducts: Product[]
  groupBy: GroupByMode
  sizeView: SizeViewMode
  isBulkEditMode: boolean
  bulkSelection: Set<number>
  onBulkSelectionToggle: (variantId: number, isChecked: boolean) => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (product: Product) => void
  onAddVariant: (product: Product) => void
  onEditVariant: (product: Product, variant: Product["variants"][number]) => void
  selectedVariantSizes: Record<number, string>
  onSelectedVariantSizeChange: (variantId: number, value: string) => void
  onInlineEdit: (
    productId: number,
    variantId: number,
    sizeValue: string,
    field: "price" | "stock",
    newValue: number,
  ) => Promise<void>
}

export interface BulkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedBulkVariants: Array<{ product: Product; variant: Product["variants"][number] }>
  hasMixedPreorderSelection: boolean
  // Preorder settings
  bulkPreorderChoice: "no-change" | "preorder" | "regular"
  onBulkPreorderChoiceChange: (value: "no-change" | "preorder" | "regular") => void
  bulkDownPaymentMode: "no-change" | "none" | "percent" | "amount"
  onBulkDownPaymentModeChange: (value: "no-change" | "none" | "percent" | "amount") => void
  bulkDownPaymentValue: string
  onBulkDownPaymentValueChange: (value: string) => void
  bulkPreorderMessageMode: "no-change" | "remove" | "set"
  onBulkPreorderMessageModeChange: (value: "no-change" | "remove" | "set") => void
  bulkPreorderMessageValue: string
  onBulkPreorderMessageValueChange: (value: string) => void
  bulkGuardAcknowledged: boolean
  onBulkGuardAcknowledgedChange: (value: boolean) => void
  // Size rows
  bulkSizeRows: BulkSizeRow[]
  onAddBulkSizeRow: () => void
  onUpdateBulkSizeRow: (key: string, field: "sizeValue" | "price" | "stock", value: string) => void
  onRemoveBulkSizeRow: (key: string) => void
  onToggleBulkSizeRemoval: (key: string) => void
  // Submit
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSaving: boolean
}

export interface BulkDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  onConfirm: () => void
  isDeleting: boolean
}
