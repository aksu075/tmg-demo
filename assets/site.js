/* TMG Güvenlik Eğitim Kurumu — site davranışları */
(function () {
  'use strict';

  // Mobil menü: sağdan açılan çekmece
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  var overlay = document.getElementById('overlay');
  // Çekmece açıkken arkada kalan bölümler: klavye ve ekran okuyucu bunlara girmesin
  var arka = document.querySelectorAll('.demo-flag, .hdr, main, .ftr, .mbar, .wa-float');
  function menu(open, odakla) {
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-acik', open);
    if (overlay) overlay.hidden = !open;
    arka.forEach(function (el) { el.inert = open; });
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    if (odakla === false) return;
    if (open) { var k = nav.querySelector('.drawer-close'); if (k) k.focus(); } else { burger.focus(); }
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { menu(!nav.classList.contains('open')); });
    if (overlay) overlay.addEventListener('click', function () { menu(false); });
    var kapat = nav.querySelector('.drawer-close');
    if (kapat) kapat.addEventListener('click', function () { menu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) menu(false);
    });
    // Ekran genişleyip masaüstü düzenine geçilirse (tablet döndürme) açık çekmece ve koyu örtü kalmasın
    var genis = window.matchMedia('(min-width: 901px)');
    var genisledi = function () { if (genis.matches && nav.classList.contains('open')) menu(false, false); };
    if (genis.addEventListener) genis.addEventListener('change', genisledi); else if (genis.addListener) genis.addListener(genisledi);
  }

  // Çekmecede Eğitimler alt menüsü: okla açılır; bir eğitim sayfasındayken açık gelir
  document.querySelectorAll('.dd-tog').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.parentElement.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', 'Eğitimler alt menüsünü ' + (open ? 'kapat' : 'aç'));
    });
  });

  // Telefonda alt çubuk: sayfa biraz kaydırıldıktan sonra görünür
  function kaydir() { document.body.classList.toggle('kaydi', window.scrollY > 420); }
  window.addEventListener('scroll', kaydir, { passive: true });
  kaydir();

  // Telefonda tablolar kart olarak gösterilir: her hücre kendi sütun adını taşır
  document.querySelectorAll('table.tbl:not(.kisa)').forEach(function (tbl) {
    var heads = Array.prototype.map.call(tbl.querySelectorAll('thead th'), function (th) {
      return th.textContent.trim();
    });
    var uzun = [];
    tbl.querySelectorAll('tbody tr').forEach(function (tr) {
      var col = 0;
      Array.prototype.forEach.call(tr.children, function (cell) {
        var span = cell.colSpan || 1;
        if (span === 1 && cell.textContent.trim().length > 30) uzun[col] = true;
        col += span;
      });
    });
    tbl.querySelectorAll('tbody tr').forEach(function (tr) {
      var col = 0;
      Array.prototype.forEach.call(tr.children, function (cell, i) {
        var span = cell.colSpan || 1;
        if (i === 0 && cell.tagName === 'TH') {
          cell.classList.add('baslik');
        } else if (heads[col]) {
          cell.setAttribute('data-label', span > 1 ? heads.slice(col, col + span).join(' / ') : heads[col]);
          if (uzun[col]) cell.classList.add('uzun');
        }
        col += span;
      });
    });
  });

  // Ücretlerin geçerlilik tarihi geçtiyse uyarıya dön
  document.querySelectorAll('.gecerli[data-son]').forEach(function (p) {
    var son = new Date(p.dataset.son + 'T23:59:59');
    if (new Date() > son) {
      p.querySelector('.g-ok').hidden = true;
      p.querySelector('.g-eski').hidden = false;
    }
  });

  // Harita yalnızca ziyaretçi isteyince yüklenir (Google'a istek o zaman gider)
  document.querySelectorAll('.map-box [data-harita]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.map-box');
      var f = document.createElement('iframe');
      f.src = box.dataset.src;
      f.title = 'Harita konumu';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer';
      box.textContent = '';
      box.classList.add('acik');
      box.appendChild(f);
    });
  });

  // SSS arama
  var search = document.getElementById('sssAra');
  if (search) {
    var empty = document.getElementById('sssBos');
    // Türkçe harfleri sadeleştir: "harc" da "harç" da hem "harçlar"ı hem "harcı"yı bulsun, "saglik" "sağlık"ı bulsun
    var harf = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' };
    var sade = function (s) {
      return s.toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, function (c) { return harf[c]; });
    };
    search.addEventListener('input', function () {
      var q = sade(search.value).trim();
      var shown = 0;
      document.querySelectorAll('.faq details').forEach(function (d) {
        var hit = !q || sade(d.textContent).indexOf(q) !== -1;
        d.hidden = !hit;
        if (hit) shown++;
      });
      document.querySelectorAll('.faq section').forEach(function (s) {
        s.hidden = !s.querySelector('details:not([hidden])');
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  // Bilgi talep formu: sunucuya veri göndermez; mesajı WhatsApp'ta veya e-posta uygulamasında açar
  var form = document.getElementById('bilgiFormu');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var f = form.elements;
      var lines = [
        'Merhaba, web sitenizden yazıyorum.',
        'Ad Soyad: ' + f.ad.value.trim(),
        'Telefon: ' + f.tel.value.trim(),
        'İlgilendiğim eğitim: ' + f.egitim.value
      ];
      if (f.mesaj.value.trim()) lines.push('Mesaj: ' + f.mesaj.value.trim());
      var metin = encodeURIComponent(lines.join('\n'));
      var kanal = e.submitter && e.submitter.value;
      if (kanal === 'eposta') {
        window.location.href = 'mailto:' + form.dataset.eposta + '?subject=' + encodeURIComponent('Bilgi talebi') + '&body=' + metin;
      } else {
        window.open('https://wa.me/' + form.dataset.wa + '?text=' + metin, '_blank', 'noopener');
      }
    });
  }
})();
