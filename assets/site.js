/* TMG Güvenlik Eğitim Kurumu — site davranışları */
(function () {
  'use strict';

  // Mobil menü
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.textContent = open ? 'Kapat' : 'Menü';
    });
  }

  // Eğitimler açılır menüsü (klavye ve dokunmatik)
  document.querySelectorAll('.dd > button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dd = btn.parentElement;
      var open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.dd.open').forEach(function (dd) {
      if (!dd.contains(e.target)) dd.classList.remove('open');
    });
  });

  // SSS arama
  var search = document.getElementById('sssAra');
  if (search) {
    var empty = document.getElementById('sssBos');
    search.addEventListener('input', function () {
      var q = search.value.toLocaleLowerCase('tr').trim();
      var shown = 0;
      document.querySelectorAll('.faq details').forEach(function (d) {
        var hit = !q || d.textContent.toLocaleLowerCase('tr').indexOf(q) !== -1;
        d.hidden = !hit;
        if (hit) shown++;
      });
      document.querySelectorAll('.faq section').forEach(function (s) {
        s.hidden = !s.querySelector('details:not([hidden])');
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  // Ön kayıt formu: sunucuya veri göndermez, mesajı WhatsApp'ta açar
  var form = document.getElementById('onKayit');
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
      var url = 'https://wa.me/' + form.dataset.wa + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }
})();
