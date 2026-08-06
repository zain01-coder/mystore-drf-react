import React from 'react'
import './toast.css'

/*
Presentational only — this component holds no state and owns no timers.
It renders one toast box and reports clicks on the close button upwards.
The provider that will drive it comes later.
*/

const TOAST_ICONS = {
  success: 'bi-check-circle-fill',
  error: 'bi-exclamation-triangle-fill',
  warning: 'bi-exclamation-circle-fill',
  info: 'bi-info-circle-fill',
}

const Toast = ({
  type = 'info',
  title,
  message,
  duration = 3000,
  showProgress = true,
  leaving = false,
  onClose,
}) => {
  const icon = TOAST_ICONS[type] || TOAST_ICONS.info

  return (
    <div
      className={`app-toast app-toast-${type} ${leaving ? 'is-leaving' : ''}`}
      style={{ '--toast-duration': `${duration}ms` }}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <span className="app-toast-icon">
        <i className={`bi ${icon}`}></i>
      </span>

      <div className="app-toast-body">
        {title && <p className="app-toast-title">{title}</p>}
        <p className="app-toast-message">{message}</p>
      </div>

      {onClose && (
        <button className="app-toast-close" type="button" onClick={onClose} aria-label="Dismiss">
          <i className="bi bi-x"></i>
        </button>
      )}

      {showProgress && <span className="app-toast-progress" />}
    </div>
  )
}

/*
Fixed-position stack. Sits above the router so it survives navigation.
For now it just lays out whatever children you hand it.
*/
export const ToastStack = ({ children }) => (
  <div className="app-toast-stack">{children}</div>
)

export default Toast
