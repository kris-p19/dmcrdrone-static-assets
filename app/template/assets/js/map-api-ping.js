/**
 * API Ping Monitor
 * ----------------
 * ส่ง request ไปยัง endpoint ทุก 30 วินาทีเพื่อตรวจสอบการเชื่อมต่อ
 * หากเกิดข้อผิดพลาด จะลองใหม่อัตโนมัติและแสดงสถานะใน console / UI
 */

const PING_URL = "https://map-api.fintechxhub.com/router.php/api/ping";
const PING_INTERVAL = 30 * 1000; // 30 วินาที
let pingTimer = null;

function pingServer() {
    $.ajax({
        url: PING_URL,
        method: "GET",
        cache: false,
        timeout: 8000, // timeout 8 วินาที
        dataType: "json"
    })
    .done(function (res, textStatus, xhr) {
        // console.log(`[PING ✅] ${new Date().toISOString()} | Status: ${xhr.status} | Response:`, res);
    })
    .fail(function (xhr, textStatus, errorThrown) {
        // console.warn(`[PING ❌] ${new Date().toISOString()} | ${textStatus} - ${errorThrown}`);
    });
}

/**
 * เริ่มการ Ping ทุก 30 วินาที
 */
function startPing() {
    if (pingTimer) clearInterval(pingTimer);
    pingServer(); // เรียกทันทีครั้งแรก
    pingTimer = setInterval(pingServer, PING_INTERVAL);
    // console.info(`🔄 Ping service started: interval ${PING_INTERVAL / 1000}s`);
}

/**
 * หยุดการ Ping
 */
function stopPing() {
    if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
        // console.info("⏹️ Ping service stopped");
    }
}

// เริ่มทำงานทันทีเมื่อหน้าโหลดเสร็จ
// $(document).ready(startPing);