// app/(protected)/layout.jsx
import RequireAuth from "../../components/RequireAuth";

export default function ProtectedLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
