export const useToastCustom = () => {
  const toast = useToast()

  const success = (message: string) => {
    toast.add({
      title: message,
      icon: 'i-heroicons-check-circle',
      color: 'success',
      duration: 3000
    })
  }

  const error = (message: string) => {
    toast.add({
      title: message,
      icon: 'i-heroicons-x-circle',
      color: 'error',
      duration: 4000
    })
  }

  const info = (message: string) => {
    toast.add({
      title: message,
      icon: 'i-heroicons-information-circle',
      color: 'info',
      duration: 3000
    })
  }

  return { success, error, info }
}
