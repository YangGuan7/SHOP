"use strict";

// 展示用資料；接上正式系統時，可將此處替換為 API 回傳的團務資料。
const groups = [
    { id: "G001", artist: "SEVENTEEN", title: "SEVENTEEN 專輯與預購特典團", art: "CARAT<br>COLLECTION", status: "waiting", date: "2026-11-02", updated: "2026-10-16", note: "已完成官方訂購，等待官方預計出貨。", colors: ["#eee5e7", "#986b79"] },
    { id: "G002", artist: "IVE", title: "IVE 官方周邊代購團", art: "DIVE<br>INTO YOU", status: "transit", date: "2026-10-12", updated: "2026-10-15", note: "商品已從海外倉寄出，等待國際運送與清關。", colors: ["#e8ecdf", "#7c8a64"] },
    { id: "G003", artist: "Stray Kids", title: "Stray Kids 應援周邊團", art: "STAY<br>WITH ME", status: "packing", date: "2026-10-05", updated: "2026-10-16", note: "商品已抵台，依訂單順序核對數量、包裝出貨。", colors: ["#eee3d6", "#96734f"] },
    { id: "G004", artist: "aespa", title: "aespa 專輯收藏團", art: "MY<br>UNIVERSE", status: "done", date: "2026-09-20", updated: "2026-10-10", note: "本團已完成出貨，感謝大家一起耐心等待。", colors: ["#e5e3ef", "#827497"] },
    { id: "G005", artist: "BTS", title: "BTS 官方角色生活小物團", art: "LITTLE<br>HAPPINESS", status: "waiting", date: "2026-11-10", updated: "2026-10-14", note: "官方備貨中，實際出貨時間將依官方公告更新。", colors: ["#e9e1ee", "#92769f"] },
    { id: "G006", artist: "TWICE", title: "TWICE 演唱會紀念周邊團", art: "ONCE<br>AGAIN", status: "transit", date: "2026-10-09", updated: "2026-10-13", note: "官方分批寄出，已到海外倉的商品安排合箱運送。", colors: ["#f3e4de", "#b18476"] }
];

const stages = ["waiting", "transit", "packing", "done"];
const statusLabels = { waiting: "等待出貨", transit: "運送中", packing: "理貨出貨", done: "已完成" };
const stageNotes = ["已完成訂購，等待官方出貨。", "官方已出貨，安排海外倉與國際運送。", "商品已抵台，進行核對與包裝。", "本團已完成出貨。"];
const $ = (selector) => document.querySelector(selector);
let activeFilter = "all";
let detailTrigger = null;
const todayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit"
}).formatToParts(new Date());
const todayPart = (type) => todayParts.find((part) => part.type === type).value;
const todayKey = `${todayPart("year")}-${todayPart("month")}-${todayPart("day")}`;
let calendarYear = Number(todayPart("year"));
let calendarMonth = Number(todayPart("month")) - 1;

