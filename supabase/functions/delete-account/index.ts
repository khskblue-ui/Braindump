import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Edge Function entry point
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  // Only POST is supported
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // ── Environment ────────────────────────────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing required environment variables");
    return jsonResponse({ error: "서버 설정 오류입니다." }, 500);
  }

  // Service-role client — bypasses RLS, used for all DB and admin operations.
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // ── Authentication ────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  let authenticatedUserId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const jwt = authHeader.slice(7);
    const { data: { user } } = await supabase.auth.getUser(jwt);
    if (user) {
      authenticatedUserId = user.id;
    }
  }

  if (!authenticatedUserId) {
    return jsonResponse({ error: "인증이 필요합니다." }, 401);
  }

  // ── Parse request body ────────────────────────────────────────────────
  let userId: string;
  try {
    const body = await req.json();
    userId = body?.user_id;
  } catch {
    return jsonResponse({ error: "요청 본문을 파싱할 수 없습니다." }, 400);
  }

  if (!userId || typeof userId !== "string") {
    return jsonResponse({ error: "user_id가 필요합니다." }, 400);
  }

  // Verify the authenticated user matches the requested user_id
  if (authenticatedUserId !== userId) {
    return jsonResponse({ error: "권한이 없습니다." }, 403);
  }

  // ── Delete user data ──────────────────────────────────────────────────
  try {
    // 1. Delete all entries
    const { error: entriesError } = await supabase
      .from("entries")
      .delete()
      .eq("user_id", userId);

    if (entriesError) {
      console.error("entries 삭제 오류:", entriesError);
      return jsonResponse({ error: "사용자 데이터 삭제에 실패했습니다." }, 500);
    }

    // 2. Delete user settings
    const { error: settingsError } = await supabase
      .from("user_settings")
      .delete()
      .eq("user_id", userId);

    if (settingsError) {
      console.error("user_settings 삭제 오류:", settingsError);
      return jsonResponse({ error: "사용자 설정 삭제에 실패했습니다." }, 500);
    }

    // 3. Delete classify patterns
    const { error: patternsError } = await supabase
      .from("user_classify_patterns")
      .delete()
      .eq("user_id", userId);

    if (patternsError) {
      console.error("user_classify_patterns 삭제 오류:", patternsError);
      return jsonResponse({ error: "분류 패턴 삭제에 실패했습니다." }, 500);
    }

    // 4. Delete classify rules
    const { error: rulesError } = await supabase
      .from("user_classify_rules")
      .delete()
      .eq("user_id", userId);

    if (rulesError) {
      console.error("user_classify_rules 삭제 오류:", rulesError);
      return jsonResponse({ error: "분류 규칙 삭제에 실패했습니다." }, 500);
    }

    // 5. Delete the auth user
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("auth.users 삭제 오류:", deleteUserError);
      return jsonResponse({ error: "계정 삭제에 실패했습니다." }, 500);
    }
  } catch (err) {
    console.error("계정 삭제 중 예외 발생:", err);
    return jsonResponse({ error: "계정 삭제 중 오류가 발생했습니다." }, 500);
  }

  return jsonResponse({ success: true }, 200);
});
