import { jsx as _jsx } from "react/jsx-runtime";
export function Button({ children, className }) {
    return (_jsx("button", { className: `bg-blue-600 text-white px-4 py-2 rounded-lg ${className}`, children: children }));
}
