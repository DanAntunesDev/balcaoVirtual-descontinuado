const Header = ({
  left,
  center,
  right,
  className = "",
}) => {
  return (
    <header
      className={`
        w-full h-16 flex items-center justify-between
        px-6 border-b
        bg-white dark:bg-neutral-900
        transition-colors duration-300
        ${className}
      `}
    >
      <div className="flex items-center gap-4">
        {left}
      </div>

      <div className="flex items-center gap-6">
        {center}
      </div>

      <div className="flex items-center gap-4">
        {right}
      </div>
    </header>
  );
};

export default Header;