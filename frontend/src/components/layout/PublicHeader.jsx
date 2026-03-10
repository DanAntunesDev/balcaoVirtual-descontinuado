import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/app/providers/useTheme";
import { useAuth } from "@/domain/auth/useAuth";
import { getToken } from "@/domain/auth/tokenService";
import { useEffect, useMemo, useRef, useState } from "react";

const HEADER_VARIANTS = {
  login: {
    showBack: false,
    showThemeToggle: true,
    links: [
      { to: "/privacidade", label: "Privacidade" },
      { to: "/suporte", label: "Suporte" },
    ],
  },

  privacy: {
    showBack: true,
    backTo: "/login",
    showThemeToggle: true,
    links: [{ to: "/suporte", label: "Suporte" }],
  },

  suporte: {
    showBack: true,
    backTo: "/login",
    showThemeToggle: true,
    links: [{ to: "/privacidade", label: "Privacidade" }],
  },

  register: {
    showBack: true,
    backTo: "/login",
    showThemeToggle: true,
    links: [
      { to: "/privacidade", label: "Privacidade" },
      { to: "/suporte", label: "Suporte" },
    ],
  },

  public_cartorios: {
    showBack: false,
    showThemeToggle: false,
    links: [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Criar conta" },
    ],
  },

  client: {
    showBack: false,
    showThemeToggle: false,
    links: [
      { to: "/cliente", label: "Cartórios" },
      { to: "/cliente/agendamentos", label: "Agendamentos" },
      { to: "/cliente/meu-perfil", label: "Meu Perfil" },
    ],
  },

  default: {
    showBack: false,
    showThemeToggle: true,
    links: [],
  },
};

function resolveDisplayName(user) {
  if (!user) return "Usuário";

  const first = user.first_name || user.firstName || user.nome || user.name || "";
  const last = user.last_name || user.lastName || user.sobrenome || "";

  const full = [String(first).trim(), String(last).trim()].filter(Boolean).join(" ").trim();
  if (full) return full;

  if (user.username) return String(user.username);
  if (user.email) return String(user.email).split("@")[0] || String(user.email);

  return "Usuário";
}

function getInitialsAlways2(name = "") {
  const raw = String(name).trim();
  if (!raw) return "U";

  const parts = raw.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    const p = parts[0].replace(/[^A-Za-zÀ-ÿ0-9]/g, "");
    const two = (p.slice(0, 2) || p.slice(0, 1) || "U").toUpperCase();
    return two;
  }

  const a = (parts[0][0] || "U").toUpperCase();
  const b = (parts[parts.length - 1][0] || "U").toUpperCase();
  return `${a}${b}`;
}

