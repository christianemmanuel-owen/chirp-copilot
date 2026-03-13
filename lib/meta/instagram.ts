

const GRAPH_BASE_URL = "https://graph.facebook.com/v18.0"

export interface InstagramPageCandidate {
  pageId: string
  pageName: string
  pageAccessToken: string
  instagramBusinessAccountId: string
  instagramUsername: string | null
  instagramProfileName: string | null
  instagramProfilePictureUrl: string | null
  tasks: string[] | null
  category: string | null
}

export interface ExchangeCodeResult {
  longLivedToken: string
  expiresAt: string | null
  scopes: string[]
}

function getAppCredentials() {
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error("FACEBOOK_APP_ID and FACEBOOK_APP_SECRET must be configured")
  }

  return { appId, appSecret }
}

export function getRequiredScopes() {
  const raw = process.env.INSTAGRAM_REQUIRED_SCOPES?.trim()
  if (raw && raw.length > 0) {
    return raw
      .split(",")
      .map((scope) => scope.trim())
      .filter(Boolean)
  }

  return [
    "instagram_basic",
    "pages_show_list",
    "pages_manage_metadata",
    "pages_read_engagement",
    "pages_manage_engagement",
    "pages_messaging",
    "instagram_manage_messages",
  ]
}

export function buildOAuthState() {
  const array = new Uint8Array(16)
  globalThis.crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function getRedirectUri(requestUrl: string) {
  const fallback = process.env.INSTAGRAM_OAUTH_REDIRECT_URI
  if (fallback) {
    return fallback
  }

  const url = new URL(requestUrl)
  url.pathname = "/api/auth/instagram/callback"
  url.search = ""
  url.hash = ""
  return url.toString()
}

interface TokenExchangeResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

interface DebugTokenResponse {
  data: {
    app_id: string
    type: string
    application: string
    expires_at?: number
    scopes?: string[]
    is_valid: boolean
    issued_at?: number
    user_id?: string
  }
}

export async function exchangeCodeForLongLivedToken(params: { code: string; redirectUri: string }) {
  const { code, redirectUri } = params
  const { appId, appSecret } = getAppCredentials()

  const shortLivedParams = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  })

  const shortLivedResponse = await fetch(`${GRAPH_BASE_URL}/oauth/access_token?${shortLivedParams.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })

  if (!shortLivedResponse.ok) {
    const errorPayload = await shortLivedResponse.text()
    throw new Error(`Failed to exchange code for short-lived token: ${errorPayload}`)
  }

  const shortLivedData = (await shortLivedResponse.json()) as TokenExchangeResponse

  if (!shortLivedData.access_token) {
    throw new Error("Facebook token exchange response missing access_token")
  }

  const longLivedParams = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedData.access_token,
  })

  const longLivedResponse = await fetch(`${GRAPH_BASE_URL}/oauth/access_token?${longLivedParams.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })

  if (!longLivedResponse.ok) {
    const errorPayload = await longLivedResponse.text()
    throw new Error(`Failed to exchange for long-lived token: ${errorPayload}`)
  }

  const longLivedData = (await longLivedResponse.json()) as TokenExchangeResponse

  if (!longLivedData.access_token) {
    throw new Error("Facebook long-lived token response missing access_token")
  }

  let expiresAt: string | null = null
  let scopes: string[] = []

  try {
    const debugParams = new URLSearchParams({
      input_token: longLivedData.access_token,
      access_token: `${appId}|${appSecret}`,
    })

    const debugResponse = await fetch(`${GRAPH_BASE_URL}/debug_token?${debugParams.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!debugResponse.ok) {
      const debugPayload = await debugResponse.text()
      throw new Error(`Failed to debug token: ${debugPayload}`)
    }

    const debugData = (await debugResponse.json()) as DebugTokenResponse

    if (debugData.data?.expires_at) {
      expiresAt = new Date(debugData.data.expires_at * 1000).toISOString()
    } else if (longLivedData.expires_in) {
      expiresAt = new Date(Date.now() + longLivedData.expires_in * 1000).toISOString()
    }

    if (Array.isArray(debugData.data?.scopes)) {
      scopes = debugData.data.scopes
    }
  } catch (error) {
    // Swallow debug errors but log them for observability
    console.error("[instagram] Failed to debug token", error)
    if (!expiresAt && longLivedData.expires_in) {
      expiresAt = new Date(Date.now() + longLivedData.expires_in * 1000).toISOString()
    }
    if (scopes.length === 0) {
      scopes = getRequiredScopes()
    }
  }

  if (!expiresAt && longLivedData.expires_in) {
    expiresAt = new Date(Date.now() + longLivedData.expires_in * 1000).toISOString()
  }

  if (scopes.length === 0) {
    scopes = getRequiredScopes()
  }

  return {
    longLivedToken: longLivedData.access_token,
    expiresAt,
    scopes,
  } satisfies ExchangeCodeResult
}

interface AccountsResponse {
  data: Array<{
    id: string
    name: string
    access_token?: string
    category?: string
    tasks?: string[]
    instagram_business_account?: { id: string }
  }>
}

interface InstagramBusinessAccountResponse {
  id: string
  username?: string
  name?: string
  profile_picture_url?: string
}

export async function fetchInstagramPageCandidates(longLivedUserToken: string): Promise<InstagramPageCandidate[]> {
  const candidates: InstagramPageCandidate[] = []

  // Fetch personal Pages (me/accounts)
  console.log("[instagram] Fetching personal Pages from me/accounts...")
  const accountsParams = new URLSearchParams({
    access_token: longLivedUserToken,
    fields: "name,id,access_token,category,tasks,instagram_business_account",
  })

  try {
    const accountsResponse = await fetch(`${GRAPH_BASE_URL}/me/accounts?${accountsParams.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (accountsResponse.ok) {
      const accountsData = (await accountsResponse.json()) as AccountsResponse
      console.log(`[instagram] Found ${accountsData.data?.length || 0} personal Pages`)

      for (const page of accountsData.data ?? []) {
        await processPageCandidate(page, candidates)
      }
    } else {
      const errorPayload = await accountsResponse.text()
      console.error("[instagram] Failed to fetch personal Pages:", errorPayload)
    }
  } catch (error) {
    console.error("[instagram] Error fetching personal Pages:", error)
  }

  // Fetch Business Manager Pages (me/businesses)
  console.log("[instagram] Fetching Business Manager Pages from me/businesses...")
  try {
    const businessesResponse = await fetch(
      `${GRAPH_BASE_URL}/me/businesses?access_token=${longLivedUserToken}&fields=id,name`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    )

    if (businessesResponse.ok) {
      const businessesData = await businessesResponse.json()
      const businesses = businessesData.data || []
      console.log(`[instagram] Found ${businesses.length} businesses`)

      // For each business, fetch its Pages
      for (const business of businesses) {
        try {
          const businessPagesResponse = await fetch(
            `${GRAPH_BASE_URL}/${business.id}/client_pages?access_token=${longLivedUserToken}&fields=name,id,access_token,category,tasks,instagram_business_account`,
            {
              method: "GET",
              headers: { Accept: "application/json" },
            }
          )

          if (businessPagesResponse.ok) {
            const businessPagesData = await businessPagesResponse.json()
            const businessPages = businessPagesData.data || []
            console.log(`[instagram] Found ${businessPages.length} Pages in business ${business.name}`)

            for (const page of businessPages) {
              await processPageCandidate(page, candidates)
            }
          }
        } catch (error) {
          console.error(`[instagram] Error fetching Pages for business ${business.id}:`, error)
        }
      }
    } else {
      const errorPayload = await businessesResponse.text()
      console.log("[instagram] No businesses found or error:", errorPayload)
    }
  } catch (error) {
    console.error("[instagram] Error fetching businesses:", error)
  }

  console.log(`[instagram] Total Instagram Page candidates found: ${candidates.length}`)
  return candidates
}

async function processPageCandidate(page: any, candidates: InstagramPageCandidate[]) {
  const instagramAccountId = page.instagram_business_account?.id
  const pageAccessToken = page.access_token

  if (!instagramAccountId || !pageAccessToken) {
    console.log(`[instagram] Skipping page ${page.name} (${page.id}) - no Instagram account or access token`)
    return
  }

  try {
    const igFields = new URLSearchParams({
      access_token: pageAccessToken,
      fields: "id,username,name,profile_picture_url",
    })
    const igResponse = await fetch(`${GRAPH_BASE_URL}/${instagramAccountId}?${igFields.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!igResponse.ok) {
      const payload = await igResponse.text()
      console.error(`[instagram] Failed to fetch Instagram details for page ${page.name}:`, payload)
      return
    }

    const igData = (await igResponse.json()) as InstagramBusinessAccountResponse

    candidates.push({
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: pageAccessToken,
      instagramBusinessAccountId: instagramAccountId,
      instagramUsername: igData.username ?? null,
      instagramProfileName: igData.name ?? null,
      instagramProfilePictureUrl: igData.profile_picture_url ?? null,
      tasks: page.tasks ?? null,
      category: page.category ?? null,
    })

    console.log(`[instagram] ✓ Added candidate: ${igData.username || igData.name} (Page: ${page.name})`)
  } catch (error) {
    console.error("[instagram] Failed to fetch IG business account details", {
      pageId: page.id,
      instagramAccountId,
      error,
    })
  }
}

// ============================================================================
// Instagram Conversations API (Messenger API for Instagram)
// ============================================================================

export interface InstagramConversation {
  id: string
  updatedTime: string
  participants: Array<{
    id: string
    username?: string
    name?: string
  }>
  latestMessage?: {
    id: string
    message?: string
    from: { id: string; username?: string; name?: string }
    created_time: string
  }
}

export interface InstagramMessage {
  id: string
  message?: string
  from: { id: string; username?: string; name?: string }
  to?: { data: Array<{ id: string; username?: string; name?: string }> }
  created_time: string
  attachments?: {
    data: Array<{
      id: string
      mime_type?: string
      name?: string
      file_url?: string
      image_data?: { url: string; width: number; height: number }
      video_data?: { url: string; width: number; height: number }
    }>
  }
}

interface ConversationsResponse {
  data: Array<{
    id: string
    updated_time: string
    participants?: {
      data: Array<{ id: string; username?: string; name?: string }>
    }
    messages?: {
      data: Array<{
        id: string
        message?: string
        from: { id: string; username?: string; name?: string }
        created_time: string
      }>
    }
  }>
  paging?: {
    cursors?: { before: string; after: string }
    next?: string
  }
}

interface MessagesResponse {
  data: Array<{
    id: string
    message?: string
    from: { id: string; username?: string; name?: string }
    to?: { data: Array<{ id: string; username?: string; name?: string }> }
    created_time: string
    attachments?: {
      data: Array<{
        id: string
        mime_type?: string
        name?: string
        file_url?: string
        image_data?: { url: string; width: number; height: number }
        video_data?: { url: string; width: number; height: number }
      }>
    }
  }>
  paging?: {
    cursors?: { before: string; after: string }
    next?: string
  }
}

/**
 * Fetch conversations for an Instagram Business Account via page access token.
 * Uses the Messenger API endpoint: /{ig-user-id}/conversations
 */
export async function fetchInstagramConversations(
  pageAccessToken: string,
  instagramBusinessAccountId: string,
  limit = 25
): Promise<{ conversations: InstagramConversation[]; nextCursor?: string }> {
  const params = new URLSearchParams({
    access_token: pageAccessToken,
    fields: "id,updated_time,participants,messages.limit(1){id,message,from,created_time}",
    limit: String(limit),
    platform: "instagram",
  })

  const response = await fetch(
    `${GRAPH_BASE_URL}/${instagramBusinessAccountId}/conversations?${params.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  )

  if (!response.ok) {
    const errorPayload = await response.text()
    console.error("[instagram] Failed to fetch conversations", errorPayload)
    throw new Error(`Failed to fetch Instagram conversations: ${errorPayload}`)
  }

  const data = (await response.json()) as ConversationsResponse

  const conversations: InstagramConversation[] = (data.data ?? []).map((conv) => ({
    id: conv.id,
    updatedTime: conv.updated_time,
    participants: conv.participants?.data ?? [],
    latestMessage: conv.messages?.data?.[0]
      ? {
        id: conv.messages.data[0].id,
        message: conv.messages.data[0].message,
        from: conv.messages.data[0].from,
        created_time: conv.messages.data[0].created_time,
      }
      : undefined,
  }))

  return {
    conversations,
    nextCursor: data.paging?.cursors?.after,
  }
}

/**
 * Fetch messages for a specific conversation.
 * Uses the Messenger API endpoint: /{conversation-id}/messages
 */
export async function fetchConversationMessages(
  pageAccessToken: string,
  conversationId: string,
  limit = 50
): Promise<{ messages: InstagramMessage[]; nextCursor?: string }> {
  const params = new URLSearchParams({
    access_token: pageAccessToken,
    fields: "id,message,from,to,created_time,attachments",
    limit: String(limit),
  })

  const response = await fetch(
    `${GRAPH_BASE_URL}/${conversationId}/messages?${params.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  )

  if (!response.ok) {
    const errorPayload = await response.text()
    console.error("[instagram] Failed to fetch messages", errorPayload)
    throw new Error(`Failed to fetch conversation messages: ${errorPayload}`)
  }

  const data = (await response.json()) as MessagesResponse

  const messages: InstagramMessage[] = (data.data ?? []).map((msg) => ({
    id: msg.id,
    message: msg.message,
    from: msg.from,
    to: msg.to,
    created_time: msg.created_time,
    attachments: msg.attachments,
  }))

  return {
    messages,
    nextCursor: data.paging?.cursors?.after,
  }
}

/**
 * Send a message to a user via Instagram DM.
 * Uses the Messenger API endpoint: /{ig-user-id}/messages
 */
export async function sendInstagramMessage(
  pageAccessToken: string,
  instagramBusinessAccountId: string,
  recipientId: string,
  messageText: string
): Promise<{ messageId: string }> {
  const response = await fetch(
    `${GRAPH_BASE_URL}/${instagramBusinessAccountId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_token: pageAccessToken,
        recipient: { id: recipientId },
        message: { text: messageText },
      }),
    }
  )

  if (!response.ok) {
    const errorPayload = await response.text()
    console.error("[instagram] Failed to send message", errorPayload)
    throw new Error(`Failed to send Instagram message: ${errorPayload}`)
  }

  const data = (await response.json()) as { message_id: string }
  return { messageId: data.message_id }
}
