var apiLoginUrl = ('//api.' + window.location.hostname + '/account').replace('www.','');
var storageUrl = ('//storage.' + window.location.hostname + '/').replace('www.','');

function isAsyncSupported() {
  var isAsyncSupported;

  try {
    isAsyncSupported = eval(`typeof Object.getPrototypeOf(async function() {}).constructor === 'function'`);
  } catch (exception) {
    isAsyncSupported = false;
  }

  return isAsyncSupported;
}

async function onDOMContentLoaded() {
  var db;

  if (!localforage) {
    changeContentAfterAuth(false);
    return;
  }

  try {
    db = this.db = localforage.createInstance({ name: 'boxMode', driver: localforage.INDEXEDDB });
  } catch (e) {}

  if (!db) {
    changeContentAfterAuth(false);
    return;
  }

  var token = await db.getItem('boxModeToken');
  // var token = db.setItem('boxModeToken', 12);

  if (!token) {
    changeContentAfterAuth(false);
    return;
  }

  // token = '';

  var data;

  try {
    var response = await fetch(apiLoginUrl, { headers: { token: token } });
    data = await response.json();
  } catch (e) {}

  changeContentAfterAuth(data && data.success === true);

  if (!data) {
    return;
  }

  if (!data || data.success !== true) {
    return;
  }

  var defaultAvatar = 'images/default-avatar.svg';
  var avatar = storageUrl + data.data.attributes.avatar + '/avatar';

  var user = Object.assign({
    id: data.data.id,
    avatarUrl: data.data.attributes.avatar !== null ? avatar : defaultAvatar,
  }, data.data.attributes);

  var authContainer = document.getElementById('authorized-links');

  var children = authContainer.children;

  for (var i = 0; i < children.length; i++) {
    var child = children[i];

    for (var k in user) {
      if (!user.hasOwnProperty(k)) {
        continue;
      }

      child.innerHTML = child.innerHTML.replace('{{' + k + '}}', user[k]);
    }

  }

  setAvatarSrc();
}

function setAvatarSrc() {
  const headerAvatar = document.querySelector('.header__avatar');
  headerAvatar.src = headerAvatar.dataset.src;
  headerAvatar.removeAttribute('data-src');
}

function changeContentAfterAuth(isAuthorized) {
  const authBlocks = document.querySelectorAll('.auth-el');
  const unauthBlocks = document.querySelectorAll('.unauth-el');

  if (isAuthorized) {
    Array.from(authBlocks).forEach(authBlock => authBlock.classList.remove('auth-el'));
    Array.from(unauthBlocks).forEach(unauthBlock => unauthBlock.remove());
  } else {
    Array.from(authBlocks).forEach(authBlock => authBlock.remove());
    Array.from(unauthBlocks).forEach(unauthBlock => unauthBlock.classList.remove('unauth-el'));
    addLandingNameToLinks();
  }
}


// Save landing name tag to url param for further tracking
function addLandingNameToLinks() {
  let pageName = document.body.dataset.page;
  let dashboardLinks = document.querySelectorAll('a[href*="/dashboard/"]');
  Array.from(dashboardLinks).forEach(link => {
    let url = link.href;
    link.href = addToQueryString(url, 'fromLanding', pageName ? pageName : 'unknown');
  });
};

function addToQueryString(url, key, value) {
  var query = url.indexOf('?');
  var anchor = url.indexOf('#');
  if (query == url.length - 1) {
    // Strip any ? on the end of the URL
    url = url.substring(0, query);
    query = -1;
  }
  return (anchor > 0 ? url.substring(0, anchor) : url)
    + (query > 0 ? `&${key}=${value}` : `?${key}=${value}`)
    + (anchor > 0 ? url.substring(anchor) : '');
}

document.addEventListener('DOMContentLoaded', function() {
  return isAsyncSupported() === true ? onDOMContentLoaded() : undefined;
});