export default function PublicHeader({ variant = "default" }) {
  const themeApi = useTheme();
  const theme = themeApi?.theme;
  const toggleTheme = themeApi?.toggleTheme;

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const config = HEADER_VARIANTS[variant] || HEADER_VARIANTS.default;

  const displayName = resolveDisplayName(user);
  const photo = user?.foto || user?.avatarUrl || null;
  const initials = getInitialsAlways2(displayName);

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

  const links = useMemo(() => config.links || [], [config.links]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const active = navEl.querySelector(".header-link.active-link");
    if (!active) {
      setIndicator((prev) => ({ ...prev, visible: false }));
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const rect = active.getBoundingClientRect();

    setIndicator({
      left: rect.left - navRect.left,
      width: rect.width,
      visible: true,
    });
  }, [location.pathname, links.length]);

  useEffect(() => {
    function onResize() {
      const navEl = navRef.current;
      if (!navEl) return;

      const active = navEl.querySelector(".header-link.active-link");
      if (!active) return;

      const navRect = navEl.getBoundingClientRect();
      const rect = active.getBoundingClientRect();

      setIndicator({
        left: rect.left - navRect.left,
        width: rect.width,
        visible: true,
      });
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const token = getToken();
  const isLogged = Boolean(token) || Boolean(user);
  const logoTarget =
    user?.role && String(user.role).toLowerCase() !== "cliente" ? "/redirect" : "/cliente";

  function handleLogoClick() {
    navigate(isLogged ? logoTarget : "/");
  }

  const userAreaStyle = { position: "relative", display: "flex", alignItems: "center", gap: 10 };

  const userNameStyle = {
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 13,
    fontWeight: 800,
    color: theme === "dark" ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.70)",
  };

  // Moldura circular do avatar (foto/ini­ciais)
  const userChipStyle = {
    width: 38,
    height: 38,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",

    background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(88,48,128,0.10)",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(88,48,128,0.18)",
    boxShadow: theme === "dark" ? "0 10px 24px rgba(0,0,0,0.35)" : "0 10px 24px rgba(0,0,0,0.08)",
  };

  const userInitialsStyle = {
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: "0.04em",
    color: theme === "dark" ? "rgba(255,255,255,0.88)" : "rgba(88,48,128,0.92)",
    userSelect: "none",
  };

  const userPhotoStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const userMenuStyle = {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    minWidth: 160,
    background: "var(--card-bg)",
    border: "1px solid var(--input-border)",
    borderRadius: 14,
    padding: 8,
    boxShadow: "var(--shadow-soft)",
    zIndex: 9999,
    display: "grid",
    gap: 6,
  };

  const userMenuItemStyle = {
    height: 40,
    padding: "0 10px",
    borderRadius: 12,
    border: 0,
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 800,
    color: "var(--text-main)",
  };

  const [hover, setHover] = useState(false);

  return (
    <header className="auth-header">
      <div className="header-limit header-inner">
        <div className="header-left cursor-pointer" onClick={handleLogoClick}>
          <div className="logo-icon">
            <svg fill="currentColor" viewBox="0 0 48 48">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" />
            </svg>
          </div>
          <h2>Rastrum</h2>
        </div>

        <div className="header-right">
          {config.showBack && (
            <NavLink className="header-link" to={config.backTo || "/login"}>
              <span className="material-symbols-outlined">arrow_back</span>
              Voltar
            </NavLink>
          )}

          {links.length > 0 && (
            <div className="header-nav" ref={navRef}>
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/cliente"}
                  className={({ isActive }) => `header-link ${isActive ? "active-link" : ""}`}
                >
                  {item.label}
                </NavLink>
              ))}

              <span
                className={`header-nav-indicator ${indicator.visible ? "is-visible" : ""}`}
                style={{
                  transform: `translateX(${indicator.left}px)`,
                  width: `${indicator.width}px`,
                }}
              />
            </div>
          )}

          {config.showThemeToggle && typeof toggleTheme === "function" && (
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Alternar tema"
              title="Alternar tema"
            >
              <span className="material-symbols-outlined">
                {theme === "dark" ? "dark_mode" : "light_mode"}
              </span>
            </button>
          )}

          {variant === "client" && (
            <div className="user-area" ref={menuRef} style={userAreaStyle}>
              <span style={userNameStyle} title={displayName}>
                {displayName}
              </span>

              <button
                type="button"
                className="user-chip"
                style={userChipStyle}
                onClick={() => setOpen((v) => !v)}
                aria-label="Menu do usuário"
                aria-expanded={open}
              >
                {photo ? (
                  <img className="user-photo" style={userPhotoStyle} src={photo} alt={displayName} />
                ) : (
                  <span className="user-initials" style={userInitialsStyle}>
                    {initials}
                  </span>
                )}
              </button>

              {open && (
                <div className="user-menu" style={userMenuStyle}>
                  <button
                    type="button"
                    style={{
                      ...userMenuItemStyle,
                      ...(hover ? { background: "var(--input-bg)" } : null),
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onClick={() => {
                      setOpen(false);
                      logout?.();
                    }}
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}