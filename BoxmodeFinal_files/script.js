document.addEventListener('DOMContentLoaded', () => {
  let parallaxSections = document.querySelectorAll('.section--parallax, .section--parallax-bg');
  let headerSqueezer = document.querySelector('.header-squeezer');
  let headerSqueezePos = 0;
  let header = document.querySelector('header');
  let headerHeightMin = 0;
  let headerHeightMax = 0;


  window.addEventListener('resize', throttle(refreshHeaderSize, 10));
  window.addEventListener('scroll', throttle(refreshHeaderSize, 10));

  refreshHeaderSize();

  function refreshHeaderSize() {
    if (header) {
      headerHeightMin = parseInt(getComputedStyle(header).minHeight);
      headerHeightMax = parseInt(getComputedStyle(header).maxHeight);
    }

    setHeaderSize();
    parallaxPos();
  }


  function throttle(fn, wait) {
    let time = Date.now();
    return function() {
      if ((time + wait - Date.now()) < 0) {
        fn();
        time = Date.now();
      }
    }
  }


  function setHeaderSize() {
    let headerHeightActual = 0;
    let headerScaleCoeff = 0;
    headerSqueezePos = headerSqueezer && headerSqueezer.getBoundingClientRect().top;

    if (header) {
      if (headerSqueezePos < headerHeightMin) {
        headerHeightActual = headerHeightMin;
      } else if (headerSqueezePos > headerHeightMax) {
        headerHeightActual = headerHeightMax;
      } else {
        headerHeightActual = headerSqueezePos;
      }

      header.style.setProperty('height', headerHeightActual+'px');

      if (headerHeightMax == headerHeightMin) headerScaleCoeff = 0;
      else headerScaleCoeff = (headerHeightActual - headerHeightMin) / (headerHeightMax - headerHeightMin);

      header.style.setProperty('--scale-coeff', headerScaleCoeff.toFixed(3));
    }
  }


  function parallaxPos() {
    parallaxSections && parallaxSections.forEach(section => {
      let sectionCenter = section.getBoundingClientRect().top + section.offsetHeight / 2;

      let posInViewport = sectionCenter / window.innerHeight * 100;
      let parallax = posInViewport;

      parallax = parallax < -200 ? -200 : parallax > 200 ? 200 : parallax;

      section.style.setProperty('--parallax', -parallax.toFixed(2) + 50 + '%');
    });
  }


  let observerVideo = new IntersectionObserver(entries => {
    Array.from(entries).forEach(entry => {
      if (entry.isIntersecting) {
        let promise = entry.target.play();

        if (promise !== undefined) {
          promise.catch(error => {
            entry.target.controls = true;
          }).then(() => {
            entry.target.play();
            observerVideo.unobserve(entry.target);
          });
        }

      }
    });
  }, { threshold: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1] });

  let videos = document.querySelectorAll('video');
  Array.from(videos).forEach(video => {
    // Play then pause videos to avoid "long loading" problem in safari without "controls" attribute
    if (isVisible(video)) {
      observerVideo.observe(video);
      let promise = video.play();

      if (promise !== undefined) {
        promise.catch(error => {
          video.controls = true;
        }).then(() => {
          video.addEventListener('canplaythrough', () => {
            video.play();
          });
        });
      }
    }

    video.addEventListener('click', () => {
      video.paused ? video.play() : video.pause();
    });
  });


  // Detect if element visible
  function isVisible (el) {
    var t1 = el.currentStyle ? el.currentStyle.visibility : getComputedStyle(el, null).visibility;
    var t2 = el.currentStyle ? el.currentStyle.display : getComputedStyle(el, null).display;
    if (t1 === "hidden" || t2 === "none") return false;

    while (!(/body/i).test(el)) {
      el = el.parentNode;
      t1 = el.currentStyle ? el.currentStyle.visibility : getComputedStyle(el, null).visibility;
      t2 = el.currentStyle ? el.currentStyle.display : getComputedStyle(el, null).display;
      if (t1 === "hidden" || t2 === "none") return false;
    }

    return true;
  }


  let observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('trigger');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: [.2, 1], rootMargin: '100% 0px -10%' });

  let triggers = document.querySelectorAll('.section-3, .section--double__left, .section-6__text-1, .section-6__blocks');

  triggers.forEach(trigger => {
    observer.observe(trigger);
  });


  // Cookies
  if (!document.cookie.split(';').filter((item) => item.trim().startsWith('CookiesNotificationShown=')).length) {
  let cookiesPopup;
  let cookiesPopupClose;
  let cookiesPopupTemplate = ``;

    document.body.insertAdjacentHTML('beforeend', cookiesPopupTemplate);

    cookiesPopup = document.querySelector('.cookies-popup');
    cookiesPopupClose = document.querySelector('.cookies-popup__close');

    cookiesPopupClose && cookiesPopupClose.addEventListener('click', () => {
      document.cookie = 'CookiesNotificationShown=true; path=/';
      cookiesPopup.classList.add('disappearing');
      setTimeout(() => {
        cookiesPopup.remove();
      }, 500);
    });
  }


  // Google tag manager dataLayer tracking
  var signInBtn = document.getElementById('signInBtn');

  window.dataLayer = window.dataLayer || [];
  if (signInBtn) {
    signInBtn.addEventListener('click', function(e) {
      e.preventDefault();

      window.dataLayer.push({
        'event': 'bm_signin',
        'category': 'bm_signin',
        'action': 'Page Path',
        'label': 'click_sign_in'
       });

      location.href = this.href;
    });
  }
});
