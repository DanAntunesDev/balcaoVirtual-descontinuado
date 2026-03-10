export default function Modal({
  open,
  onClose,
  children,
  className
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-container ${className || ""}`}>
        {children}
      </div>
    </div>
  );
}