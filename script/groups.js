"use strict";
// 僅放公開團務資訊
// 線下團要加 purchaseType: "offline"，
// image 填入主視覺圖片路徑，例如 "img/G008.jpg"；留空時顯示原文字封面。
const groups = [
    {
        id: "G008",
        artist: "Stray Kids",
        title: "【線上】ODD&FRESH POP-UP", 
        image: "img/G008_cover.jpg",
        art: "ODD&amp;FRESH<br>POP-UP",
        status: "open", 
        date: "2026-10-28", 
        updated: "2026-10-20",
        note: "開團中。", 
        colors: ["#E2F4FA", "#217A32"], 
        accent: "#FFF332"
    },
    {
        id: "G007", 
        artist: "Stray Kids",
        title: "【線上】THIS & THAT(MARKET SKZOO)", 
        image: "",
        art: "THIS &amp; THAT<br>MARKET SKZOO",
        status: "waiting", 
        date: "2026-10-22", 
        updated: "2026-10-20",
        note: "已結單；目前進度：已收單。", 
        colors: ["#E2F4FA", "#217A32"], 
        accent: "#FFF332"

    },
    {
        id: "G006", 
        artist: "Stray Kids",
        title: "【線上】FANS年曆", 
        image: "",
        art: "FANS<br>CALENDAR",
        status: "waiting", 
        date: "2026-12-22", 
        updated: "2026-10-20",
        note: "已結單；目前進度：已收單。", 
        colors: ["#eee3d6", "#96734f"]
    },
    {
        id: "G005", 
        artist: "Stray Kids",
        title: "【線上】中國快閃店周邊", 
        image: "",
        art: "CHINA<br>POP-UP",
        status: "waiting", 
        date: "", 
        dateLabel: "2026/10/1起+60天內", 
        updated: "2026-10-20",
        note: "已結單；目前進度：已收單。備註：部分兔二補。", 
        colors: ["#f3e4de", "#b18476"]
    },
    {
        id: "G004", 
        artist: "Stray Kids",
        title: "【線上】THIS&THAT 快閃店周邊", 
        image: "",
        art: "THIS&amp;THAT<br>POP-UP",
        status: "waiting", 
        date: "2026-11-06", 
        updated: "2026-10-20",
        note: "已結單；目前進度：已收單。", 
        colors: ["#eee5e7", "#986b79"]
    },
    {
        id: "G003", 
        purchaseType: "offline", 
        artist: "Stray Kids",
        title: "【RUN IT】日本場周", 
        image: "",
        art: "RUN IT<br>JAPAN",
        status: "transit", 
        date: "2026/10", 
        updated: "2026-10-20",
        note: "已結單；目前進度：已運回。", 
        colors: ["#e8ecdf", "#7c8a64"]
    },
    {
        id: "G002", 
        purchaseType: "offline", 
        artist: "Stray Kids",
        title: "【RUN IT】首爾場周", 
        image: "",
        art: "RUN IT<br>SEOUL",
        status: "waiting", date: "2026-11-16", 
        updated: "2026-10-20",
        note: "已結單；目前進度：線上已結單；早鳥已出貨完畢。", 
        colors: ["#eee3d6", "#96734f"]
    },
    {
        id: "G001", 
        artist: "Stray Kids",
        title: "【線上】三麗鷗聯名", 
        image: "",
        art: "SANRIO<br>COLLABORATION",
        status: "done", 
        date: "2026/10/20&11/20", 
        updated: "2026-10-20",
        note: "已結單；目前進度：全數下單完畢。備註：部分兔二補。", 
        colors: ["#f3e4de", "#b18476"]
    }
];
