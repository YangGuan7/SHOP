"use strict";

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
