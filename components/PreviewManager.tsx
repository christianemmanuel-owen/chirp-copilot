"use client"

import { useEffect, useState, useRef } from "react"
import InlineStyleToolbar from "./InlineStyleToolbar"

export default function PreviewManager() {
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
    const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
    const [selectedCatalogElement, setSelectedCatalogElement] = useState<HTMLElement | null>(null)

    useEffect(() => {
        const handleMouseOver = (e: MouseEvent) => {
            let target = e.target as HTMLElement
            if (target?.closest) {
                const closestLinkBtn = target.closest('a, button, [data-element-key], [data-selection-type]') as HTMLElement
                if (closestLinkBtn) target = closestLinkBtn
            }
            const path = e.composedPath() as HTMLElement[]

            // Skip if inside no-edit zone or editing UI
            const isEditingUI = path.some(el => {
                if (!el.hasAttribute) return false
                return el.hasAttribute('data-editing-ui')
            })
            const isNoEdit = path.some(el => {
                if (!el.hasAttribute) return false
                return el.getAttribute?.('data-no-edit') === 'true'
            })
            if (isNoEdit || isEditingUI) return

            // Only target text elements or specific sections
            const isEditableTag = ['H1', 'H2', 'H3', 'P', 'SPAN', 'A', 'BUTTON'].includes(target.tagName)
            const isEditableDiv = target.tagName === 'DIV' && target.hasAttribute('data-element-key')
            const hasText = target.innerText && target.innerText.trim().length > 0
            const hasKey = target.hasAttribute('data-element-key')
            const isCatalogSelector = target.hasAttribute('data-selection-type')

            if ((isEditableTag || isEditableDiv) && (hasText || hasKey || isCatalogSelector)) {
                setHoveredElement(target)
                if (target !== selectedElement && target !== selectedCatalogElement) {
                    target.style.outline = '2px dashed #6355ff'
                    target.style.outlineOffset = '4px'
                    target.style.cursor = 'pointer'
                }
            }
        }



        const handleMouseOut = (e: MouseEvent) => {
            let target = e.target as HTMLElement
            if (target?.closest) {
                const closestLinkBtn = target.closest('a, button, [data-element-key], [data-selection-type]') as HTMLElement
                if (closestLinkBtn) target = closestLinkBtn
            }

            if (target !== selectedElement && target !== selectedCatalogElement) {
                target.style.outline = ''
                target.style.outlineOffset = ''
            }
            if (hoveredElement === target) {
                setHoveredElement(null)
            }
        }

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement

            // If clicking outside the current selected element while editing
            // IGNORE clicks inside portals (dropdowns, popovers) or the editing toolbar
            const path = e.composedPath() as HTMLElement[]
            const isEditingUI = path.some(el => {
                if (!el.hasAttribute) return false
                return el.hasAttribute('data-editing-ui')
            })

            if (selectedElement && !selectedElement.contains(target) && !isEditingUI) {
                // Save and close
                stopEditing()
            }
        }

        const handleClick = (e: MouseEvent) => {
            let target = e.target as HTMLElement
            if (target?.closest) {
                const closestLinkBtn = target.closest('a, button, [data-element-key], [data-selection-type]') as HTMLElement
                if (closestLinkBtn) target = closestLinkBtn
            }
            const path = e.composedPath() as HTMLElement[]

            // Identify if the click is inside the editing UI (toolbar, dropdowns, etc.)
            const isEditingUI = path.some(el => {
                if (!el.hasAttribute) return false
                return el.hasAttribute('data-editing-ui')
            })

            // Prevent all navigation in preview mode unless it's the editing UI
            if (target.closest('a, button') && !isEditingUI) {
                e.preventDefault()
                e.stopImmediatePropagation()
                e.stopPropagation()
            }

            // Check for inline catalog selection first
            const selectionElement = path.find(el => el.hasAttribute && el.hasAttribute('data-selection-type'))
            if (selectionElement) {
                e.preventDefault()
                e.stopPropagation()

                const section = selectionElement.closest('[data-section-id]')
                const sectionId = section?.getAttribute('data-section-id')
                const selectionType = selectionElement.getAttribute('data-selection-type')
                const elementKey = selectionElement.getAttribute('data-element-key')

                if (sectionId && selectionType) {
                    if (selectedCatalogElement && selectedCatalogElement !== selectionElement) {
                        selectedCatalogElement.style.outline = ''
                        selectedCatalogElement.style.outlineOffset = ''
                    }
                    if (selectedElement) stopEditing()

                    setSelectedCatalogElement(selectionElement)
                    selectionElement.style.outline = '2px solid #6355ff'
                    selectionElement.style.outlineOffset = '4px'

                    window.parent.postMessage({
                        type: 'CATALOG_SELECTION_REQUEST',
                        sectionId,
                        selectionType,
                        elementKey,
                        clientX: e.clientX,
                        clientY: e.clientY
                    }, '*')
                }
                return
            }

            // If we get here, the user clicked something *other* than a selection element
            if (selectedCatalogElement) {
                selectedCatalogElement.style.outline = ''
                selectedCatalogElement.style.outlineOffset = ''
                setSelectedCatalogElement(null)
                window.parent.postMessage({ type: 'CATALOG_SELECTION_CLOSED' }, '*')
            }

            // Skip selection if inside no-edit zone
            const isNoEdit = path.some(el => {
                if (!el.hasAttribute) return false
                return el.getAttribute?.('data-no-edit') === 'true'
            })
            if (isNoEdit) return


            // If it's the editing UI, don't trigger element selection
            if (isEditingUI) return


            const isEditableTag = ['H1', 'H2', 'H3', 'P', 'SPAN', 'A', 'BUTTON'].includes(target.tagName)
            const isEditableDiv = target.tagName === 'DIV' && target.hasAttribute('data-element-key')
            const hasText = target.innerText && target.innerText.trim().length > 0
            const hasKey = target.hasAttribute('data-element-key')

            if ((isEditableTag || isEditableDiv) && (hasText || hasKey)) {



                e.preventDefault()
                e.stopPropagation()

                if (selectedElement === target) return

                // If switching elements, make sure to clean up the previous one
                if (selectedElement) {
                    selectedElement.contentEditable = 'false'
                }

                setSelectedElement(target)
                target.style.outline = '2px solid #6355ff'
                target.style.outlineOffset = '4px'

                // Enable editing
                target.contentEditable = 'true'
                target.focus()
            }
        }


        const stopEditing = () => {
            if (selectedElement) {
                syncContent(selectedElement)
                selectedElement.style.outline = ''
                selectedElement.style.outlineOffset = ''
                selectedElement.contentEditable = 'false'
                setSelectedElement(null)
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey && selectedElement) {
                e.preventDefault()
                stopEditing()
            }
            if (e.key === 'Escape') {
                if (selectedElement) stopEditing()
                if (selectedCatalogElement) {
                    window.parent.postMessage({ type: 'CATALOG_SELECTION_CLOSED' }, '*')
                }
            }
        }

        const syncContent = (el: HTMLElement) => {
            const section = el.closest('[data-section-id]')
            const sectionId = section?.getAttribute('data-section-id')
            const elementKey = el.getAttribute('data-element-key')

            if (sectionId && elementKey) {
                window.parent.postMessage({
                    type: 'CONTENT_UPDATE',
                    sectionId,
                    elementKey,
                    content: el.innerHTML
                }, '*')
            }
        }

        const handleFormSubmit = (e: Event) => {
            const path = e.composedPath() as HTMLElement[]
            const isEditingUI = path.some(el => {
                if (!el.hasAttribute) return false
                return el.hasAttribute('data-editing-ui')
            })
            if (!isEditingUI) {
                e.preventDefault()
                e.stopImmediatePropagation()
                e.stopPropagation()
            }
        }

        // --- CATALOG SELECTION TRACKING ---
        const handleScrollOrResize = () => {
            if (selectedCatalogElement) {
                const rect = selectedCatalogElement.getBoundingClientRect()
                window.parent.postMessage({
                    type: 'CATALOG_SELECTION_POSITION_UPDATE',
                    rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                }, '*')
            }
        }

        if (selectedCatalogElement) {
            window.addEventListener('scroll', handleScrollOrResize, true)
            window.addEventListener('resize', handleScrollOrResize, true)
            // Send initial update instantly
            handleScrollOrResize()
        }
        // ----------------------------------

        document.addEventListener('mouseover', handleMouseOver)
        document.addEventListener('mouseout', handleMouseOut)
        window.addEventListener('mousedown', handleMouseDown, true)
        window.addEventListener('click', handleClick, true)
        window.addEventListener('submit', handleFormSubmit, true)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mouseover', handleMouseOver)
            document.removeEventListener('mouseout', handleMouseOut)
            window.removeEventListener('mousedown', handleMouseDown, true)
            window.removeEventListener('click', handleClick, true)
            window.removeEventListener('submit', handleFormSubmit, true)
            document.removeEventListener('keydown', handleKeyDown)
            if (selectedCatalogElement) {
                window.removeEventListener('scroll', handleScrollOrResize, true)
                window.removeEventListener('resize', handleScrollOrResize, true)
            }
        }



    }, [selectedElement, selectedCatalogElement])

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data.type === 'CATALOG_SELECTION_CLOSED') {
                if (selectedCatalogElement) {
                    selectedCatalogElement.style.outline = ''
                    selectedCatalogElement.style.outlineOffset = ''
                    setSelectedCatalogElement(null)
                }
            }
        }
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [selectedCatalogElement])

    const handleStyleUpdate = (styles: any) => {
        if (!selectedElement) return

        const section = selectedElement.closest('[data-section-id]')
        const sectionId = section?.getAttribute('data-section-id')
        const elementKey = selectedElement.getAttribute('data-element-key')

        if (sectionId && elementKey) {
            window.parent.postMessage({
                type: 'STYLE_UPDATE',
                sectionId,
                elementKey,
                styles
            }, '*')
        }
    }

    return (
        <>
            {selectedElement && (
                <InlineStyleToolbar
                    target={selectedElement}
                    onUpdate={handleStyleUpdate}
                    onClose={() => {
                        if (selectedElement) {
                            selectedElement.style.outline = ''
                            selectedElement.contentEditable = 'false'
                            setSelectedElement(null)
                        }
                    }}
                />
            )}
            <style jsx global>{`
                [contenteditable="true"]:focus {
                    outline: 2px solid #6355ff !important;
                    background: rgba(99, 85, 255, 0.05);
                    border-radius: 4px;
                }
                .preview-mode * {
                    transition: outline 0.1s ease-in-out !important;
                }
            `}</style>
        </>
    )
}
