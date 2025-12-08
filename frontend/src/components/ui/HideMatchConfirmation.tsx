"use client"

import { useRef, useImperativeHandle, forwardRef } from "react"

interface HideMatchConfirmationProps {
  onConfirm: () => void
  onCancel?: () => void
}

export interface HideMatchConfirmationRef {
  show: () => void
  hide: () => void
}

export const HideMatchConfirmation = forwardRef<
  HideMatchConfirmationRef,
  HideMatchConfirmationProps
>(({ onConfirm, onCancel }, ref) => {
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
            👁️‍🗨️
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Sakrij otkazanu razmenu
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-3">
            Da li ste sigurni da želite da sakrijete ovu otkazanu razmenu?
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Napomena:</strong> Ova akcija će trajno sakriti razmenu iz
              vašeg prikaza. Razmena će i dalje postojati u sistemu, ali je
              nećete videti na kontrolnoj tabli.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Otkaži
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Sakrij razmenu
          </button>
        </div>
      </div>
    </div>
  )
})

HideMatchConfirmation.displayName = "HideMatchConfirmation"
