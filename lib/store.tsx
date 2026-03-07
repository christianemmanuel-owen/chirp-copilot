"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  NewOrderInput,
  NewProductInput,
  Order,
  OrderStatus,
  PaymentMethodConfig,
  Product,
  ProductBrand,
  ProductCategory,
  UpdatePaymentMethodInput,
  UpdateProductInput,
  NewPaymentMethodInput,
} from "@/lib/types"
import type { PaymentMethodCatalogEntry } from "@/lib/payment-methods"

function sortByName<T extends { name: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.name.localeCompare(b.name))
}

interface StoreContextType {
  products: Product[]
  productCategories: ProductCategory[]
  productBrands: ProductBrand[]
  orders: Order[]
  paymentMethods: PaymentMethodConfig[]
  availablePaymentProviders: PaymentMethodCatalogEntry[]
  notifications: Order[]
  isLoadingProducts: boolean
  isLoadingOrders: boolean
  isLoadingPaymentMethods: boolean
  addProduct: (product: NewProductInput) => Promise<Product>
  updateProduct: (id: number, updates: UpdateProductInput) => Promise<Product>
  deleteProduct: (id: number) => Promise<void>
  refreshCategories: () => Promise<void>
  refreshBrands: () => Promise<void>
  createCategory: (name: string) => Promise<ProductCategory>
  updateCategory: (id: number, name: string) => Promise<ProductCategory>
  deleteCategory: (id: number) => Promise<void>
  createBrand: (name: string) => Promise<ProductBrand>
  updateBrand: (id: number, name: string) => Promise<ProductBrand>
  deleteBrand: (id: number) => Promise<void>
  addOrder: (order: NewOrderInput) => Promise<string>
  updateOrderStatus: (id: string, status: OrderStatus, trackingId?: string) => Promise<void>
  updateOrderProof: (id: string, proofUrl: string | null) => Promise<void>
  updateOrderTracking: (id: string, trackingId: string | null) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  refreshProducts: () => Promise<void>
  refreshOrders: () => Promise<void>
  refreshPaymentMethods: () => Promise<void>
  addPaymentMethod: (input: NewPaymentMethodInput) => Promise<PaymentMethodConfig>
  updatePaymentMethod: (id: string, updates: UpdatePaymentMethodInput) => Promise<PaymentMethodConfig>
  deletePaymentMethod: (id: string) => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([])
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([])
  const [availablePaymentProviders, setAvailablePaymentProviders] = useState<PaymentMethodCatalogEntry[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true)
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState<boolean>(true)

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true)
    try {
      const response = await fetch("/api/products")
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to fetch products")
      }

      setProducts(payload.data ?? [])
      if (Array.isArray(payload.categories)) {
        setProductCategories(sortByName(payload.categories as ProductCategory[]))
      }
      if (Array.isArray(payload.brands)) {
        setProductBrands(sortByName(payload.brands as ProductBrand[]))
      }
    } catch (error) {
      console.error("Failed to load products", error)
      setProducts([])
      setProductCategories([])
      setProductBrands([])
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories")
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to fetch categories")
      }

      setProductCategories(sortByName((payload.data ?? []) as ProductCategory[]))
    } catch (error) {
      console.error("Failed to load categories", error)
      setProductCategories([])
    }
  }, [])

  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch("/api/brands")
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to fetch brands")
      }

      setProductBrands(sortByName((payload.data ?? []) as ProductBrand[]))
    } catch (error) {
      console.error("Failed to load brands", error)
      setProductBrands([])
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true)
    try {
      const response = await fetch("/api/orders")
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to fetch orders")
      }

      setOrders(payload.data ?? [])
    } catch (error) {
      console.error("Failed to load orders", error)
      setOrders([])
    } finally {
      setIsLoadingOrders(false)
    }
  }, [])

  const fetchPaymentMethods = useCallback(async () => {
    setIsLoadingPaymentMethods(true)
    try {
      const response = await fetch("/api/payment-methods?scope=admin")
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to fetch payment methods")
      }

      setPaymentMethods(payload.data ?? [])
      setAvailablePaymentProviders(payload.availableProviders ?? [])
    } catch (error) {
      console.error("Failed to load payment methods", error)
      setPaymentMethods([])
      setAvailablePaymentProviders([])
    } finally {
      setIsLoadingPaymentMethods(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      // Parallelize initial fetches to avoid waterfall
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBrands(),
        fetchOrders(),
        fetchPaymentMethods()
      ])
    }
    init()
  }, [fetchProducts, fetchCategories, fetchBrands, fetchOrders, fetchPaymentMethods])

  const addProduct = useCallback(
    async (product: NewProductInput) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to add product")
      }

      const createdProduct = payload.data as Product
      setProducts((prev) => [...prev, createdProduct])
      if (Array.isArray(createdProduct.categories)) {
        setProductCategories((previous) => {
          const map = new Map(previous.map((category) => [category.id, category]))
          for (const category of createdProduct.categories) {
            map.set(category.id, category)
          }
          return sortByName(Array.from(map.values()))
        })
      }
      if (createdProduct.brand) {
        const brand = createdProduct.brand
        setProductBrands((previous) => {
          const map = new Map(previous.map((entry) => [entry.id, entry]))
          map.set(brand.id, brand)
          return sortByName(Array.from(map.values()))
        })
      }
      return createdProduct
    },
    [],
  )

  const updateProduct = useCallback(async (id: number, updates: UpdateProductInput) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "Failed to update product")
    }

    const updatedProduct = payload.data as Product
    setProducts((prev) => prev.map((product) => (product.id === id ? updatedProduct : product)))
    if (Array.isArray(updatedProduct.categories)) {
      setProductCategories((previous) => {
        const map = new Map(previous.map((category) => [category.id, category]))
        for (const category of updatedProduct.categories) {
          map.set(category.id, category)
        }
        return sortByName(Array.from(map.values()))
      })
    }
    if (updatedProduct.brand) {
      const brand = updatedProduct.brand
      setProductBrands((previous) => {
        const map = new Map(previous.map((entry) => [entry.id, entry]))
        map.set(brand.id, brand)
        return sortByName(Array.from(map.values()))
      })
    }
    return updatedProduct
  }, [])

  const deleteProduct = useCallback(async (id: number) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error((payload as { error?: string }).error || "Failed to delete product")
    }

    setProducts((prev) => prev.filter((product) => product.id !== id))
  }, [])

  const createCategory = useCallback(async (name: string) => {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "Failed to create category")
    }

    const category = payload.data as ProductCategory
    setProductCategories((prev) =>
      sortByName([...prev.filter((entry) => entry.id !== category.id), category]),
    )
    return category
  }, [])

  const updateCategory = useCallback(async (id: number, name: string) => {
    const response = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "Failed to update category")
    }

    const category = payload.data as ProductCategory
    setProductCategories((prev) =>
      sortByName([...prev.filter((entry) => entry.id !== category.id), category]),
    )
    setProducts((prev) =>
      prev.map((product) => {
        if (!product.categories.some((entry) => entry.id === category.id)) {
          return product
        }
        const updatedCategories = product.categories.map((entry) =>
          entry.id === category.id ? { ...entry, name: category.name } : entry,
        )
        return { ...product, categories: updatedCategories }
      }),
    )
    return category
  }, [])

  const deleteCategory = useCallback(async (id: number) => {
    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error((payload as { error?: string }).error || "Failed to delete category")
    }

    setProductCategories((prev) => prev.filter((category) => category.id !== id))
    setProducts((prev) =>
      prev.map((product) => {
        const filtered = product.categories.filter((category) => category.id !== id)
        if (filtered.length === product.categories.length) {
          return product
        }
        return { ...product, categories: filtered }
      }),
    )
  }, [])

  const createBrand = useCallback(async (name: string) => {
    const response = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "Failed to create brand")
    }

    const brand = payload.data as ProductBrand
    setProductBrands((prev) =>
      sortByName([...prev.filter((entry) => entry.id !== brand.id), brand]),
    )
    return brand
  }, [])

  const updateBrand = useCallback(async (id: number, name: string) => {
    const response = await fetch(`/api/brands/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "Failed to update brand")
    }

    const brand = payload.data as ProductBrand
    setProductBrands((prev) =>
      sortByName([...prev.filter((entry) => entry.id !== brand.id), brand]),
    )
    setProducts((prev) =>
      prev.map((product) => {
        if (!product.brand || product.brand.id !== brand.id) {
          return product
        }
        return { ...product, brand: { ...product.brand, name: brand.name } }
      }),
    )
    return brand
  }, [])

  const deleteBrand = useCallback(async (id: number) => {
    const response = await fetch(`/api/brands/${id}`, {
      method: "DELETE",
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error((payload as { error?: string }).error || "Failed to delete brand")
    }

    setProductBrands((prev) => prev.filter((brand) => brand.id !== id))
    setProducts((prev) =>
      prev.map((product) => {
        if (!product.brand || product.brand.id !== id) {
          return product
        }
        return { ...product, brand: null }
      }),
    )
  }, [])

  const addOrder = useCallback(async (orderData: NewOrderInput) => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "Failed to create order")
    }

    const createdOrder = payload.data as Order
    setOrders((prev) =>
      [createdOrder, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    )
    return createdOrder.id
  }, [])

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus, trackingId?: string) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingId }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update order status")
      }

      const updatedOrder = payload.data as Order
      setOrders((prev) => prev.map((order) => (order.id === id ? updatedOrder : order)))
      await fetchProducts()
    },
    [fetchProducts],
  )

  const markNotificationRead = useCallback(async (id: string) => {
    const response = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "Failed to mark notification as read")
    }

    const updatedOrder = payload.data as Order
    setOrders((prev) => prev.map((order) => (order.id === id ? updatedOrder : order)))
  }, [])

  const updateOrderProof = useCallback(async (id: string, proofUrl: string | null) => {
    const response = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proofOfPayment: proofUrl }),
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "Failed to update proof of payment")
    }

    const updatedOrder = payload.data as Order
    setOrders((prev) => prev.map((order) => (order.id === id ? updatedOrder : order)))
  }, [])

  const updateOrderTracking = useCallback(async (id: string, trackingId: string | null) => {
    const response = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingId }),
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "Failed to update tracking ID")
    }

    const updatedOrder = payload.data as Order
    setOrders((prev) => prev.map((order) => (order.id === id ? updatedOrder : order)))
  }, [])

  const addPaymentMethod = useCallback(
    async (input: NewPaymentMethodInput) => {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to create payment method")
      }

      const created = payload.data as PaymentMethodConfig
      setPaymentMethods((prev) => [...prev, created])
      setAvailablePaymentProviders((prev) => prev.filter((provider) => provider.id !== created.provider))
      return created
    },
    [],
  )

  const updatePaymentMethod = useCallback(
    async (id: string, updates: UpdatePaymentMethodInput) => {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update payment method")
      }

      const updated = payload.data as PaymentMethodConfig
      setPaymentMethods((prev) => prev.map((method) => (method.id === id ? updated : method)))
      return updated
    },
    [],
  )

  const deletePaymentMethod = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "DELETE",
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete payment method")
      }

      setPaymentMethods((prev) => prev.filter((method) => method.id !== id))
    },
    [],
  )

  const notifications = useMemo(() => orders.filter((order) => !order.isRead), [orders])

  const value: StoreContextType = {
    products,
    productCategories,
    productBrands,
    orders,
    paymentMethods,
    availablePaymentProviders,
    notifications,
    isLoadingProducts,
    isLoadingOrders,
    isLoadingPaymentMethods,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshCategories: fetchCategories,
    refreshBrands: fetchBrands,
    createCategory,
    updateCategory,
    deleteCategory,
    createBrand,
    updateBrand,
    deleteBrand,
    addOrder,
    updateOrderStatus,
    updateOrderProof,
    updateOrderTracking,
    markNotificationRead,
    refreshProducts: fetchProducts,
    refreshOrders: fetchOrders,
    refreshPaymentMethods: fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within StoreProvider")
  }
  return context
}
