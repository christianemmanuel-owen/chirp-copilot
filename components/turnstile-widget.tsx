"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "error-callback"?: () => void
          "expired-callback"?: () => void
          action?: string
          cData?: string
        },
      ) => string
      reset: (widgetId?: string) => void
      remove?: (widgetId?: string) => void
    }
  }
}

interface TurnstileWidgetProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  action?: string
  cData?: string
  className?: string
  resetSignal?: number
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

export function TurnstileWidget({
  siteKey,
  onVerify,
  onError,
  onExpire,
  action,
  cData,
  className,
  resetSignal,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [isScriptReady, setIsScriptReady] = useState<boolean>(false)

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current || widgetIdRef.current || !siteKey) {
      return
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      cData,
      callback: onVerify,
      "error-callback": () => {
        if (onError) onError()
        // Avoid auto-reset loops; leave widget for manual retry.
      },
      "expired-callback": () => {
        if (onExpire) onExpire()
        if (widgetIdRef.current) {
          window.turnstile?.reset(widgetIdRef.current)
        }
      },
    })
  }, [siteKey, action, cData, onVerify, onError, onExpire])

  useEffect(() => {
    if (!siteKey) return

    if (window.turnstile) {
      renderWidget()
      return
    }

    if (isScriptReady) {
      renderWidget()
    }
  }, [isScriptReady, renderWidget, siteKey])

  useEffect(() => {
    if (resetSignal === undefined) return
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [resetSignal])

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove?.(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [])

  return (
    <>
      <Script src={SCRIPT_SRC} strategy="lazyOnload" onLoad={() => setIsScriptReady(true)} />
      <div ref={containerRef} className={className} />
    </>
  )
}

export default TurnstileWidget
