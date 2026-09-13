(function () {
  'use strict';

  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.share-btn--copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-copy-url');
      var originalText = btn.textContent;
      var done = function () {
        btn.textContent = 'लिंक कॉपी हो गया!';
        setTimeout(function () {
          btn.textContent = originalText;
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () {
          window.prompt('इस लिंक को कॉपी करें:', url);
        });
      } else {
        window.prompt('इस लिंक को कॉपी करें:', url);
      }
    });
  });
})();
