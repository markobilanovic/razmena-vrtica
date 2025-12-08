"use client"

import { useRef, useImperativeHandle, forwardRef } from "react"

interface ConfirmationPopoverProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel?: () => void
}

export interface ConfirmationPopoverRef {
  show: () => void
  hide: () => void
}

export const ConfirmationPopover = forwardRef<
  ConfirmationPopoverRef,
  ConfirmationPopoverProps
>(
  (
    {
      title,
      message,
      confirmLabel = "Obriši",
      cancelLabel = "Otkaži",
      onConfirm,
      onCancel,
    },
    ref,
  ) => {
    const popoverRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      show: () => popoverRef.current?.showPopover(),
      hide: () => popoverRef.current?.hidePopover(),
    }))

    const handleCancel = () => {
      popoverRef.current?.hidePopover()
      onCancel?.()
    }

    const handleConfirm = () => {
      popoverRef.current?.hidePopover()
      onConfirm()
    }

    return (
      <div
        ref={popoverRef}
        // @ts-ignore - popover is a valid attribute
        popover="auto"
        className="m-0 p-0 border-0 bg-white rounded-lg shadow-xl max-w-sm fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-4 whitespace-pre-line">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    )
  },
)

ConfirmationPopover.displayName = "ConfirmationPopover"
