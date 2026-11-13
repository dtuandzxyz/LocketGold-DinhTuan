/**
 * LocketGold-DinhTuan - Private Cloudflare Worker Backend & DNS Generator
 * Tác giả: dtuandzxyz
 */

// Điền ID NextDNS của bạn vào đây (Ví dụ: "abc123"). Nếu chưa có, bạn điền sau.
const NEXTDNS_ID = "94a485"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const nextdnsId = env.NEXTDNS_ID || NEXTDNS_ID;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // =========================================================================
    // 1. TẢI FILE CẤU HÌNH DNS PROFILE (.mobileconfig) CHO IPHONE
    // =========================================================================
    if (pathname === "/dns" || pathname === "/get-dns" || pathname.endsWith(".mobileconfig")) {
      const dnsServerUrl = (nextdnsId && nextdnsId !== "YOUR_NEXTDNS_ID")
        ? `https://dns.nextdns.io/${nextdnsId}/LocketGold-dtuandzxyz`
        : `https://cloudflare-dns.com/dns-query`;

      const mobileconfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadDisplayName</key>
    <string>LocketGold - dtuandzxyz</string>
    <key>PayloadDescription</key>
    <string>Hồ sơ DNS Giữ Locket Gold VIP - Phát triển bởi dtuandzxyz</string>
    <key>PayloadOrganization</key>
    <string>dtuandzxyz</string>
    <key>PayloadIdentifier</key>
    <string>com.dtuandzxyz.locketgold.dns</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>9B3E25B1-4A2D-4B9E-8D2A-0A91D6E5A1C2</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>PayloadDisplayName</key>
            <string>DNS Giữ Gold dtuandzxyz</string>
            <key>PayloadIdentifier</key>
            <string>com.dtuandzxyz.locketgold.dns.config</string>
            <key>PayloadType</key>
            <string>com.apple.dnsSettings.managed</string>
            <key>PayloadUUID</key>
            <string>7C2E15A2-3B1C-4C8D-9E1B-1B82D5E4A2D3</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>DNSSettings</key>
            <dict>
                <key>DNSProtocol</key>
                <string>HTTPS</string>
                <key>ServerURL</key>
                <string>${dnsServerUrl}</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>`;

      return new Response(mobileconfig, {
        headers: {
          "Content-Type": "application/x-apple-aspen-config; charset=utf-8",
          "Content-Disposition": 'attachment; filename="LocketGold-dtuandzxyz.mobileconfig"',
          "Cache-Control": "no-cache"
        }
      });
    }

    // =========================================================================
    // 2. API ĐĂNG KÝ TÀI KHOẢN VIP
    // =========================================================================
    if (pathname === "/api/register-vip") {
      const uid = url.searchParams.get("uid") || "";
      const username = url.searchParams.get("username") || "";

      if (env.VIP_KV && (uid || username)) {
        if (uid) await env.VIP_KV.put(`user:${uid.toLowerCase()}`, JSON.stringify({ uid, username, date: Date.now() }));
        if (username) await env.VIP_KV.put(`uname:${username.toLowerCase()}`, JSON.stringify({ uid, username, date: Date.now() }));
      }

      return new Response(JSON.stringify({ success: true, message: "VIP registered successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // =========================================================================
    // 3. API LẤY DANH SÁCH VIP
    // =========================================================================
    if (pathname === "/api/vip-users") {
      let identifiers = ["tdtcuto", "v4YDQu8WDebZ04YB4uh77K1KwcT2", "dtuandzxyz"];

      if (env.VIP_KV) {
        const list = await env.VIP_KV.list();
        for (const key of list.keys) {
          const id = key.name.replace(/^(user:|uname:)/, "");
          if (id && !identifiers.includes(id)) {
            identifiers.push(id);
          }
        }
      }

      return new Response(JSON.stringify({ identifiers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // =========================================================================
    // 4. TRANG CHỦ LANDING PAGE DÀNH CHO KHÁCH BẤM CÀI ĐẶT DNS NHANH
    // =========================================================================
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LocketGold - dtuandzxyz</title>
  <style>
    body {
      margin: 0; padding: 0;
      background: linear-gradient(135deg, #111, #1c1500);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #fff; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      text-align: center;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 184, 0, 0.3);
      padding: 32px 24px; border-radius: 24px;
      max-width: 380px; width: 90%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block; background: #FFB800; color: #000;
      font-weight: 700; font-size: 13px; padding: 4px 12px;
      border-radius: 20px; margin-bottom: 16px;
    }
    h1 { font-size: 24px; margin: 0 0 8px 0; color: #FFB800; }
    p { color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.5; margin-bottom: 24px; }
    .btn {
      display: block; background: #FFB800; color: #000;
      font-weight: 700; font-size: 16px; padding: 16px;
      border-radius: 50px; text-decoration: none;
      box-shadow: 0 4px 20px rgba(255, 184, 0, 0.4);
      transition: transform 0.2s;
    }
    .btn:active { transform: scale(0.97); }
    .footer { margin-top: 24px; font-size: 12px; color: rgba(255,255,255,0.4); }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">CHÍNH CHỦ dtuandzxyz</div>
    <h1>Locket Gold VIP</h1>
    <p>Cài đặt hồ sơ DNS độc quyền để giữ gói Gold vĩnh viễn không cần ứng dụng bên thứ 3.</p>
    <a href="/dns" class="btn">📲 Cài Đặt DNS Giữ Gold</a>
    <div class="footer">Phát triển bởi dtuandzxyz &copy; 2026</div>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
