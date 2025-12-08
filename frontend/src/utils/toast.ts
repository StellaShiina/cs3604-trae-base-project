import { createVNode, render } from 'vue';
import ToastComponent from '../components/Toast.vue';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

const showToast = (options: ToastOptions) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const vnode = createVNode(ToastComponent, {
    message: options.message,
    type: options.type || 'info',
    duration: options.duration || 3000,
    onDestroy: () => {
      render(null, container);
      document.body.removeChild(container);
    }
  });

  render(vnode, container);

  // Auto remove from DOM after duration + animation time
  setTimeout(() => {
    render(null, container);
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }, (options.duration || 3000) + 500);
};

export const toast = {
  success: (message: string, duration?: number) => showToast({ message, type: 'success', duration }),
  error: (message: string, duration?: number) => showToast({ message, type: 'error', duration }),
  warning: (message: string, duration?: number) => showToast({ message, type: 'warning', duration }),
  info: (message: string, duration?: number) => showToast({ message, type: 'info', duration }),
};
