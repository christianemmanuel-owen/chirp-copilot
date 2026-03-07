"use client"

import { X, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

import { useInventoryPage } from "./_components/useInventoryPage"
import { FilterBar } from "./_components/FilterBar"
import { InventoryTable } from "./_components/InventoryTable"
import { TaxonomyDialog } from "./_components/TaxonomyDialog"
import { ImageGalleryEditor } from "./_components/ImageGalleryEditor"
import { BulkEditDialog, BulkDeleteDialog } from "./_components/BulkEditDialog"
import { ProductFormDialog } from "./_components/ProductFormDialog"
import { VariantFormDialog } from "./_components/VariantFormDialog"

export default function InventoryPage() {
  const s = useInventoryPage()

  return (
    <>
      <div className="container mx-auto py-6 px-4 max-w-[95vw]">
        {/* Header */}
        <div className="inv-page-header">
          <div>
            <h1 className="inv-page-title">Inventory</h1>
            <p className="inv-page-subtitle">Manage your products, variants, and stock levels from a single table.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="inv-page-btn inv-page-btn-outline" onClick={() => s.setIsTaxonomyDialogOpen(true)}>
              <Settings className="w-3.5 h-3.5" /> Categories &amp; Brands
            </button>
            <button type="button" className="inv-page-btn inv-page-btn-accent" onClick={() => s.setIsAddDialogOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchTerm={s.searchTerm} onSearchChange={s.setSearchTerm}
          isBulkEditMode={s.isBulkEditMode} bulkSelectionCount={s.bulkSelection.size}
          onBulkModeToggle={s.handleBulkModeToggle}
          groupBy={s.groupBy} onGroupByChange={s.setGroupBy}
          sizeView={s.sizeView} onSizeViewChange={s.handleSizeViewChange}
          productCategories={s.productCategories} productBrands={s.productBrands}
          categoryFilterIds={s.categoryFilterIds} brandFilterId={s.brandFilterId}
          onCategoryFilterToggle={s.toggleCategoryFilter} onBrandFilterChange={s.setBrandFilterId}
          onClearAllFilters={s.clearAllFilters}
        />

        {/* Loading Skeleton */}
        {s.isLoadingProducts ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="inv-page-skeleton" />
            ))}
          </div>
        ) : (
          <InventoryTable
            products={s.products} filteredProducts={s.filteredProducts}
            groupBy={s.groupBy} sizeView={s.sizeView}
            isBulkEditMode={s.isBulkEditMode} bulkSelection={s.bulkSelection}
            onBulkSelectionToggle={s.toggleVariantBulkSelection}
            onEditProduct={(product) => s.setEditingProduct(product)}
            onDeleteProduct={s.handleDeleteProduct}
            onAddVariant={(product) => s.openVariantDialog(product)}
            onEditVariant={(product, variant) => s.openVariantDialog(product, variant)}
            selectedVariantSizes={s.selectedVariantSizes}
            onSelectedVariantSizeChange={s.setSelectedVariantSizes}
            onInlineEdit={s.handleInlineEdit}
          />
        )}
      </div>
      {/* Bulk Floating Toolbar */}
      {s.isBulkEditMode && (
        <div className="inv-page-fab-bar">
          <button type="button" className="inv-page-fab inv-page-fab-edit" onClick={s.openBulkEditDialog} disabled={s.bulkSelection.size === 0}>
            Edit
          </button>
          <button type="button" className="inv-page-fab inv-page-fab-delete" onClick={s.openBulkDeleteDialog} disabled={s.bulkSelection.size === 0}>
            Delete
          </button>
        </div>
      )}
      {/* ─── Add Product Dialog ─── */}
      <ProductFormDialog
        mode="add"
        open={s.isAddDialogOpen}
        onOpenChange={s.setIsAddDialogOpen}
        productName={s.addProductName}
        onProductNameChange={s.setAddProductName}
        images={s.addProductImages}
        onImagesAdd={s.handleAddProductImagesAdd}
        onImageReplace={s.handleAddProductImageReplace}
        onImageRemove={s.handleAddProductImageRemove}
        onImageClearAll={() => s.handleAddProductImageRemove("__all__")}
        onImageEditTarget={s.setAddProductImageEditTargetId}
        categories={s.addCategories}
        onCategoriesChange={s.setAddCategories}
        brand={s.addBrand}
        onBrandChange={s.setAddBrand}
        productCategories={s.productCategories}
        productBrands={s.productBrands}
        categorySelectValue={s.addCategorySelectValue}
        onCategorySelectValueChange={s.setAddCategorySelectValue}
        addCategoryIfMissing={s.addCategoryIfMissing}
        removeCategoryFromList={s.removeCategoryFromList}
        onSubmit={s.handleAddProduct}
      />

      {/* ─── Edit Product Dialog ─── */}
      <ProductFormDialog
        mode="edit"
        open={!!s.editingProduct}
        onOpenChange={(open) => { if (!open) s.setEditingProduct(null) }}
        productName={s.editProductName}
        onProductNameChange={s.setEditProductName}
        images={s.editProductImages}
        onImagesAdd={s.handleEditProductImagesAdd}
        onImageReplace={s.handleEditProductImageReplace}
        onImageRemove={s.handleEditProductImageRemove}
        onImageClearAll={() => s.handleEditProductImageRemove("__all__")}
        onImageEditTarget={s.setEditProductImageEditTargetId}
        categories={s.editCategories}
        onCategoriesChange={s.setEditCategories}
        brand={s.editBrand}
        onBrandChange={s.setEditBrand}
        productCategories={s.productCategories}
        productBrands={s.productBrands}
        categorySelectValue={s.editCategorySelectValue}
        onCategorySelectValueChange={s.setEditCategorySelectValue}
        addCategoryIfMissing={s.addCategoryIfMissing}
        removeCategoryFromList={s.removeCategoryFromList}
        onSubmit={s.handleEditProduct}
        isSaving={s.isSavingEdit}
      />

      {/* ─── Variant Dialog ─── */}
      <VariantFormDialog
        mode={s.variantMode}
        open={s.isAddVariantOpen}
        onClose={s.closeVariantDialog}
        productName={s.variantProduct?.name}
        variantName={s.variantName}
        onVariantNameChange={s.setVariantName}
        variantSku={s.variantSku}
        onVariantSkuChange={s.setVariantSku}
        variantDescription={s.variantDescription}
        onVariantDescriptionChange={s.setVariantDescription}
        variantImages={s.variantImages}
        onRequestImageAdd={s.requestVariantImageAdd}
        onRequestImageEdit={s.requestVariantImageEdit}
        onImageRemove={s.handleVariantImageRemove}
        setCarouselApi={s.setVariantCarouselApi}
        addImageInputRef={s.addVariantImageInputRef}
        editImageInputRef={s.editVariantImageInputRef}
        onImagesAdd={s.handleVariantImagesAdd}
        onImageEdit={s.handleVariantImageEdit}
        isPreorder={s.variantIsPreorder}
        onPreorderChange={s.setVariantIsPreorder}
        isActive={s.variantIsActive}
        onActiveChange={s.setVariantIsActive}
        preorderDownPaymentType={s.variantPreorderDownPaymentType}
        onPreorderDownPaymentTypeChange={s.setVariantPreorderDownPaymentType}
        preorderDownPaymentValue={s.variantPreorderDownPaymentValue}
        onPreorderDownPaymentValueChange={s.setVariantPreorderDownPaymentValue}
        preorderMessage={s.variantPreorderMessage}
        onPreorderMessageChange={s.setVariantPreorderMessage}
        downPaymentPreview={s.variantDownPaymentPreview}
        variantSizes={s.variantSizes}
        addSizeRow={s.addVariantSizeRow}
        removeSizeRow={s.removeVariantSizeRow}
        updateSizeRow={s.updateVariantSizeRow}
        onSubmit={s.handleVariantSubmit}
        isSaving={s.isSavingVariant}
        hasProduct={!!s.variantProduct}
      />

      {/* ─── Taxonomy Dialog ─── */}
      <TaxonomyDialog
        open={s.isTaxonomyDialogOpen} onOpenChange={s.setIsTaxonomyDialogOpen}
        productCategories={s.productCategories} productBrands={s.productBrands}
        onCreateCategory={s.createCategory} onUpdateCategory={s.updateCategory} onDeleteCategory={s.deleteCategory}
        onCreateBrand={s.createBrand} onUpdateBrand={s.updateBrand} onDeleteBrand={s.deleteBrand}
      />

      {/* ─── Bulk Edit Dialog ─── */}
      <BulkEditDialog
        open={s.isBulkEditDialogOpen} onOpenChange={s.setIsBulkEditDialogOpen}
        selectedBulkVariants={s.selectedBulkVariants} hasMixedPreorderSelection={s.hasMixedPreorderSelection}
        bulkPreorderChoice={s.bulkPreorderChoice} onBulkPreorderChoiceChange={s.setBulkPreorderChoice}
        bulkDownPaymentMode={s.bulkDownPaymentMode} onBulkDownPaymentModeChange={s.setBulkDownPaymentMode}
        bulkDownPaymentValue={s.bulkDownPaymentValue} onBulkDownPaymentValueChange={s.setBulkDownPaymentValue}
        bulkPreorderMessageMode={s.bulkPreorderMessageMode} onBulkPreorderMessageModeChange={s.setBulkPreorderMessageMode}
        bulkPreorderMessageValue={s.bulkPreorderMessageValue} onBulkPreorderMessageValueChange={s.setBulkPreorderMessageValue}
        bulkGuardAcknowledged={s.bulkGuardAcknowledged} onBulkGuardAcknowledgedChange={s.setBulkGuardAcknowledged}
        bulkSizeRows={s.bulkSizeRows} onAddBulkSizeRow={s.addBulkSizeRow}
        onUpdateBulkSizeRow={s.updateBulkSizeRow} onRemoveBulkSizeRow={s.removeBulkSizeRow}
        onToggleBulkSizeRemoval={s.toggleBulkSizeRemoval}
        onSubmit={s.handleBulkEditSubmit} isSaving={s.isSavingBulkEdit}
      />

      {/* ─── Bulk Delete Dialog ─── */}
      <BulkDeleteDialog
        open={s.isBulkDeleteDialogOpen} onOpenChange={s.setIsBulkDeleteDialogOpen}
        count={s.selectedBulkVariants.length} onConfirm={s.handleBulkDeleteVariants} isDeleting={s.isDeletingVariants}
      />
    </>
  )
}
