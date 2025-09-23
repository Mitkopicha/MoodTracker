// app/auth/layout.jsx
export const metadata = {
    title: "MoodTrack — Sign in",
    description: "Create your account or sign in to MoodTrack",
  };
  
  export default function AuthLayout({ children }) {
    // No <html> or <body> here—those only belong in the root layout.
    return <div className="min-h-screen">{children}</div>;
  }
  