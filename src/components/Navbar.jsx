function Navbar({ currentPage, onNavigate, onOpenBreathe }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "checkin", label: "Check-in" },
    { id: "dashboard", label: "Garden" },
    { id: "weekly", label: "Weekly" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-green-100 bg-[rgba(250,248,243,0.88)] px-4 backdrop-blur-xl md:px-7">
      <span className="text-sm font-bold text-green-900 md:text-base">
        Burnout <span className="text-green-600">Garden</span> 🌿
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenBreathe}
          className="rounded-full border border-green-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-green-900 transition hover:-translate-y-0.5 hover:bg-green-50 md:text-sm"
        >
          🌿 Breathe
        </button>

        <div className="flex gap-1">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate(link.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                currentPage === link.id
                  ? "bg-green-100 text-green-900"
                  : "text-green-800 hover:bg-green-100"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
