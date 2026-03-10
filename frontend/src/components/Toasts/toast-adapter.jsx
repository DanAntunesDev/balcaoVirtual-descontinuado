import { toast as sonnerToast } from "sonner";

function renderNotification(type, message) {
  return (
    <div className={`notification notification--${type}`}>
      <div className="notification__body">
        <span className="notification__message">{message}</span>
      </div>
      <div className="notification__progress" />
    </div>
  );
}

export function installToastAdapter() {
  sonnerToast.success = (message) =>
    sonnerToast.custom(() => renderNotification("success", message));

  sonnerToast.error = (message) =>
    sonnerToast.custom(() => renderNotification("failure", message));

  sonnerToast.warning = (message) =>
    sonnerToast.custom(() => renderNotification("warning", message));

  sonnerToast.info = (message) =>
    sonnerToast.custom(() => renderNotification("info", message));
}
