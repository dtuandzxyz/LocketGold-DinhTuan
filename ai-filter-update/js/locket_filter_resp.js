/***********************************************
> LocketGold-DinhTuan - Unblur & Community Gold VIP
> Phân Phối: dtuandzxyz
> Tác giả: dtuandzxyz
> Hỗ trợ: Shadowrocket, Loon, Surge, Quantumult X
> Tính năng:
  - Chiều Request: Giả lập US, xóa sạch cache 304.
  - Chiều Response:
    1. Tự động nhận diện tài khoản chủ máy (Self): Cấp Gold, vương miện & viền vàng, tự động đăng ký P2P lên Worker.
    2. Nhận diện bạn bè trong mạng lưới VIP cộng đồng: Cấp viền vàng & tim vàng (💛) chuẩn Locket.
    3. Hỗ trợ argument "all_friends=true" nếu muốn hiện Gold cho toàn bộ bạn bè.
    4. Gỡ bỏ hoàn toàn mã lỗi (402, 403), gỡ che mờ ảnh (unblur) và cờ khóa đòi Gold trên moment.
***********************************************/

// Cấu hình máy chủ Cloudflare Worker riêng (nếu có). Để trống "" để chạy tự chủ Offline 100% không gửi dữ liệu ra ngoài
// Worker server của dtuandzxyz — đồng bộ VIP list và đăng ký tài khoản
const WORKER_HOST = "https://locketgold.iamdinhtuan-info.workers.dev";
const VIP_STORE_KEY = "LOCKET_VIP_COMMUNITY";
const SELF_UID_KEY = "LOCKET_SELF_UID";
const SELF_USERNAME_KEY = "LOCKET_SELF_USERNAME";

// Danh sách bạn bè VIP bạn muốn cấp huy hiệu vàng (thêm username của bạn bè vào đây)
const BASE_VIP_USERS = ["tdtcuto", "v4YDQu8WDebZ04YB4uh77K1KwcT2", "dtuandzxyz"];

function applyGoldBadge(target) {
    if (!target || typeof target !== "object") return;
    target.badge = "locket_gold";
    target.badge_tier = "gold";
    target.show_badge = true;
    target.is_gold = true;
    target.has_gold = true;
    target.gold = true;
    target.gold_subscription = true;
    target.has_gold_subscription = true;
    target.tier = "gold";
    target.subscription_status = "active";
    if (target.user && typeof target.user === "object" && target.user !== target) {
        applyGoldBadge(target.user);
    }
    if (target.friend && typeof target.friend === "object" && target.friend !== target) {
        applyGoldBadge(target.friend);
    }
    if (target.profile && typeof target.profile === "object" && target.profile !== target) {
        applyGoldBadge(target.profile);
    }
}

function isNodeVip(target, vSet) {
    if (!target || typeof target !== "object") return false;
    const uid = String(target.uid || target.user_id || target.id || target.friend_uid || target.friend_id || target.friendId || target.userId || "").toLowerCase().trim();
    if (uid && vSet.has(uid)) return true;
    const uname = String(target.username || target.friend_username || "").toLowerCase().trim();
    if (uname && vSet.has(uname)) return true;
    if (target.user && typeof target.user === "object") {
        const uUid = String(target.user.uid || target.user.id || target.user.user_id || "").toLowerCase().trim();
        if (uUid && vSet.has(uUid)) return true;
        const uUname = String(target.user.username || target.user.friend_username || "").toLowerCase().trim();
        if (uUname && vSet.has(uUname)) return true;
    }
    if (target.friend && typeof target.friend === "object") {
        const fUid = String(target.friend.uid || target.friend.id || "").toLowerCase().trim();
        if (fUid && vSet.has(fUid)) return true;
        const fUname = String(target.friend.username || "").toLowerCase().trim();
        if (fUname && vSet.has(fUname)) return true;
    }
    const dName = String(target.display_name || target.first_name || target.name || (target.user && (target.user.display_name || target.user.first_name)) || "").toLowerCase().trim();
    if (dName && vSet.has(dName)) return true;
    return false;
}

