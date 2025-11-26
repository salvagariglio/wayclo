export async function POST(req) {
    const { qr_token } = await req.json();
    const supabase = getSupabaseServer();

    const { data } = await supabase
        .from("registrations")
        .select("*")
        .eq("qr_token", qr_token)
        .single();

    if (!data) return NextResponse.json({ ok: false, error: "QR no registrado" });

    if (data.qr_used)
        return NextResponse.json({
            ok: false,
            error: "Este QR ya fue usado",
        });

    await supabase
        .from("registrations")
        .update({
            qr_used: true,
            qr_used_at: new Date().toISOString(),
        })
        .eq("id", data.id);

    return NextResponse.json({
        ok: true,
        name: `${data.first_name} ${data.last_name}`,
        company: data.company,
        id: data.id,
    });
}
