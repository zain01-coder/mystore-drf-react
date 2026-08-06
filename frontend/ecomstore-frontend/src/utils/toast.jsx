import toast from 'react-hot-toast'
import Toast from '../components/Toast'

const DEFAULT_DURATION = 3000
const ERROR_DURATION = 5000

export const showToast = (message, type = 'info', options = {}) => {
  const duration = options.duration || (type === 'error' ? ERROR_DURATION : DEFAULT_DURATION)

  toast.custom(
    (t) => (
      <Toast
        type={type}
        title={options.title}
        message={message}
        duration={duration}
        leaving={!t.visible}
        onClose={() => toast.dismiss(t.id)}
      />
    ),
    { duration }
  )
}
