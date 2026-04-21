
function Navbar({ currentPage, onNavigate }) {
  const links = [
    { id: "home",      label: "Home" },
    { id: "checkin",   label: "Check-in" },
    { id: "dashboard", label: "Garden" },
    { id: "weekly",    label: "Weekly" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-7 border-b border-green-100"
      style={{ background: "rgba(250,248,243,.94)", backdropFilter: "blur(12px)" }}
    >
      <span className="text-base font-bold text-green-900">
        Burnout <span className="text-green-600">Garden</span> 🌿
      </span>

      <div className="flex gap-1">
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              currentPage === link.id
                ? "bg-green-100 text-green-900"
                : "text-green-800 hover:bg-green-100"
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
