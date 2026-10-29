/* 手機全螢幕：觸控裝置第一次點擊時自動進入全螢幕，並提供右上角切換鈕 */
(function () {
  'use strict';

  var root = document.documentElement;
  var request = root.requestFullscreen || root.webkitRequestFullscreen;
  var exit = document.exitFullscreen || document.webkitExitFullscreen;
  var isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches) ||
    window.navigator.standalone === true;

  // iPhone Safari 不支援網頁全螢幕；已安裝成 App（獨立視窗）時也不需要
  if (!isTouch || !request || !exit || standalone) return;

  function isFull() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function enter() {
    if (isFull()) return;
    try {
      var p = request.call(root, { navigationUI: 'hide' });
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* 瀏覽器拒絕時略過 */ }
  }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', '切換全螢幕');
  btn.style.cssText = 'position:fixed;right:calc(8px + env(safe-area-inset-right,0px));bottom:calc(8px + env(safe-area-inset-bottom,0px));' +
    'z-index:2147483000;width:40px;height:40px;border-radius:12px;border:1px solid #E6D3B6;background:rgba(30,40,35,.72);' +
    'color:#fff;font-size:20px;line-height:1;padding:0;opacity:.8;cursor:pointer;-webkit-tap-highlight-color:transparent;';

  function sync() {
    btn.textContent = isFull() ? '🗗' : '⛶';
    btn.hidden = false;
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (isFull()) exit.call(document); else enter();
  });
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);

  // 全螢幕必須由使用者手勢觸發：第一次觸控放開時進入
  var auto = function () {
    document.removeEventListener('pointerup', auto, true);
    enter();
  };
  document.addEventListener('pointerup', auto, true);

  function mount() {
    document.body.appendChild(btn);
    sync();
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
