export const useToastCustom = () => {
  const toast = useToast()

  const success = (message: string) => {
    toast.add({
      title: message,
      icon: 'i-heroicons-check-circle',
      color: 'green',
      timeout: 3000
    })
  }

  const error = (message: string) => {
    toast.add({
      title: message,
      icon: 'i-heroicons-x-circle',
      color: 'red',
      timeout: 4000
    })
  }

  const info = (message: string) => {
    toast.add({
      title: message,
      icon: 'i-heroicons-information-circle',
      color: 'blue',
      timeout: 3000
    })
  }

  return { success, error, info }
}
