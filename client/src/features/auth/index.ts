// =============================================================================
// Auth feature — public surface (re-exports from existing modules)
// =============================================================================
// The original auth code lives across `contexts/`, `hooks/`, `components/auth/`,
// and `lib/supabase/`. This barrel gives downstream consumers a single,
// feature-shaped import path: `@/features/auth`.
// =============================================================================

export { AuthProvider, useAuth } from "@/contexts/AuthContext";
export { ProtectedRoute, PublicOnlyRoute } from "@/components/auth/ProtectedRoute";
export {
  useSignIn,
  useSignUp,
  useSignInWithGoogle,
  useSignInWithKakao,
  useForgotPassword,
  useUpdatePassword,
} from "@/hooks/useAuthActions";
export {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithKakao,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  getCurrentSession,
  getCurrentUser,
  getProfile,
  updateProfile,
  normalizeAuthError,
} from "@/lib/supabase/auth";
