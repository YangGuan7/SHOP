"use strict";
(() => {
  const api = 'https://script.google.com/macros/s/AKfycbz1x8vZtVcSbfJqNpeR38cpEebcA4iVWGDvZzpz3jxs22B6VbM16Nhq0hGefJGQQOS3/exec';
  const anchor = document.getElementById('lookup-message');
  if (!anchor) return;
  const panel = document.createElement('section');
  panel.className = 'location-consent';
  panel.hidden = true;
  function add(tag, text) {
    const node = document.createElement(tag); node.textContent = text; panel.appendChild(node); return node;
  }
  add('h4', '需要協助排查嗎？');
  add('p', '你已多次查詢未成功。你可以自願提供目前位置，供團主排查異常查詢。網站會將經緯度、定位精度與時間傳送到團主的私人 Google 試算表，不會顯示在公開網站。位置欄位在提供滿 7 天後，由每小時排程清除。位置可能有誤差，不能用來確認身分。');
  add('p', '不同意不影響繼續查詢；原本的查詢次數限制仍適用。');
  const agree = add('button', '同意提供目前位置'); agree.type = 'button';
  const decline = add('button', '不提供位置'); decline.type = 'button';
  const message = add('p', ''); message.setAttribute('role', 'status');
  anchor.insertAdjacentElement('afterend', panel);
  let failures = 0, token = '', generation = 0, busy = false;
  function reset() { generation++; token = ''; panel.hidden = true; message.textContent = ''; busy = false; agree.disabled = false; agree.hidden = false; }
  document.addEventListener('shop-query-result', event => {
    const result = event.detail;
    reset();
    if (result.ok) { failures = 0; return; }
    if (!result.locationToken) return;
    failures++;
    if (failures < 3) return;
    token = result.locationToken; panel.hidden = false;
  });
  ['customer-name', 'customer-facebook'].forEach(id => document.getElementById(id)?.addEventListener('input', reset));
  document.getElementById('customer-clear')?.addEventListener('click', () => { failures = 0; reset(); });
  window.addEventListener('pagehide', reset);
  decline.addEventListener('click', () => { reset(); });
  agree.addEventListener('click', () => {
    if (busy || !token) return;
    if (!navigator.geolocation) { message.textContent = '這個瀏覽器不支援定位，你仍可繼續查詢。'; return; }
    const requestGeneration = generation, requestToken = token;
    busy = true; agree.disabled = true;
    message.textContent = '請選擇是否允許瀏覽器取得位置。';
    navigator.geolocation.getCurrentPosition(async position => {
      if (requestGeneration !== generation) return;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        message.textContent = '正在送出位置…';
        const response = await fetch(api, {
          method:'POST', mode:'cors', credentials:'omit', redirect:'follow', signal:controller.signal,
          body:new URLSearchParams({action:'reportLocation', consent:'yes', token:requestToken,
            latitude:String(position.coords.latitude), longitude:String(position.coords.longitude), accuracy:String(position.coords.accuracy)})
        });
        if (!response.ok) throw Error('HTTP');
        const result = await response.json();
        if (requestGeneration !== generation) return;
        message.textContent = result.message || '位置送出失敗，仍可繼續查詢。';
        if (result.ok) { token = ''; agree.hidden = true; }
      } catch (error) {
        if (requestGeneration === generation) message.textContent = '位置未能送出，仍可繼續查詢。';
      } finally {
        clearTimeout(timeout);
        if (requestGeneration === generation) { busy = false; agree.disabled = false; }
      }
    }, error => {
      if (requestGeneration !== generation) return;
      busy = false; agree.disabled = false;
      message.textContent = error.code === 1 ? '你未允許定位，不影響繼續查詢。' : '無法取得位置，不影響繼續查詢。';
    }, {enableHighAccuracy:true, timeout:15000, maximumAge:0});
  });
})();
