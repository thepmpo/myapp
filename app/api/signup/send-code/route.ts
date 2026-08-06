// 회원가입 이메일 인증번호 발송 라우트.
// service_role 키로만 호출 가능한 request_email_verification_code RPC를 실행하고,
// 반환된 평문 코드를 Resend로 발송한다. 코드 자체는 절대 브라우저로 내려보내지 않는다.
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR = { error: "잠시 후 다시 시도해주세요" };

export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim() : "";
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요" }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "올바른 이메일 형식이 아니에요" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: code, error: rpcError } = await supabaseAdmin.rpc(
    "request_email_verification_code",
    { p_email: email }
  );

  if (rpcError) {
    if (rpcError.message.includes("rate_limited")) {
      return NextResponse.json(
        { error: "잠시 후 다시 시도해주세요" },
        { status: 429 }
      );
    }
    console.error("request_email_verification_code error:", rpcError);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "The PMPO <noreply@thepmpo.com>",
      to: [email],
      subject: "[The PMPO] 회원가입 인증번호",
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #262322;">
          <p>The PMPO 회원가입을 위한 인증번호예요.</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
          <p style="color: #6B6460; font-size: 13px;">
            인증번호는 5분간 유효해요. 본인이 요청하지 않았다면 이 메일을 무시해주세요.
          </p>
        </div>
      `,
    }),
  });

  if (!resendRes.ok) {
    console.error("Resend send error:", await resendRes.text());
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
