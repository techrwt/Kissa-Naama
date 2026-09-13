(function () {
  'use strict';

  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var status = document.getElementById('searchStatus');
  if (!input || !results || !status) return;

  // Depth-aware relative prefix, so this works both via file:// double-click
  // and when deployed under any GitHub Pages subpath.
  var DEPTH = typeof window.__KISSANAMA_DEPTH__ === 'number' ? window.__KISSANAMA_DEPTH__ : 1;
  var PREFIX = new Array(DEPTH + 1).join('../'); // '../'.repeat(DEPTH)

  var storyIndex = [];
  var loaded = false;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function cardHtml(story) {
    return (
      '<article class="story-card story-card--grid">' +
      '<a href="' + PREFIX + 'stories/' + story.slug + '/index.html" class="story-card__link">' +
      '<div class="story-card__image-wrap">' +
      '<img src="' + PREFIX + story.image + '" alt="' + escapeHtml(story.imageAlt) + '" loading="lazy" class="story-card__image" onerror="this.closest(\'.story-card__image-wrap\').classList.add(\'image-fallback\')" />' +
      '</div>' +
      '<div class="story-card__body">' +
      '<h3 class="story-card__title">' + escapeHtml(story.title) + '</h3>' +
      '<p class="story-card__excerpt">' + escapeHtml(story.excerpt) + '</p>' +
      '<div class="story-card__meta"><span>' + escapeHtml(story.publishedAt) + '</span><span aria-hidden="true">•</span><span>' + escapeHtml(story.readingTime) + ' मिनट पढ़ें</span></div>' +
      '</div></a></article>'
    );
  }

  function render(list, query) {
    if (!query) {
      results.innerHTML = '';
      status.textContent = '';
      return;
    }
    if (list.length === 0) {
      results.innerHTML = '';
      status.textContent = '"' + query + '" के लिए कोई कहानी नहीं मिली। कोई और शब्द आज़माएँ।';
      return;
    }
    status.textContent = '"' + query + '" के लिए ' + list.length + ' कहानी मिली।';
    results.innerHTML = list.map(cardHtml).join('');
  }

  function search(query) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    return storyIndex.filter(function (story) {
      return story._searchBlob.indexOf(q) !== -1;
    });
  }

  function runSearch() {
    var query = input.value;
    if (!loaded) {
      status.textContent = 'खोज लोड हो रही है...';
      return;
    }
    render(search(query), query.trim());
  }

  function updateUrl(query) {
    var url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url);
  }

  var debounceTimer;
  input.addEventListener('input', function () {
    updateUrl(input.value.trim());
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 120);
  });

  var form = document.getElementById('searchForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch();
    });
  }

  // Search data is embedded directly in the page (not fetched), so this works
  // identically via file://, a local server, or the live site.
  try {
    var dataEl = document.getElementById('kissanama-search-data');
    var data = dataEl ? JSON.parse(dataEl.textContent) : [];
    storyIndex = data.map(function (story) {
      story._searchBlob = [story.title, story.excerpt, story.body, (story.keywords || []).join(' ')]
        .join(' ')
        .toLowerCase();
      return story;
    });
    loaded = true;
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      input.value = initialQuery;
      runSearch();
    } else {
      status.textContent = '';
    }
  } catch (e) {
    status.textContent = 'खोज डेटा लोड करने में समस्या हुई। कृपया पेज रीलोड करें।';
  }
})();
