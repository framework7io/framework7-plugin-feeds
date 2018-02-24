/**
 * Framework7 Plugin Feeds 2.0.0
 * Framework7 Feeds plugin brings easy RSS feeds integration into Framework7 app
 * http://framework7.io/plugins/
 *
 * Copyright 2014-2018 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: February 24, 2018
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Framework7Feeds = factory());
}(this, (function () { 'use strict';

var FeedsClassConstructor = function (Framework7Class) {
  return (function (Framework7Class) {
    function Feeds(app, params) {
      Framework7Class.call(this, params, [app]);

      var Utils = app.utils;
      var $ = app.$;
      var request = app.request;

      var feeds = this;
      feeds.app = app;

      var defaults = Utils.extend({
        on: {},
      }, app.params.feeds);

      feeds.params = Utils.extend(defaults, params);

      var $el = $(feeds.params.el);
      if (!$el.length) { return feeds; }

      var view;
      if (feeds.params.view) {
        view = feeds.params.view;
      } else {
        view = app.views.get($el);
      }
      if (!view) { view = app.views.main; }

      Utils.extend(feeds, {
        app: app,
        request: request,
        $el: $el,
        el: $el[0],
        view: view,
        url: feeds.params.url,
        data: {},
        opened: false,
      });


      function onFeedsLinkClick(e) {
        e.preventDefault();
        var index = $(this).data('index');
        feeds.open(feeds.data.items[index]);
      }
      function onRefresh() {
        feeds.refreshFeed();
      }

      feeds.attachEvents = function attachEvents() {
        feeds.$el.on('click', 'a.feeds-item-link', onFeedsLinkClick);
        feeds.$el.parents('.ptr-content').on('ptr:refresh', onRefresh);
      };
      feeds.detachEvents = function detachEvents() {
        feeds.$el.off('click', 'a.feeds-item-link', onFeedsLinkClick);
        feeds.$el.parents('.ptr-content').off('ptr:refresh', onRefresh);
      };

      $el[0].f7Feeds = feeds;

      feeds.init();

      return feeds;
    }

    if ( Framework7Class ) Feeds.__proto__ = Framework7Class;
    Feeds.prototype = Object.create( Framework7Class && Framework7Class.prototype );
    Feeds.prototype.constructor = Feeds;
    Feeds.prototype.formatDate = function formatDate (date) {
      var feeds = this;
      if (feeds.params.formatDate) { return feeds.params.formatDate.call(feeds, date); }

      var d = new Date(date);
      var months = ('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec').split(' ');
      return ((months[d.getMonth(d)]) + " " + (d.getDate(d)) + ", " + (d.getFullYear()));
    };
    Feeds.prototype.parseData = function parseData (data) {
      var feeds = this;
      var $ = feeds.app.$;
      var parser = new window.DOMParser();
      var fragment = parser.parseFromString(data, 'text/xml');
      var channel = $(fragment).find('rss > channel');
      if (channel.length === 0) { return {}; }
      var newData = {
        title: channel.children('title').text(),
        link: channel.children('link').text(),
        description: channel.children('description').text().replace('<![CDATA[', '').replace(']]>', ''),
        copyright: channel.children('copyright').text(),
        image: {
          url: channel.children('image').children('url').text(),
          title: channel.children('image').children('title').text(),
          link: channel.children('image').children('link').text(),
          width: channel.children('image').children('width').text(),
          height: channel.children('image').children('height').text(),
        },
        items: [],
      };
      var items = channel.find('item');
      items.each(function (index, el) {
        var item = $(el);
        var itemData = {
          title: item.children('title').text().replace('<![CDATA[', '').replace(']]>', ''),
          link: item.children('link').text(),
          description: item.children('description').text().replace('<![CDATA[', '').replace(']]>', ''),
          pubDate: item.children('pubDate').text(),
          formattedDate: feeds.formatDate(item.children('pubDate').text()),
          guid: item.children('guid').text(),
          index: newData.items.length,
        };
        if (feeds.params.customItemFields && feeds.params.customItemFields.length > 0) {
          item.children().each(function (childIndex, childEl) {
            for (var i = 0; i < feeds.params.customItemFields.length; i += 1) {
              var fieldName = feeds.params.customItemFields[i].split('||')[0];
              var fieldAttr = feeds.params.customItemFields[i].split('||')[1];
              if (childEl.nodeName === fieldName) {
                if (fieldAttr) { itemData[fieldName.replace(/:/g, '')] = childEl.getAttribute(fieldAttr); }
                else { itemData[fieldName.replace(/:/g, '')] = $(childEl).text().replace('<![CDATA[', '').replace(']]>', ''); }
              }
            }
          });
        }
        newData.items.push(itemData);
      });

      return newData;
    };
    Feeds.prototype.loadFeed = function loadFeed (refresh) {
      var feeds = this;
      var app = feeds.app;
      feeds.emit('local::ajaxStart feedsAjaxStart', feeds);
      feeds.request.get(feeds.params.feedUrl, function (response) {
        feeds.emit('local::ajaxComplete feedsAjaxComplete', feeds, response);
        feeds.data = feeds.parseData(response);
        if (feeds.params.virtualList) {
          if (refresh) {
            feeds.virtualList.replaceAllItems(feeds.data.items);
          } else {
            var vlParams;
            if (feeds.params.virtualList === 'true' || feeds.params.virtualList === true) {
              vlParams = {};
            } else {
              vlParams = app.utils.extend({}, feeds.params.virtualList);
            }
            vlParams.el = feeds.el;
            vlParams.items = feeds.data.items;
            vlParams.renderItem = feeds.renderVirtualListItem;
            feeds.$el.html('');
            feeds.virtualList = app.virtualList.create(vlParams);
          }
        } else {
          feeds.$el.html(feeds.renderList(feeds.data));
        }

        // Reset PTR
        if (refresh) { app.ptr.done(feeds.$el.parents('.ptr-content')); }
      });
    };
    Feeds.prototype.renderVirtualListItem = function renderVirtualListItem (item, index) {
      var feeds = this;
      if (feeds.params.renderVirtualListItem) { return feeds.params.renderVirtualListItem.call(feeds, item, index); }

      var itemHtml = "\n        <li>\n          <a href=\"#\" class=\"item-link item-content feeds-item-link\" data-index=\"" + index + "\">\n            <div class=\"item-inner\">\n              <div class=\"item-title\">" + (item.title) + "</div>\n              <div class=\"item-after\">" + (item.formattedDate) + "</div>\n            </div>\n          </a>\n        </li>\n      ";

      return itemHtml.trim();
    };
    Feeds.prototype.renderList = function renderList (data) {
      var feeds = this;
      if (feeds.params.renderList) { return feeds.params.renderList.call(feeds, data); }

      var listHtml = "\n        <ul>\n          " + (data.items.map(function (item, index) { return ("\n            <li>\n              <a href=\"#\" class=\"item-link item-content feeds-item-link\" data-index=\"" + index + "\">\n                <div class=\"item-inner\">\n                  <div class=\"item-title\">" + (item.title) + "</div>\n                  <div class=\"item-after\">" + (item.formattedDate) + "</div>\n                </div>\n              </a>\n            </li>\n          "); }).join('')) + "\n        </ul>\n      ";
      return listHtml.trim();
    };
    Feeds.prototype.renderItemNavbar = function renderItemNavbar (item) {
      var feeds = this;
      if (feeds.params.renderItemNavbar) { return feeds.params.renderItemNavbar.call(feeds, item); }

      var navbarHtml = "\n        <div class=\"navbar\">\n          <div class=\"navbar-inner sliding\">\n            " + (feeds.params.openIn === 'page' ? ("\n            <div class=\"left\">\n              <a href=\"#\" class=\"link back\">\n                <i class=\"icon icon-back\"></i>\n                <span class=\"ios-only\">" + (feeds.params.pageBackLinkText) + "</span>\n              </a>\n            </div>\n            ") : '') + "\n            <div class=\"title\">" + (item.title) + "</div>\n            " + (feeds.params.openIn === 'popup' ? ("\n            <div class=\"right\">\n              <a href=\"#\" class=\"link popup-close\" data-popup=\".feeds-popup\">" + (feeds.params.popupCloseLinkText) + "</a>\n            </div>\n            ") : '') + "\n          </div>\n        </div>\n      ";

      return navbarHtml.trim();
    };
    Feeds.prototype.renderItemPopup = function renderItemPopup (item) {
      var feeds = this;
      if (feeds.params.renderPopup) { return feeds.params.renderPopup.call(feeds, item); }

      var popupHtml = "\n        <div class=\"popup feeds-popup\">\n          <div class=\"view view-init\">\n            " + (feeds.renderItemPage(item)) + "\n          </div>\n        </div>\n      ";

      return popupHtml.trim();
    };
    Feeds.prototype.renderItemPage = function renderItemPage (item) {
      var feeds = this;
      if (feeds.params.renderPage) { return feeds.params.renderPage.call(feeds, item); }

      var pageHtml = "\n        <div class=\"page feeds-page\" data-page=\"feeds-page-" + (item.index) + "\">\n          " + (feeds.renderItemNavbar(item)) + "\n          <div class=\"page-content\">\n            <div class=\"block\">\n              <a href=\"" + (item.link) + "\" class=\"external\" target=\"_blank\">" + (item.title) + "</a><br>\n              <small>" + (item.formattedDate) + "</small>\n            </div>\n            <div class=\"block block-strong\">" + (item.description) + "</div>\n          </div>\n        </div>\n      ";

      return pageHtml.trim();
    };
    Feeds.prototype.refreshFeed = function refreshFeed () {
      var feeds = this;
      return feeds.loadFeed(true);
    };
    Feeds.prototype.onOpen = function onOpen (type, itemEl) {
      var feeds = this;
      var app = feeds.app;
      var $openedItemEl = app.$(itemEl);
      feeds.$openedItemEl = $openedItemEl;
      feeds.openedItemEl = $openedItemEl[0];
      feeds.openedIn = type;
      feeds.opened = true;

      feeds.emit('local::open feedsOpen', feeds);
    };
    Feeds.prototype.onOpened = function onOpened () {
      var feeds = this;
      feeds.emit('local::opened feedsOpened', feeds);
    };
    Feeds.prototype.onClose = function onClose () {
      var feeds = this;
      if (feeds.destroyed) { return; }
      feeds.emit('local::close feedsClose', feeds);
    };
    Feeds.prototype.onClosed = function onClosed () {
      var feeds = this;
      if (feeds.destroyed) { return; }
      feeds.opened = false;
      feeds.$openedItemEl = null;
      feeds.openedItemEl = null;
      delete feeds.$openedItemEl;
      delete feeds.openedItemEl;

      feeds.emit('local::closed feedsClosed', feeds);
    };
    Feeds.prototype.openPopup = function openPopup (item) {
      var feeds = this;
      if (feeds.opened) { return feeds; }
      var popupHtml = feeds.renderItemPopup(item);
      var popupParams = {
        content: popupHtml,
        on: {
          popupOpen: function popupOpen(popup) {
            feeds.onOpen('popup', popup.el);
          },
          popupOpened: function popupOpened(popup) {
            feeds.onOpened('popup', popup.el);
          },
          popupClose: function popupClose(popup) {
            feeds.onClose('popup', popup.el);
          },
          popupClosed: function popupClosed(popup) {
            feeds.onClosed('popup', popup.el);
          },
        },
      };

      if (feeds.params.routableModals) {
        feeds.view.router.navigate({
          url: feeds.url,
          route: {
            path: feeds.url,
            popup: popupParams,
          },
        });
      } else {
        feeds.modal = feeds.app.popup.create(popupParams).open();
      }
      return feeds;
    };
    Feeds.prototype.openPage = function openPage (item) {
      var feeds = this;
      if (feeds.opened) { return feeds; }
      var pageHtml = feeds.renderItemPage(item);
      feeds.view.router.navigate({
        url: feeds.url,
        route: {
          content: pageHtml,
          path: feeds.url,
          on: {
            pageBeforeIn: function pageBeforeIn(e, page) {
              feeds.onOpen('page', page.el);
            },
            pageAfterIn: function pageAfterIn(e, page) {
              feeds.onOpened('page', page.el);
            },
            pageBeforeOut: function pageBeforeOut(e, page) {
              feeds.onClose('page', page.el);
            },
            pageAfterOut: function pageAfterOut(e, page) {
              feeds.onClosed('page', page.el);
            },
          },
        },
      });
      return feeds;
    };
    Feeds.prototype.open = function open (item) {
      var feeds = this;
      if (feeds.opened) { return feeds; }
      if (feeds.params.openIn === 'popup') {
        return feeds.openPopup(item);
      }
      return feeds.openPage(item);
    };
    Feeds.prototype.close = function close () {
      var feeds = this;
      if (!feeds.opened) { return feeds; }
      if (feeds.params.routableModals || feeds.openedIn === 'page') {
        feeds.view.router.back();
      } else {
        feeds.modal.once('modalClosed', function () {
          feeds.app.utils.nextTick(function () {
            feeds.modal.destroy();
            delete feeds.modal;
          });
        });
        feeds.modal.close();
      }
      return feeds;
    };

    Feeds.prototype.init = function init () {
      var feeds = this;
      feeds.loadFeed();
      feeds.attachEvents();
    };
    Feeds.prototype.destroy = function destroy () {
      var feeds = this;
      feeds.emit('local::beforeDestroy feedsBeforeDestroy', feeds);
      feeds.detachEvents();

      if (feeds.virtualList && feeds.virtualList.destroy) {
        feeds.virtualList.destroy();
      }

      delete feeds.$el[0].f7Feeds;
      feeds.app.utils.deleteProps(feeds);
      feeds.destroyed = true;
    };

    return Feeds;
  }(Framework7Class));
};

var Feeds;

var framework7_feeds = {
  name: 'feeds',
  install: function install() {
    var Framework7 = this;
    Feeds = FeedsClassConstructor(Framework7.Class);
    Framework7.Feeds = Feeds;
  },
  params: {
    feeds: {
      openIn: 'page',
      url: 'feed/',
      routableModals: true,
      view: null,
      feedUrl: null,
      formatDate: null,
      customItemFields: [],
      virtualList: false,
      pageBackLinkText: 'Back',
      popupCloseLinkText: 'Close',
      pageTitle: undefined,
      renderList: null,
      renderVirtualListItem: null,
      renderItemPage: null,
      renderItemPopup: null,
    },
  },
  create: function create() {
    var app = this;
    app.feeds = {
      create: function create(params) {
        return new Feeds(app, params);
      },
      get: function get(selector) {
        var $el = app.$(selector);
        if ($el.length > 0 && $el[0] && $el[0].f7Feeds) {
          return $el[0].f7Feeds;
        }
        return undefined;
      },
      destroy: function destroy(selector) {
        var $el = app.$(selector);
        if (!$el.length) { return; }
        if ($el[0] && $el[0].f7Feeds && $el[0].f7Feeds.destroy) {
          $el[0].f7Feeds.destroy();
        }
      },
    };
  },
  on: {
    pageInit: function pageInit(page) {
      var app = page.app;
      var $ = app.$;
      var Utils = app.utils;
      page.$el.find('.feeds-init').each(function (index, feedsEl) {
        var $el = $(feedsEl);
        app.feeds.create(Utils.extend(
          { el: feedsEl },
          $el.dataset()
        ));
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = page.app;
      page.$el.find('.feeds-init').each(function (index, feedsEl) {
        app.feeds.destroy(feedsEl);
      });
    },
  },
};

return framework7_feeds;

})));
