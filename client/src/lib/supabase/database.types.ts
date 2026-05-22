// =============================================================================
// Supabase generated-style database typings
// =============================================================================
// Hand-maintained to mirror the SQL in `schema.sql` (profiles, with the
// `add_nickname.sql` migration applied) and `posts.schema.sql`.
//
// Privacy posture: `auth.users.email` is internal Supabase plumbing required
// for OAuth callback dispatch. Our domain model exposes `nickname` only —
// `email` and the legacy `full_name` column remain on `profiles` for back-
// compat during migration but MUST NOT be displayed in any new UI surface.
// =============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          /** Canonical public display name. NOT NULL after migration. */
          nickname: string;
          /** @deprecated Use `nickname`. Will be dropped in a future migration. */
          email: string | null;
          /** @deprecated Use `nickname`. Will be dropped in a future migration. */
          full_name: string | null;
          avatar_url: string | null;
          provider: "email" | "google" | "kakao";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          provider?: "email" | "google" | "kakao";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          provider?: "email" | "google" | "kakao";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      // -------------------------------------------------------------------
      // posts — board entries owned by a single author
      // -------------------------------------------------------------------
      posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ---- Convenience aliases ----------------------------------------------------

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type PostRow = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];
