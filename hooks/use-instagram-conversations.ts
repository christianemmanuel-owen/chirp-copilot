"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ConversationListItem } from "@/app/api/admin/instagram/conversations/route"
import type { MessageItem } from "@/app/api/admin/instagram/conversations/[conversationId]/messages/route"

const POLL_INTERVAL_MS = 10_000 // 10 seconds

export interface UseInstagramConversationsResult {
    // Connection status
    isConnected: boolean
    isLoading: boolean
    error: string | null

    // Conversations
    conversations: ConversationListItem[]

    // Selected conversation messages
    selectedConversationId: string | null
    messages: MessageItem[]
    isLoadingMessages: boolean

    // Actions
    selectConversation: (conversationId: string) => void
    syncConversations: () => Promise<void>
    isSyncing: boolean
    refreshConversations: () => Promise<void>
    refreshMessages: () => Promise<void>
}

export function useInstagramConversations(): UseInstagramConversationsResult {
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [conversations, setConversations] = useState<ConversationListItem[]>([])

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState<MessageItem[]>([])
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)

    // Refs for polling to avoid stale closures
    const selectedConversationIdRef = useRef(selectedConversationId)
    selectedConversationIdRef.current = selectedConversationId
    const isConnectedRef = useRef(isConnected)
    isConnectedRef.current = isConnected

    // Fetch conversations list from Supabase (fast, local DB read)
    const fetchConversations = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/instagram/conversations")
            if (!response.ok) {
                throw new Error("Failed to fetch conversations")
            }
            const data = await response.json()
            setIsConnected(data.connected ?? false)
            setConversations(data.conversations ?? [])
            setError(null)
        } catch (err) {
            console.error("[useInstagramConversations] Error fetching conversations", err)
            setError(err instanceof Error ? err.message : "Failed to fetch conversations")
        }
    }, [])

    // Fetch messages for a specific conversation from Supabase
    const fetchMessages = useCallback(async (conversationId: string) => {
        try {
            const response = await fetch(
                `/api/admin/instagram/conversations/${encodeURIComponent(conversationId)}/messages`
            )
            if (!response.ok) {
                throw new Error("Failed to fetch messages")
            }
            const data = await response.json()
            // Only update if this is still the selected conversation
            if (selectedConversationIdRef.current === conversationId) {
                setMessages(data.messages ?? [])
            }
        } catch (err) {
            console.error("[useInstagramConversations] Error fetching messages", err)
        }
    }, [])

    // Initial load
    useEffect(() => {
        setIsLoading(true)
        fetchConversations().finally(() => setIsLoading(false))
    }, [fetchConversations])

    // Fetch messages when selected conversation changes
    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([])
            return
        }
        setIsLoadingMessages(true)
        fetchMessages(selectedConversationId).finally(() => setIsLoadingMessages(false))
    }, [selectedConversationId, fetchMessages])

    // Auto-poll: read from Supabase every 10s, sync from Meta API every 30s
    useEffect(() => {
        let tickCount = 0

        const poll = async () => {
            if (!isConnectedRef.current) return

            // Every 3rd tick (30s), do a background sync from Meta API to pull new messages
            tickCount++
            if (tickCount % 3 === 0) {
                try {
                    await fetch("/api/admin/instagram/sync", { method: "POST" })
                } catch {
                    // Swallow sync errors silently
                }
            }

            // Always read latest from Supabase
            fetchConversations()
            const activeId = selectedConversationIdRef.current
            if (activeId) {
                fetchMessages(activeId)
            }
        }

        const interval = setInterval(poll, POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [fetchConversations, fetchMessages])

    // Background sync: if connected but no conversations, trigger a sync from Meta
    useEffect(() => {
        if (isConnected && !isLoading && conversations.length === 0 && !isSyncing) {
            syncConversationsInternal()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, isLoading])

    // Sync conversations from Instagram API (hard refresh from Meta → Supabase)
    const syncConversationsInternal = useCallback(async () => {
        setIsSyncing(true)
        try {
            const response = await fetch("/api/admin/instagram/sync", { method: "POST" })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error ?? "Failed to sync conversations")
            }
            // Refresh conversation list from Supabase after sync
            await fetchConversations()
            // If we have a selected conversation, refresh its messages
            const activeId = selectedConversationIdRef.current
            if (activeId) {
                await fetchMessages(activeId)
            }
        } catch (err) {
            console.error("[useInstagramConversations] Error syncing", err)
            throw err
        } finally {
            setIsSyncing(false)
        }
    }, [fetchConversations, fetchMessages])

    const selectConversation = useCallback((conversationId: string) => {
        setSelectedConversationId(conversationId)
    }, [])

    return {
        isConnected,
        isLoading,
        error,
        conversations,
        selectedConversationId,
        messages,
        isLoadingMessages,
        selectConversation,
        syncConversations: syncConversationsInternal,
        isSyncing,
        refreshConversations: fetchConversations,
        refreshMessages: useCallback(async () => {
            const activeId = selectedConversationIdRef.current
            if (activeId) {
                await fetchMessages(activeId)
            }
        }, [fetchMessages]),
    }
}