function renderCalendar() {
    const monthKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`;
    const monthGroups = groups.filter((group) => group.date.startsWith(`${monthKey}-`));
    const firstWeekday = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    const rows = [];

    for (let offset = 0; offset < cellCount; offset += 7) {
        const cells = [];
        for (let weekday = 0; weekday < 7; weekday++) {
            const day = offset + weekday - firstWeekday + 1;
            if (day < 1 || day > daysInMonth) {
                cells.push('<td class="calendar-padding"></td>');
                continue;
            }
            const key = `${monthKey}-${String(day).padStart(2, "0")}`;
            const scheduled = monthGroups.filter((group) => group.date === key);
            cells.push(`<td${key === todayKey ? ' class="is-today"' : ""}>
                <time datetime="${key}"${key === todayKey ? ' aria-current="date"' : ""}>${day}</time>
                ${scheduled.map((group) => `<button type="button" class="calendar-event ${group.status}" data-detail="${group.id}" aria-label="${formatDate(key)} ${escapeHtml(group.title)}，${statusLabels[group.status]}，查看詳情">${escapeHtml(group.title)}<small>${statusLabels[group.status]}</small></button>`).join("")}
            </td>`);
        }
        rows.push(`<tr>${cells.join("")}</tr>`);
    }

    $("#calendar-month").textContent = `${calendarYear} 年 ${calendarMonth + 1} 月`;
    $(".calendar-caption").textContent = `${calendarYear} 年 ${calendarMonth + 1} 月各團官方預計出貨日期`;
    $("#calendar-days").innerHTML = rows.join("");
    $("#calendar-summary").textContent = monthGroups.length
        ? `本月共 ${monthGroups.length} 團預計由官方出貨；月曆顯示全部團務。`
        : "本月尚無官方預計出貨安排，可切換月份查看其他團務。";
}

function moveCalendarMonth(amount) {
    const next = new Date(calendarYear, calendarMonth + amount, 1);
    calendarYear = next.getFullYear();
    calendarMonth = next.getMonth();
    renderCalendar();
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function formatDate(value) {
    return value.replaceAll("-", ".");
}

function detailButton(group) {
    return `<button type="button" class="detail-button" data-detail="${group.id}" aria-label="查看${escapeHtml(group.title)}詳情">查看詳情 ↗</button>`;
}

function renderCards() {
    const query = $("#search").value.trim().toLocaleLowerCase();
    const visibleGroups = groups.filter((group) => {
        const matchesStatus = activeFilter === "all" || group.status === activeFilter;
        const text = `${group.title} ${group.artist} ${group.note} ${statusLabels[group.status]}`;
        return matchesStatus && text.toLocaleLowerCase().includes(query);
    });

    visibleGroups.sort((a, b) => $("#sort").value === "date"
        ? a.date.localeCompare(b.date) || a.id.localeCompare(b.id)
        : b.updated.localeCompare(a.updated) || a.id.localeCompare(b.id));

    $("#cards").innerHTML = visibleGroups.map((group) => {
        const progress = stages.indexOf(group.status);
        return `
            <article class="card">
                <div class="card-art" style="background:${group.colors[0]};color:${group.colors[1]}" aria-hidden="true">
                    <span class="art-badge">${escapeHtml(group.artist)}</span>
                    <div class="art-text">${group.art}<small>WITH LOVE, FOR YOU</small></div>
                </div>
                <div class="card-body">
                    <div class="artist">${escapeHtml(group.artist)}</div>
                    <h3>${escapeHtml(group.title)}</h3>
                    <div class="status-row"><span class="badge ${group.status}">${statusLabels[group.status]}</span><span>階段 ${progress + 1} / 4</span></div>
                    <div class="steps" aria-hidden="true">${stages.map((_, index) => `<i class="${index <= progress ? "filled" : ""}"></i>`).join("")}</div>
                    <div class="date-row"><span>官方預計出貨</span><b>${formatDate(group.date)}</b></div>
                    <div class="card-note">${escapeHtml(group.note)}</div>
                    <div class="card-footer"><span>更新 ${formatDate(group.updated)}</span>${detailButton(group)}</div>
                </div>
            </article>`;
    }).join("");

    $("#total").textContent = groups.length;
    $("#result-count").textContent = `共 ${visibleGroups.length} 團`;
    $("#empty").hidden = visibleGroups.length > 0;
}

function switchView(view) {
    $("#all-view").hidden = view !== "all";
    $("#mine-view").hidden = view !== "mine";
    document.querySelectorAll(".nav").forEach((button) => {
        const selected = button.dataset.view === view;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
}

function showDetail(id, trigger) {
    const group = groups.find((item) => item.id === id);
    if (!group) return;
    detailTrigger = trigger;
    const progress = stages.indexOf(group.status);
    $("#detail-body").innerHTML = `
        <div class="eyebrow">${escapeHtml(group.artist)} · 示範團務</div>
        <h2 id="detail-title">${escapeHtml(group.title)}</h2>
        <p class="detail-intro">${escapeHtml(group.note)}</p>
        <span class="badge ${group.status}">${statusLabels[group.status]}</span>
        <p class="date-row">官方預計出貨：${formatDate(group.date)}</p>
        <ol class="timeline">${stages.map((stage, index) => `
            <li class="${index <= progress ? "complete" : ""}">
                <b>${statusLabels[stage]}${index === progress ? "（目前階段）" : ""}</b>
                <small>${index <= progress ? stageNotes[index] : "尚未進入此階段，請耐心等候更新。"}</small>
            </li>`).join("")}</ol>
        <p class="detail-intro">最後更新：${formatDate(group.updated)}<br>以上為展示資料；官方出貨日不等於抵台日。</p>`;
    $("#detail").showModal();
}

function lookupOrders() {
    const code = $("#code").value.trim().toUpperCase();
    const valid = code === "CAN2026";
    $("#my-orders").innerHTML = "";
    $("#lookup-message").textContent = valid
        ? "已找到 2 筆示範跟團資料。"
        : "查無此查詢碼，請確認輸入內容，或使用示範碼 CAN2026。";
    if (!valid) return;

    const orders = [
        { groupId: "G001", product: "專輯隨機版本 × 1", number: "DEMO-001" },
        { groupId: "G003", product: "應援周邊組 × 1", number: "DEMO-002" }
    ];
    $("#my-orders").innerHTML = `<h3 class="order-heading">我的示範訂單</h3>` + orders.map((order) => {
        const group = groups.find((item) => item.id === order.groupId);
        return `<article class="order-item">
            <div><h3>${escapeHtml(group.title)}</h3><p>${escapeHtml(order.product)} · ${order.number}</p><span class="badge ${group.status}">${statusLabels[group.status]}</span></div>
            ${detailButton(group)}
        </article>`;
    }).join("");
}

document.querySelectorAll(".nav").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelectorAll(".filter").forEach((button) => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        document.querySelectorAll(".filter").forEach((filter) => {
            const selected = filter === button;
            filter.classList.toggle("selected", selected);
            filter.setAttribute("aria-pressed", String(selected));
        });
        renderCards();
    });
    button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
});

$("#search").addEventListener("input", renderCards);
$("#sort").addEventListener("change", renderCards);
$("#result-count").setAttribute("role", "status");

document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-detail]");
    if (button) showDetail(button.dataset.detail, button);
});

$("#detail").setAttribute("aria-labelledby", "detail-title");
$("#close").addEventListener("click", () => $("#detail").close());
$("#detail").addEventListener("click", (event) => {
    if (event.target !== $("#detail")) return;
    const bounds = $("#detail").getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        $("#detail").close();
    }
});
$("#detail").addEventListener("close", () => detailTrigger?.focus());

$("#lookup-form").addEventListener("submit", (event) => {
    event.preventDefault();
    lookupOrders();
});
$("#code").addEventListener("input", () => {
    $("#my-orders").innerHTML = "";
    $("#lookup-message").textContent = "";
});
$("#sample").addEventListener("click", () => {
    $("#code").value = "CAN2026";
    lookupOrders();
});

$("#faq-button").setAttribute("aria-controls", "faq");
$("#faq-button").setAttribute("aria-expanded", "false");
$("#faq-button").addEventListener("click", () => {
    const expanded = $("#faq").hidden;
    $("#faq").hidden = !expanded;
    $("#faq-button").setAttribute("aria-expanded", String(expanded));
    $("#faq-button").textContent = expanded ? "收起常見問題 ↑" : "查看常見問題 ↗";
    if (expanded) $("#faq").scrollIntoView({ behavior: "smooth", block: "start" });
});

switchView("all");
renderCards();
$("#calendar-prev").addEventListener("click", () => moveCalendarMonth(-1));
$("#calendar-next").addEventListener("click", () => moveCalendarMonth(1));
$("#calendar-today").addEventListener("click", () => {
    calendarYear = Number(todayPart("year"));
    calendarMonth = Number(todayPart("month")) - 1;
    renderCalendar();
});
renderCalendar();
