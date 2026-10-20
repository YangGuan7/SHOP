"use strict";
(() => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbz1x8vZtVcSbfJqNpeR38cpEebcA4iVWGDvZzpz3jxs22B6VbM16Nhq0hGefJGQQOS3/exec';
  const form = document.getElementById('lookup-form');
  const nameInput = document.getElementById('customer-name');
  const facebookInput = document.getElementById('customer-facebook');
  const submit = document.getElementById('customer-submit');
  const clear = document.getElementById('customer-clear');
  const message = document.getElementById('lookup-message');
  const results = document.getElementById('my-orders');
  let controller = null;
  let version = 0;

  function text(parent, tag, value, className) {
    const element = document.createElement(tag);
    element.textContent = value;
    if (className) element.className = className;
    parent.appendChild(element);
    return element;
  }
  function status(value, error = false) {
    message.textContent = value;
    message.classList.toggle('is-error', error);
  }
  function render(groups) {
    const fragment = document.createDocumentFragment();
    groups.forEach((group, index) => {
      const card = document.createElement('article');
      card.className = 'customer-group';
      const heading = document.createElement('h3');
      const toggle = document.createElement('button');
      toggle.className = 'customer-group-toggle';
      heading.appendChild(toggle);
      const number = text(toggle, 'span', String(index + 1).padStart(2, '0'), 'customer-group-number');
      number.setAttribute('aria-hidden', 'true');
      text(toggle, 'span', group.title, 'customer-group-title');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      const content = document.createElement('div');
      content.id = 'customer-group-content-' + index;
      content.hidden = true;
      toggle.setAttribute('aria-controls', content.id);
      toggle.addEventListener('click', () => {
        content.hidden = !content.hidden;
        toggle.setAttribute('aria-expanded', String(!content.hidden));
      });
      card.appendChild(heading);
      const meta = document.createElement('div');
      meta.className = 'customer-meta';
      text(meta, 'span', '目前進度：' + (group.progress || '尚未填寫'));
      text(meta, 'span', '官方預計出貨日：' + (group.estimated || '尚未公布'));
      if (group.updated) text(meta, 'span', '最後更新：' + group.updated);
      card.appendChild(meta);
      if (group.announcement) text(content, 'p', group.announcement, 'customer-announcement');
      group.items.forEach(item => {
        const section = document.createElement('section');
        section.className = 'customer-item';
        text(section, 'h4', item.product || '商品');
        const dl = document.createElement('dl');
        [['訂單編號', item.order], ['款式', item.variant], ['數量', item.quantity],
         ['單價（元）', item.price], ['小計（元）', item.subtotal],
         ['付款狀態', item.payment], ['出貨狀態', item.shipping], ['備註', item.note]]
          .forEach(([label, value]) => {
            if (value === '' || value === null || value === undefined) return;
            const pair = document.createElement('div');
            if (label === '備註') pair.className = 'customer-note';
            text(pair, 'dt', label);
            text(pair, 'dd', value);
            dl.appendChild(pair);
          });
        section.appendChild(dl);
        content.appendChild(section);
      });
      card.appendChild(content);
      fragment.appendChild(card);
    });
    results.replaceChildren(fragment);
  }
  function cancel() {
    version++;
    if (controller) controller.abort();
    controller = null;
    submit.disabled = false;
    form.removeAttribute('aria-busy');
    results.replaceChildren();
    status('');
  }
  clear.addEventListener('click', () => {
    cancel(); form.reset(); nameInput.focus();
  });
  [nameInput, facebookInput].forEach(input => input.addEventListener('input', cancel));
  window.addEventListener('pagehide', () => { cancel(); facebookInput.value = ''; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    cancel();
    const current = version;
    const name = nameInput.value.trim();
    const facebookName = facebookInput.value.trim();
    if (!name || !facebookName) { status('請輸入登記姓名與臉書名稱。', true); return; }
    controller = new AbortController();
    const activeController = controller;
    const timeout = setTimeout(() => activeController.abort(), 45000);
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status('正在查詢，請稍候…');
    try {
      // 使用 POST 內文傳送；不將姓名或臉書名稱寫入網址、紀錄或本機儲存。
      // 不加入自訂標頭，避免觸發 Apps Script 不支援的 OPTIONS 預檢。
      const response = await fetch(API_URL, {
        method: 'POST', mode: 'cors', credentials: 'omit', redirect: 'follow',
        body: new URLSearchParams({action:'lookup', name, facebookName}),
        signal: activeController.signal
      });
      if (!response.ok) throw Error('HTTP');
      const data = await response.json();
      if (current !== version) return;
      if (!data || typeof data.ok !== 'boolean') throw Error('FORMAT');
      document.dispatchEvent(new CustomEvent('shop-query-result', {detail: data}));
      if (!data.ok) { status(data.message || '查詢失敗，請稍後再試。', true); return; }
      if (!Array.isArray(data.groups) || data.groups.some(g => !g || !Array.isArray(g.items))) throw Error('FORMAT');
      render(data.groups);
      status(data.groups.length ? `查詢完成，共找到 ${data.groups.length} 個參與團務。` : '目前沒有你的參團紀錄。');
    } catch (error) {
      if (current !== version) return;
      results.replaceChildren();
      status(error.name === 'AbortError'
        ? '查詢逾時，請稍後再試。'
        : '無法連接查詢服務，請稍後再試；若持續發生，請聯絡團主確認後端部署。', true);
    } finally {
      clearTimeout(timeout);
      if (current === version) {
        facebookInput.value = '';
        submit.disabled = false;
        form.removeAttribute('aria-busy');
        controller = null;
      }
    }
  });
})();
