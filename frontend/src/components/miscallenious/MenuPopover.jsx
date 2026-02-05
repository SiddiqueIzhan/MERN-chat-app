const MenuPopover = ({ isOpen, items, onClose, position }) => {
  if (!isOpen) return null;
  return (
    <ul
      className={`absolute mt-2 min-w-36 bg-white border rounded-md shadow-lg z-50 ${position} overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
    >
      {items.length === 0 ? (
        <li className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
          No New Messages
        </li>
      ) : (
        items.map((item, index) => (
          <li
            key={index}
            onClick={() => {
              item.onClick?.();
              onClose?.();
            }}
            className={`w-full text-left px-4 py-2 text-sm whitespace-nowrap hover:bg-gray-100 ${
              item.danger ? "text-red-600" : ""
            }`}
          >
            {item.label}
          </li>
        ))
      )}
    </ul>
  );
};

export default MenuPopover;
