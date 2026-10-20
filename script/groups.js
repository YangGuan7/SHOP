"use strict";

// 僅放公開團務資訊，請勿放入客人資料、查詢碼或存取憑證。
// 展示用資料；接上正式系統時，可將此處替換為 API 回傳的團務資料。
const groups = [
    { id: "G001", artist: "SEVENTEEN", title: "SEVENTEEN 專輯與預購特典團", art: "CARAT<br>COLLECTION", status: "waiting", date: "2026-11-02", updated: "2026-10-16", note: "已完成官方訂購，等待官方預計出貨。", colors: ["#eee5e7", "#986b79"] },
    { id: "G002", artist: "IVE", title: "IVE 官方周邊代購團", art: "DIVE<br>INTO YOU", status: "transit", date: "2026-10-12", updated: "2026-10-15", note: "商品已從海外倉寄出，等待國際運送與清關。", colors: ["#e8ecdf", "#7c8a64"] },
    { id: "G003", artist: "Stray Kids", title: "Stray Kids 應援周邊團", art: "STAY<br>WITH ME", status: "packing", date: "2026-10-05", updated: "2026-10-16", note: "商品已抵台，依訂單順序核對數量、包裝出貨。", colors: ["#eee3d6", "#96734f"] },
    { id: "G004", artist: "aespa", title: "aespa 專輯收藏團", art: "MY<br>UNIVERSE", status: "done", date: "2026-09-20", updated: "2026-10-10", note: "本團已完成出貨，感謝大家一起耐心等待。", colors: ["#e5e3ef", "#827497"] },
    { id: "G005", artist: "BTS", title: "BTS 官方角色生活小物團", art: "LITTLE<br>HAPPINESS", status: "waiting", date: "2026-11-10", updated: "2026-10-14", note: "官方備貨中，實際出貨時間將依官方公告更新。", colors: ["#e9e1ee", "#92769f"] },
    { id: "G006", artist: "TWICE", title: "TWICE 演唱會紀念周邊團", art: "ONCE<br>AGAIN", status: "transit", date: "2026-10-09", updated: "2026-10-13", note: "官方分批寄出，已到海外倉的商品安排合箱運送。", colors: ["#f3e4de", "#b18476"] }
];

