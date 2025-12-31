import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const isNewSignup = requestUrl.searchParams.get("type") === "signup";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if this is a new user by looking at profile creation
      const { data: profile } = await supabase
        .from("profiles")
        .select("created_at, plaid_access_token")
        .eq("id", data.user.id)
        .single();

      // Consider it a new user if:
      // 1. Profile was created within the last 5 minutes, OR
      // 2. They don't have a Plaid token yet
      const isNewUser =
        profile &&
        (!profile.plaid_access_token ||
          new Date().getTime() - new Date(profile.created_at).getTime() <
            5 * 60 * 1000);

      if (isNewUser) {
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
      }
    }
  }

  // Default: redirect to dashboard for returning users
  return NextResponse.redirect(requestUrl.origin);
}
