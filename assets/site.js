/* TMG Güvenlik Eğitim Kurumu — site davranışları */
(function () {
  'use strict';

  // Mobil menü: sağdan açılan çekmece
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  var overlay = document.getElementById('overlay');
  // Çekmece açıkken arkada kalan bölümler: klavye ve ekran okuyucu bunlara girmesin
  var arka = document.querySelectorAll('.demo-flag, .hdr, main, .ftr, .mbar');
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
      btn.setAttribute('aria-label', (btn.dataset.ad || 'Alt') + ' alt menüsünü ' + (open ? 'kapat' : 'aç'));
    });
  });

  // Şube seçimi: ziyaretçi bir şubeyi arayınca ya da WhatsApp'tan yazınca o şube hatırlanır.
  // Şube sayfası yalnızca o sayfada kendi şubesini gösterir; sayfayı açmak seçim sayılmaz.
  var kok = document.documentElement;
  function subeOku() { try { return localStorage.getItem('tmg-sube'); } catch (e) { return null; } }
  function subeGoster(kod) { kok.setAttribute('data-sube', kod); }
  function subeYaz(kod) {
    subeGoster(kod);
    try { localStorage.setItem('tmg-sube', kod); } catch (e) { /* gizli sekme: yalnız bu sayfada geçerli */ }
  }
  var sube = document.body.dataset.sube || subeOku();
  if (sube) subeGoster(sube);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-sube-sec]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.classList.contains('gec')) {          // alt çubukta "öbür şubeye geç": sayfa değişmeden çubuk değişir
      e.preventDefault();
      subeYaz(a.dataset.subeSec);
    } else if (href.indexOf('tel:') === 0 || href.indexOf('wa.me') !== -1) {
      subeYaz(a.dataset.subeSec);
    }
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

  // Bilgi talep formu: sunucuya veri göndermez; mesajı ziyaretçinin e-posta uygulamasında veya (şubenin WhatsApp'ı varsa) WhatsApp'ta açar
  var form = document.getElementById('bilgiFormu');
  if (form) {
    var f = form.elements;
    var waBtn = form.querySelector('button[value="whatsapp"]');
    var secili = function () { return f.sube.options[f.sube.selectedIndex]; };
    var subeDegisti = function () { if (waBtn) waBtn.hidden = !secili().dataset.wa; };
    if (sube) f.sube.value = sube;
    f.sube.addEventListener('change', subeDegisti);
    subeDegisti();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var o = secili();
      var lines = [
        'Merhaba, web sitenizden yazıyorum.',
        'Şube: ' + o.textContent,
        'Ad Soyad: ' + f.ad.value.trim(),
        'Telefon: ' + f.tel.value.trim()
      ];
      if (f.mesaj.value.trim()) lines.push('Sorum: ' + f.mesaj.value.trim());
      var metin = encodeURIComponent(lines.join('\n'));
      var kanal = e.submitter && e.submitter.value;
      subeYaz(o.value);
      if (kanal === 'whatsapp' && o.dataset.wa) {
        window.open('https://wa.me/' + o.dataset.wa + '?text=' + metin, '_blank', 'noopener');
      } else {
        window.location.href = 'mailto:' + o.dataset.eposta + '?subject=' + encodeURIComponent('Bilgi talebi') + '&body=' + metin;
      }
    });
  }

  // Sınav takvimi: geçmiş sınavları soluklaştır, sıradakini işaretle
  var satirlar = document.querySelectorAll('.takvim tr[data-tarih]');
  if (satirlar.length) {
    var simdi = new Date();
    var bulundu = false;
    satirlar.forEach(function (tr) {
      var gun = new Date(tr.dataset.tarih + 'T23:59:59');
      var d = tr.querySelector('.durum');
      if (gun < simdi) {
        tr.classList.add('gecti');
        if (d) d.textContent = 'Yapıldı';
      } else if (!bulundu) {
        bulundu = true;
        tr.classList.add('siradaki');
        if (d) d.textContent = 'Sıradaki sınav';
        var kutu = document.getElementById('siradaki');
        if (kutu) {
          var kalan = Math.ceil((gun - simdi) / 86400000);
          kutu.textContent = 'Bir sonraki sınav: ' + tr.dataset.ad + (kalan > 1 ? ' (' + kalan + ' gün kaldı).' : kalan === 1 ? ' (yarın).' : ' (bugün).');
          kutu.hidden = false;
        }
      }
    });
    if (!bulundu) {
      var k2 = document.getElementById('siradaki');
      if (k2) { k2.textContent = 'Bu yılın sınavları tamamlandı. Yeni yılın takvimi açıklanınca bu sayfa güncellenecek; tarih için şubenizi arayın.'; k2.hidden = false; }
    }
  }

  // Puan hesaplama: doğru sayısından puanı ve geçme durumunu bulur (hiçbir veri gönderilmez)
  var pf = document.getElementById('puanFormu');
  if (pf) {
    var pe = pf.elements;
    var ps = document.getElementById('puanSonuc');
    var tur = function () { return pf.querySelector('input[name="tur"]:checked').value; };
    var alanlar = function () {
      var t = tur();
      pf.querySelectorAll('[data-tur]').forEach(function (l) { l.hidden = l.dataset.tur.split(' ').indexOf(t) === -1; });
      ps.hidden = true;
    };
    pf.querySelectorAll('input[name="tur"]').forEach(function (r) { r.addEventListener('change', alanlar); });
    alanlar();
    var sayi = function (ad, ust) {
      var v = pe[ad].value.trim();
      if (v === '') return null;
      var n = Number(v);
      return (isFinite(n) && n >= 0 && n <= ust && Math.floor(n) === n) ? n : null;
    };
    var yaz = function (n) { return String(n).replace('.', ','); };
    var el = function (etiket, metin, sinif) { var e = document.createElement(etiket); e.textContent = metin; if (sinif) e.className = sinif; return e; };
    pf.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = tur();
      ps.textContent = '';
      ps.className = 'sonuc';
      var eksik = function () {
        ps.classList.add('kaldi');
        ps.appendChild(el('p', 'Lütfen görünen bütün alanlara, belirtilen aralıkta tam sayı yazın.'));
        ps.hidden = false;
      };
      var gecti, satir = [], neden = [], ek = '';
      if (t === 'silahsiz') {
        var p = sayi('temel', 100);
        if (p === null) return eksik();
        gecti = p >= 60;
        satir.push('Puanınız: ' + p + ' (baraj 60).');
        if (!gecti) neden.push('60 puan için ' + (60 - p) + ' doğru daha gerekiyordu.');
      } else {
        var temel = sayi(t === 'silahli' ? 'temel' : 'onceki', 100);
        var sd = sayi('silah', 25), at = sayi('atis', 5);
        if (temel === null || sd === null || at === null) return eksik();
        var sp = sd * 2 + at * 10;
        var ort = (temel + sp) / 2;
        satir.push((t === 'silahli' ? 'Temel puan: ' : 'Önceki temel puan: ') + temel + '.');
        satir.push('Silah puanı: ' + sp + ' (yazılı ' + (sd * 2) + ' + atış ' + (at * 10) + ').');
        satir.push('Ortalama: ' + yaz(ort) + '.');
        if (t === 'silahli' && temel < 50) neden.push('Temel puan 50\'nin altında.');
        if (sp < 50) neden.push('Silah puanı 50\'nin altında.');
        if (ort < 60) neden.push('Ortalama 60\'ın altında.');
        gecti = neden.length === 0;
        if (!gecti && t === 'silahli' && temel >= 60) ek = 'Temel puanınız 60 ve üzeri olduğu için silahsız sertifika alma hakkınız olabilir; şubenize danışın.';
        if (!gecti && t === 'fark') ek = 'Mevcut silahsız kimlik kartınız bundan etkilenmez; sınav ücretini yatırıp silah sınavına yeniden girebilirsiniz.';
      }
      if (!gecti) ps.classList.add('kaldi');
      ps.appendChild(el('b', gecti ? 'Bu sonuçla sınavı geçiyorsunuz.' : 'Bu sonuçla sınavı geçemiyorsunuz.', 'baslik'));
      satir.forEach(function (s) { ps.appendChild(el('p', s)); });
      if (neden.length) { var ul = document.createElement('ul'); neden.forEach(function (n) { ul.appendChild(el('li', n)); }); ps.appendChild(ul); }
      if (ek) ps.appendChild(el('p', ek));
      ps.appendChild(el('p', 'Bu hesap kendi beyanınıza dayanır; kesin sonuç Emniyet Genel Müdürlüğü\'nün açıkladığı sonuçtur.', 'dipnot'));
      ps.hidden = false;
    });
  }
})();
