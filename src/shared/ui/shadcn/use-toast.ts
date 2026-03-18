import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ToastActionElement = React.ReactElement

export function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const toast = React.useCallback(
    ({ ...props }: Omit<ToasterToast, "id">) => {
      const id = genId()

      const updateToasts = (state: ToasterToast[]) => [
        { id, ...props },
        ...state,
      ].slice(0, TOAST_LIMIT)

      setToasts(updateToasts)

      return {
        id: id,
        dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        update: (props: ToasterToast) =>
          setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...props } : t))
          ),
      }
    },
    []
  )

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) =>
      setToasts((prev) => prev.filter((t) => (toastId ? t.id !== toastId : false))),
  }
}
