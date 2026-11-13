/**
 * LocketGold-DinhTuan - Hệ thống Web Bán & Cấp DNS Locket Gold Tự Động
 * Tác giả: dtuandzxyz
 * 100% Miễn phí chạy trên Cloudflare Worker
 */

const NEXTDNS_ID = "94a485";

// Thông tin tài khoản nhận tiền của bạn (Bạn có thể đổi số tài khoản/ngân hàng tại đây)
const BANK_CONFIG = {
  bankId: "MB",           // Mã ngân hàng (MB, VCB, TCB, ACB, VPB, ICB...)
  accountNo: "0999999999",// Số tài khoản của bạn
  accountName: "DINH TUAN",// Tên chủ tài khoản
  amount: 20000,          // Giá gói (Ví dụ 20.000 VNĐ)
};

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
    // 1. TỰ ĐỘNG XUẤT FILE DNS CHO TỪNG USERNAME KHÁCH HÀNG (.mobileconfig)
    // =========================================================================
    if (pathname === "/dns" || pathname === "/get-dns" || pathname.endsWith(".mobileconfig")) {
      const username = (url.searchParams.get("user") || url.searchParams.get("username") || "VIP").trim();
      const dnsServerUrl = `https://dns.nextdns.io/${nextdnsId}/LocketGold-${encodeURIComponent(username)}`;

      const mobileconfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadDisplayName</key>
    <string>LocketGold - ${username}</string>
    <key>PayloadDescription</key>
    <string>Cấu hình DNS Giữ Gold độc quyền cho @${username} - dtuandzxyz</string>
    <key>PayloadOrganization</key>
    <string>dtuandzxyz</string>
    <key>PayloadIdentifier</key>
    <string>com.dtuandzxyz.locketgold.${username}</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>9B3E25B1-${Math.random().toString(36).substring(2, 6).toUpperCase()}-4B9E-8D2A-0A91D6E5A1C2</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>PayloadDisplayName</key>
            <string>DNS Giữ Gold (${username})</string>
            <key>PayloadIdentifier</key>
            <string>com.dtuandzxyz.locketgold.dns.${username}</string>
            <key>PayloadType</key>
            <string>com.apple.dnsSettings.managed</string>
            <key>PayloadUUID</key>
            <string>7C2E15A2-${Math.random().toString(36).substring(2, 6).toUpperCase()}-4C8D-9E1B-1B82D5E4A2D3</string>
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
          "Content-Disposition": `attachment; filename="LocketGold-${username}.mobileconfig"`,
          "Cache-Control": "no-cache"
        }
      });
    }

    // =========================================================================
    // 2. API ĐĂNG KÝ TỰ ĐỘNG USERNAME VÀO HỆ THỐNG VIP
    // =========================================================================
    if (pathname === "/api/register-vip") {
      const username = (url.searchParams.get("username") || url.searchParams.get("user") || "").trim().toLowerCase();
      const uid = (url.searchParams.get("uid") || "").trim().toLowerCase();

      if (env.VIP_KV && (username || uid)) {
        if (username) await env.VIP_KV.put(`uname:${username}`, JSON.stringify({ username, date: Date.now() }));
        if (uid) await env.VIP_KV.put(`user:${uid}`, JSON.stringify({ uid, username, date: Date.now() }));
      }

      return new Response(JSON.stringify({ success: true, user: username }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // =========================================================================
    // 3. API DANH SÁCH VIP TOÀN HỆ THỐNG
    // =========================================================================
    if (pathname === "/api/vip-users") {
      let identifiers = ["tdtcuto", "v4YDQu8WDebZ04YB4uh77K1KwcT2", "dtuandzxyz"];

      if (env.VIP_KV) {
        const list = await env.VIP_KV.list();
        for (const key of list.keys) {
          const id = key.name.replace(/^(user:|uname:)/, "");
          if (id && !identifiers.includes(id)) identifiers.push(id);
        }
      }

      return new Response(JSON.stringify({ identifiers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // =========================================================================
    // 4. GIAO DIỆN WEB BÁN & CẤP DNS TỰ ĐỘNG (HTML / CSS / JS)
    // =========================================================================
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>LocketGold - Hệ Thống Cấp DNS Tự Động by dtuandzxyz</title>
  <link rel="icon" href="https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Locket.png">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 16px;
      background: radial-gradient(circle at top, #2A1F05 0%, #0D0D0D 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #fff; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
    }
    .container {
      max-width: 420px; width: 100%;
      background: rgba(26, 26, 26, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 184, 0, 0.3);
      border-radius: 28px; padding: 32px 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(255, 184, 0, 0.15);
      text-align: center;
    }
    .badge {
      display: inline-block; background: linear-gradient(90deg, #FFB800, #FF8C00);
      color: #000; font-weight: 800; font-size: 12px;
      letter-spacing: 0.5px; padding: 6px 14px;
      border-radius: 20px; text-transform: uppercase; margin-bottom: 14px;
    }
    h1 { font-size: 26px; margin: 0 0 8px 0; font-weight: 800; color: #FFB800; }
    .subtitle { color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 24px; line-height: 1.4; }
    .input-box {
      margin-bottom: 20px; text-align: left;
    }
    label { font-size: 13px; font-weight: 600; color: #FFB800; margin-bottom: 8px; display: block; }
    input[type="text"] {
      width: 100%; padding: 16px; border-radius: 16px;
      background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255, 184, 0, 0.4);
      color: #fff; font-size: 16px; font-weight: 600; outline: none;
      transition: border-color 0.2s;
    }
    input[type="text"]:focus { border-color: #FFB800; box-shadow: 0 0 15px rgba(255,184,0,0.3); }
    .btn-submit {
      width: 100%; padding: 16px; border-radius: 50px;
      background: linear-gradient(90deg, #FFB800, #FFA500);
      color: #000; font-weight: 800; font-size: 16px; border: none;
      cursor: pointer; box-shadow: 0 6px 25px rgba(255, 184, 0, 0.4);
      transition: transform 0.15s;
    }
    .btn-submit:active { transform: scale(0.97); }
    .result-section { display: none; margin-top: 24px; animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .user-card {
      background: rgba(255, 184, 0, 0.1); border: 1px dashed #FFB800;
      border-radius: 16px; padding: 14px; margin-bottom: 20px;
    }
    .user-card span { color: #FFB800; font-weight: 700; }
    .btn-download {
      display: block; width: 100%; padding: 16px;
      background: #25D366; color: #fff; font-weight: 800;
      font-size: 16px; text-decoration: none; border-radius: 50px;
      margin-bottom: 16px; box-shadow: 0 6px 20px rgba(37, 211, 102, 0.35);
    }
    .steps {
      text-align: left; background: rgba(0,0,0,0.3); border-radius: 16px;
      padding: 16px; font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.6;
    }
    .steps ol { margin: 0; padding-left: 20px; }
    .footer { margin-top: 24px; font-size: 11px; color: rgba(255,255,255,0.4); }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">HỆ THỐNG TỰ ĐỘNG dtuandzxyz</div>
    <h1>Locket Gold VIP 💛</h1>
    <div class="subtitle">Nhập Username để hệ thống tạo ngay cấu hình DNS Giữ Gold chính chủ của riêng bạn.</div>

    <div id="formSection">
      <div class="input-box">
        <label for="usernameInput">👤 TÊN USERNAME LOCKET CỦA BẠN:</label>
        <input type="text" id="usernameInput" placeholder="Ví dụ: tdtcuto" autocomplete="off" autocorrect="off" autocapitalize="none">
      </div>
      <button class="btn-submit" onclick="generateDns()">⚡ TẠO DNS GIỮ GOLD CHO TÔI</button>
    </div>

    <div id="resultSection" class="result-section">
      <div class="user-card">
        Đã tạo hồ sơ giữ Gold cho: <span id="displayUser"></span>
      </div>
      <a id="downloadBtn" href="#" class="btn-download">📲 CÀI ĐẶT HỒ SƠ DNS VÀO IPHONE</a>
      
      <div class="steps">
        <strong>📌 Hướng dẫn kích hoạt sau khi bấm:</strong>
        <ol>
          <li>Bấm <strong>Cho phép</strong> tải về hồ sơ cấu hình.</li>
          <li>Mở <strong>Cài đặt (Settings)</strong> trên iPhone.</li>
          <li>Bấm vào mục <strong>Đã tải về hồ sơ</strong> ở trên cùng.</li>
          <li>Bấm <strong>Cài đặt</strong> ở góc phải là xong vĩnh viễn!</li>
        </ol>
      </div>
    </div>

    <div class="footer">Phát triển bởi dtuandzxyz &copy; 2026. Tự động & Miễn phí 100%.</div>
  </div>

  <script>
    function generateDns() {
      const input = document.getElementById("usernameInput");
      let username = input.value.trim().replace(/^@/, "");
      if (!username) {
        alert("Vui lòng nhập Username Locket của bạn!");
        input.focus();
        return;
      }

      // Đăng ký Username vào Worker
      fetch("/api/register-vip?username=" + encodeURIComponent(username));

      // Hiển thị phần tải DNS
      document.getElementById("displayUser").innerText = "@" + username;
      const downloadLink = "/dns?user=" + encodeURIComponent(username);
      document.getElementById("downloadBtn").href = downloadLink;

      document.getElementById("formSection").style.display = "none";
      document.getElementById("resultSection").style.display = "block";

      // Tự động kích hoạt tải sau 0.5s
      setTimeout(function() {
        window.location.href = downloadLink;
      }, 500);
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