// =========================================================================
// 1. CHIỀU REQUEST
// =========================================================================
if (typeof $response === "undefined") {
    const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
    if (reqUrl.includes("changeProfileInfo")) {
        $done({
            response: {
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    data: { badge: "locket_gold", badge_tier: "gold", is_gold: true, success: true },
                    result: { badge: "locket_gold", badge_tier: "gold", is_gold: true, success: true }
                })
            }
        });
        return;
    }

    let headers = Object.assign({}, ($request && $request.headers) || {});
    for (let k of Object.keys(headers)) {
        if (['if-none-match', 'if-modified-since', 'x-revenuecat-etag'].includes(k.toLowerCase())) {
            delete headers[k];
        }
    }
    $done({ headers: headers });
}

// =========================================================================
// 2. CHIỀU RESPONSE
// =========================================================================
else {
    const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";

    // === AI FILTER UNLOCK ===
    // Mở khóa generateFilteredImage: Nếu server trả lỗi → patch thành 200 + unlock
    if (reqUrl.includes("generateFilteredImage")) {
        let filterBody = $response.body;
        let filterStatus = $response.status || $response.statusCode || 200;
        try {
            let filterObj = JSON.parse(filterBody);
            if (filterStatus === 402 || filterStatus === 403 || filterStatus === 400) {
                filterStatus = 200;
                filterObj = {
                    result: {
                        status: 200,
                        is_gold: true,
                        is_locked: false,
                        requires_gold: false,
                        unlocked: true,
                        data: (filterObj.error && filterObj.error.details) ? filterObj.error.details : {}
                    }
                };
            } else {
                if (filterObj && filterObj.result) {
                    filterObj.result.is_locked = false;
                    filterObj.result.requires_gold = false;
                    filterObj.result.unlocked = true;
                    filterObj.result.is_gold = true;
                }
            }
            filterBody = JSON.stringify(filterObj);
        } catch (e) {}
        let fh = Object.assign({}, ($response && $response.headers) || {});
        delete fh["Content-Encoding"]; delete fh["content-encoding"];
        delete fh["Content-Length"];   delete fh["content-length"];
        delete fh["Transfer-Encoding"];delete fh["transfer-encoding"];
        fh["content-type"] = "application/json; charset=utf-8";
        $done({ status: filterStatus, headers: fh, body: filterBody });
        return;
    }

    let body = $response.body;
    let status = $response.status || $response.statusCode || 200;

    const customArg = (typeof $argument === "string" && $argument.trim()) ? $argument.trim().toLowerCase() : "";
    const unlockAllFriends = customArg.includes("all_friends=true") || customArg.includes("gold_all=true");

    let vipSet = new Set(BASE_VIP_USERS.map(u => String(u).toLowerCase().trim()));

    function extractSelfUidFromHeaders(headers) {
        if (!headers || typeof headers !== "object") return null;
        const auth = headers["authorization"] || headers["Authorization"] || headers["AUTHORIZATION"] || "";
        if (!auth || typeof auth !== "string") return null;
        const token = auth.replace(/^Bearer\s+/i, "").trim();
        const parts = token.split(".");
        if (parts.length >= 2) {
            try {
                let base64Url = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                while (base64Url.length % 4) base64Url += "=";
                let output = "";
                let str = String(base64Url).replace(/=+$/, "");
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
                    buffer = chars.indexOf(buffer);
                }
                if (output) {
                    const payload = JSON.parse(output);
                    return payload.user_id || payload.sub || payload.uid || null;
                }
            } catch (e) {}
        }
        return null;
    }

    const reqHeaders = (typeof $request !== "undefined" && $request && $request.headers) ? $request.headers : {};
    const jwtSelfUid = extractSelfUidFromHeaders(reqHeaders);
    let myUid = (typeof $persistentStore !== "undefined") ? $persistentStore.read(SELF_UID_KEY) : null;
    if (jwtSelfUid) {
        myUid = jwtSelfUid;
        if (typeof $persistentStore !== "undefined") {
            $persistentStore.write(myUid, SELF_UID_KEY);
        }
    }
    if (myUid) vipSet.add(String(myUid).toLowerCase().trim());
    const myUname = (typeof $persistentStore !== "undefined") ? $persistentStore.read(SELF_USERNAME_KEY) : null;
    if (myUname) vipSet.add(String(myUname).toLowerCase().trim());

    if (typeof $persistentStore !== "undefined") {
        try {
            const rawVip = $persistentStore.read(VIP_STORE_KEY);
            if (rawVip) {
                const list = JSON.parse(rawVip);
                if (Array.isArray(list)) {
                    for (let id of list) {
                        if (id) vipSet.add(String(id).toLowerCase().trim());
                    }
                }
            }
        } catch (e) {}
    }

    if (body && typeof body === "string") {
        try {
            let obj = JSON.parse(body);

            // Mở rộng regex để bắt đủ endpoint bạn bè của Locket
            const isFriendsOrFeed = /getFriends|getUsers|fetchFriends|getRecipients|recipients|moments|fetchMoments|getMoments|contacts|friendships|friend_list|getFeed|fetchFeed|getFollowers|getFollowing|getPeople|searchUsers|suggestedFriends|friend_requests|pendingFriends/i.test(reqUrl);

            // Fix status cho MỌI response (kể cả friends/feed)
            if (status === 402 || status === 403 || status === 400) {
                status = 200;
            }

            // Bảo toàn pagination để không mất trang bạn bè
            const paginationKeys = ["next_page_token", "page_token", "cursor", "next_cursor", "has_more", "total_count", "count", "limit", "offset"];
            const savedPagination = {};
            for (const pk of paginationKeys) {
                if (pk in obj) savedPagination[pk] = obj[pk];
                if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data) && pk in obj.data) savedPagination["data_" + pk] = obj.data[pk];
                if (obj.result && typeof obj.result === "object" && !Array.isArray(obj.result) && pk in obj.result) savedPagination["result_" + pk] = obj.result[pk];
            }

            function unlockSelfUser(userNode) {
                if (!userNode || typeof userNode !== "object") return;
                applyGoldBadge(userNode);
                userNode.can_use_filters = true;
                userNode.can_use_gold_features = true;
                userNode.filter_access = true;

                const actual = (userNode.user && typeof userNode.user === "object") ? userNode.user : userNode;
                const uid = String(actual.uid || actual.user_id || actual.id || userNode.uid || userNode.user_id || userNode.id || myUid || "").toLowerCase().trim();
                const username = String(actual.username || userNode.username || "").toLowerCase().trim();

                if (typeof $persistentStore !== "undefined") {
                    if (uid) $persistentStore.write(uid, SELF_UID_KEY);
                    if (username) $persistentStore.write(username, SELF_USERNAME_KEY);
                }
                if (uid) vipSet.add(uid);
                if (username) vipSet.add(username);

                if (WORKER_HOST && (uid || username) && typeof $httpClient !== "undefined") {
                    try {
                        $httpClient.get(`${WORKER_HOST}/api/register-vip?uid=${encodeURIComponent(uid)}&username=${encodeURIComponent(username)}`, function() {});
                    } catch (e) {}
                }

                const authHeader = reqHeaders["authorization"] || reqHeaders["Authorization"];
                if (authHeader && typeof $httpClient !== "undefined") {
                    const lastSyncTime = (typeof $persistentStore !== "undefined") ? $persistentStore.read("LOCKET_PROFILE_BADGE_SYNCED") : null;
                    const now = Date.now();
                    if (!lastSyncTime || (now - Number(lastSyncTime)) > 3600000) {
                        if (typeof $persistentStore !== "undefined") {
                            $persistentStore.write(String(now), "LOCKET_PROFILE_BADGE_SYNCED");
                        }
                        try {
                            $httpClient.post({
                                url: "https://api.locketcamera.com/changeProfileInfo",
                                headers: { "Authorization": authHeader, "Content-Type": "application/json" },
                                body: JSON.stringify({ data: { badge: "locket_gold" } })
                            }, function() {});
                        } catch (e) {}
                    }
                }
            }

            const isSingleUserProfile = Boolean(
                !isFriendsOrFeed &&
                ((obj && obj.data && typeof obj.data === "object" && !Array.isArray(obj.data) && (obj.data.email || (myUid && obj.data.uid === myUid))) ||
                 (obj && obj.result && typeof obj.result === "object" && !Array.isArray(obj.result) && (obj.result.email || (myUid && obj.result.uid === myUid))) ||
                 (obj && obj.user && typeof obj.user === "object" && !Array.isArray(obj.user) && (obj.user.email || (myUid && obj.user.uid === myUid))))
            );

            if (isSingleUserProfile) {
                applyGoldBadge(obj);
                unlockSelfUser(obj.data || obj.result || obj.user || obj);
            }

            // Các key không được đệ quy vào (tránh làm hỏng pagination / metadata)
            const SKIP_KEYS = new Set(["badge", "is_gold", "has_gold", "tier", "gold",
                "next_page_token", "page_token", "cursor", "next_cursor",
                "has_more", "total_count", "count", "limit", "offset",
                "created_at", "updated_at", "timestamp", "expires_at"]);

            function transformNode(node, depth) {
                if (!node || typeof node !== "object") return;
                // Giới hạn độ sâu đệ quy để tránh stack overflow với danh sách bạn lớn
                if ((depth || 0) > 8) return;
                if (Array.isArray(node)) {
                    for (let i = 0; i < node.length; i++) transformNode(node[i], (depth || 0) + 1);
                    return;
                }

                const actualUser = (node.user && typeof node.user === "object") ? node.user : node;
                const nodeUid = String(actualUser.uid || actualUser.user_id || actualUser.id || node.uid || node.user_id || node.id || "").toLowerCase().trim();

                const isSelf = Boolean(
                    (myUid && nodeUid && nodeUid === myUid.toLowerCase()) ||
                    ("email" in node && node.email && typeof node.email === "string" && node.email.includes("@")) ||
                    ("push_token" in node && node.push_token) ||
                    ("fcm_token" in node && node.fcm_token)
                );

                if (isSelf) {
                    unlockSelfUser(node);
                } else {
                    const isVipFriend = unlockAllFriends || isNodeVip(node, vipSet);
                    if (isVipFriend) {
                        applyGoldBadge(node);
                        if (node.user && typeof node.user === "object") applyGoldBadge(node.user);
                        if (node.friend && typeof node.friend === "object") applyGoldBadge(node.friend);
                    }
                }

                const falseFlags = ["is_locked", "locked", "requires_gold", "require_gold", "gold_only", "is_gold_only", "paywall", "show_paywall", "show_upsell", "upsell", "blurred", "is_blurred", "needs_gold"];
                for (let f of falseFlags) { if (f in node) node[f] = false; }

                const trueFlags = ["can_view", "unlocked", "is_unlocked", "is_free", "free", "can_use_filter", "allowed", "can_use_filters"];
                for (let t of trueFlags) { if (t in node) node[t] = true; }

                const clearUrl = node.unblurred_url || node.unlocked_url || node.result_url || node.image_url || node.transformed_image_url || node.url;
                if (clearUrl && typeof clearUrl === "string" && clearUrl.startsWith("http")) {
                    if ("blurred_url" in node) node.blurred_url = clearUrl;
                    if ("blurred_image_url" in node) node.blurred_image_url = clearUrl;
                    if ("preview_url" in node && node.is_blurred) node.preview_url = clearUrl;
                }

                for (let k of Object.keys(node)) {
                    if (!SKIP_KEYS.has(k)) {
                        if (vipSet.has(k.toLowerCase().trim()) && node[k] && typeof node[k] === "object") applyGoldBadge(node[k]);
                        transformNode(node[k], (depth || 0) + 1);
                    }
                }
            }

            transformNode(obj, 0);

            // Khôi phục pagination sau khi transform (tránh bị xóa nhầm)
            for (const pk of paginationKeys) {
                if ("data_" + pk in savedPagination && obj.data && typeof obj.data === "object") obj.data[pk] = savedPagination["data_" + pk];
                if ("result_" + pk in savedPagination && obj.result && typeof obj.result === "object") obj.result[pk] = savedPagination["result_" + pk];
                if (pk in savedPagination) obj[pk] = savedPagination[pk];
            }

            body = JSON.stringify(obj);
        } catch (e) {}
    }

    // Tự động tải ngầm danh sách VIP mới nhất từ Worker của dtuandzxyz
    if (WORKER_HOST && typeof $httpClient !== "undefined") {
        try {
            $httpClient.get(`${WORKER_HOST}/api/vip-users`, function(err, resp, data) {
                if (!err && data) {
                    try {
                        const resData = JSON.parse(data);
                        if (resData && Array.isArray(resData.identifiers) && typeof $persistentStore !== "undefined") {
                            $persistentStore.write(JSON.stringify(resData.identifiers), VIP_STORE_KEY);
                        }
                    } catch (e) {}
                }
            });
        } catch (e) {}
    }

    let respHeaders = Object.assign({}, ($response && $response.headers) || {});
    delete respHeaders["Content-Encoding"];
    delete respHeaders["content-encoding"];
    delete respHeaders["Content-Length"];
    delete respHeaders["content-length"];
    delete respHeaders["Transfer-Encoding"];
    delete respHeaders["transfer-encoding"];
    respHeaders["content-type"] = "application/json; charset=utf-8";

    $done({ status: status, headers: respHeaders, body: body });
}