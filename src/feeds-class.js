export default function (Framework7Class) {
  return class Feeds extends Framework7Class {
    constructor(app, params) {
      super(params, [app]);

      const Utils = app.utils;
      const $ = app.$;
      const request = app.request;

      const feeds = this;
      feeds.app = app;

      const defaults = Utils.extend({
        on: {},
      }, app.params.feeds);

      feeds.params = Utils.extend(defaults, params);

      const $el = $(feeds.params.el);
      if (!$el.length) return feeds;

      let view;
      if (feeds.params.view) {
        view = feeds.params.view;
      } else {
        view = app.views.get($el);
      }
      if (!view) view = app.views.main;

      Utils.extend(feeds, {
        app,
        request,
        $el,
        el: $el[0],
        view,
        url: feeds.params.url,
        data: {},
        opened: false,
      });


      function onFeedsLinkClick(e) {
        e.preventDefault();
        const index = $(this).data('index');
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
    formatDate(date) {
      const feeds = this;
      if (feeds.params.formatDate) return feeds.params.formatDate.call(feeds, date);

      const d = new Date(date);
      const months = ('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec').split(' ');
      return `${months[d.getMonth(d)]} ${d.getDate(d)}, ${d.getFullYear()}`;
    }
    parseData(data) {
      const feeds = this;
      const $ = feeds.app.$;
      const parser = new window.DOMParser();
      const fragment = parser.parseFromString(data, 'text/xml');
      const channel = $(fragment).find('rss > channel');
      if (channel.length === 0) return {};
      const newData = {
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
      const items = channel.find('item');
      items.each((el, index) => {
        const item = $(el);
        const itemData = {
          title: item.children('title').text().replace('<![CDATA[', '').replace(']]>', ''),
          link: item.children('link').text(),
          description: item.children('description').text().replace('<![CDATA[', '').replace(']]>', ''),
          pubDate: item.children('pubDate').text(),
          formattedDate: feeds.formatDate(item.children('pubDate').text()),
          guid: item.children('guid').text(),
          index: newData.items.length,
        };
        if (feeds.params.customItemFields && feeds.params.customItemFields.length > 0) {
          item.children().each((childIndex, childEl) => {
            for (let i = 0; i < feeds.params.customItemFields.length; i += 1) {
              const fieldName = feeds.params.customItemFields[i].split('||')[0];
              const fieldAttr = feeds.params.customItemFields[i].split('||')[1];
              if (childEl.nodeName === fieldName) {
                if (fieldAttr) itemData[fieldName.replace(/:/g, '')] = childEl.getAttribute(fieldAttr);
                else itemData[fieldName.replace(/:/g, '')] = $(childEl).text().replace('<![CDATA[', '').replace(']]>', '');
              }
            }
          });
        }
        newData.items.push(itemData);
      });

      return newData;
    }
    loadFeed(refresh) {
      const feeds = this;
      const app = feeds.app;
      feeds.emit('local::ajaxStart feedsAjaxStart', feeds);
      feeds.request.get(feeds.params.feedUrl, (response) => {
        feeds.emit('local::ajaxComplete feedsAjaxComplete', feeds, response);
        feeds.data = feeds.parseData(response);
        if (feeds.params.virtualList) {
          if (refresh) {
            feeds.virtualList.replaceAllItems(feeds.data.items);
          } else {
            let vlParams;
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
        if (refresh) app.ptr.done(feeds.$el.parents('.ptr-content'));
      });
    }
    renderVirtualListItem(item, index) {
      const feeds = this;
      if (feeds.params.renderVirtualListItem) return feeds.params.renderVirtualListItem.call(feeds, item, index);

      const itemHtml = `
        <li>
          <a href="#" class="item-link item-content feeds-item-link" data-index="${index}">
            <div class="item-inner">
              <div class="item-title">${item.title}</div>
              <div class="item-after">${item.formattedDate}</div>
            </div>
          </a>
        </li>
      `;

      return itemHtml.trim();
    }
    renderList(data) {
      const feeds = this;
      if (feeds.params.renderList) return feeds.params.renderList.call(feeds, data);

      const listHtml = `
        <ul>
          ${data.items.map((item, index) => `
            <li>
              <a href="#" class="item-link item-content feeds-item-link" data-index="${index}">
                <div class="item-inner">
                  <div class="item-title">${item.title}</div>
                  <div class="item-after">${item.formattedDate}</div>
                </div>
              </a>
            </li>
          `).join('')}
        </ul>
      `;
      return listHtml.trim();
    }
    renderItemNavbar(item) {
      const feeds = this;
      if (feeds.params.renderItemNavbar) return feeds.params.renderItemNavbar.call(feeds, item);

      const navbarHtml = `
        <div class="navbar">
          <div class="navbar-inner sliding">
            ${feeds.params.openIn === 'page' ? `
            <div class="left">
              <a href="#" class="link back">
                <i class="icon icon-back"></i>
                <span class="ios-only">${feeds.params.pageBackLinkText}</span>
              </a>
            </div>
            ` : ''}
            <div class="title">${item.title}</div>
            ${feeds.params.openIn === 'popup' ? `
            <div class="right">
              <a href="#" class="link popup-close" data-popup=".feeds-popup">${feeds.params.popupCloseLinkText}</a>
            </div>
            ` : ''}
          </div>
        </div>
      `;

      return navbarHtml.trim();
    }
    renderItemPopup(item) {
      const feeds = this;
      if (feeds.params.renderPopup) return feeds.params.renderPopup.call(feeds, item);

      const popupHtml = `
        <div class="popup feeds-popup">
          <div class="view view-init">
            ${feeds.renderItemPage(item)}
          </div>
        </div>
      `;

      return popupHtml.trim();
    }
    renderItemPage(item) {
      const feeds = this;
      if (feeds.params.renderPage) return feeds.params.renderPage.call(feeds, item);

      const pageHtml = `
        <div class="page feeds-page" data-page="feeds-page-${item.index}">
          ${feeds.renderItemNavbar(item)}
          <div class="page-content">
            <div class="block">
              <a href="${item.link}" class="external" target="_blank">${item.title}</a><br>
              <small>${item.formattedDate}</small>
            </div>
            <div class="block block-strong">${item.description}</div>
          </div>
        </div>
      `;

      return pageHtml.trim();
    }
    refreshFeed() {
      const feeds = this;
      return feeds.loadFeed(true);
    }
    onOpen(type, itemEl) {
      const feeds = this;
      const app = feeds.app;
      const $openedItemEl = app.$(itemEl);
      feeds.$openedItemEl = $openedItemEl;
      feeds.openedItemEl = $openedItemEl[0];
      feeds.openedIn = type;
      feeds.opened = true;

      feeds.emit('local::open feedsOpen', feeds);
    }
    onOpened() {
      const feeds = this;
      feeds.emit('local::opened feedsOpened', feeds);
    }
    onClose() {
      const feeds = this;
      if (feeds.destroyed) return;
      feeds.emit('local::close feedsClose', feeds);
    }
    onClosed() {
      const feeds = this;
      if (feeds.destroyed) return;
      feeds.opened = false;
      feeds.$openedItemEl = null;
      feeds.openedItemEl = null;
      delete feeds.$openedItemEl;
      delete feeds.openedItemEl;

      feeds.emit('local::closed feedsClosed', feeds);
    }
    openPopup(item) {
      const feeds = this;
      if (feeds.opened) return feeds;
      const popupHtml = feeds.renderItemPopup(item);
      const popupParams = {
        content: popupHtml,
        on: {
          popupOpen(popup) {
            feeds.onOpen('popup', popup.el);
          },
          popupOpened(popup) {
            feeds.onOpened('popup', popup.el);
          },
          popupClose(popup) {
            feeds.onClose('popup', popup.el);
          },
          popupClosed(popup) {
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
    }
    openPage(item) {
      const feeds = this;
      if (feeds.opened) return feeds;
      const pageHtml = feeds.renderItemPage(item);
      feeds.view.router.navigate({
        url: feeds.url,
        route: {
          content: pageHtml,
          path: feeds.url,
          on: {
            pageBeforeIn(e, page) {
              feeds.onOpen('page', page.el);
            },
            pageAfterIn(e, page) {
              feeds.onOpened('page', page.el);
            },
            pageBeforeOut(e, page) {
              feeds.onClose('page', page.el);
            },
            pageAfterOut(e, page) {
              feeds.onClosed('page', page.el);
            },
          },
        },
      });
      return feeds;
    }
    open(item) {
      const feeds = this;
      if (feeds.opened) return feeds;
      if (feeds.params.openIn === 'popup') {
        return feeds.openPopup(item);
      }
      return feeds.openPage(item);
    }
    close() {
      const feeds = this;
      if (!feeds.opened) return feeds;
      if (feeds.params.routableModals || feeds.openedIn === 'page') {
        feeds.view.router.back();
      } else {
        feeds.modal.once('modalClosed', () => {
          feeds.app.utils.nextTick(() => {
            feeds.modal.destroy();
            delete feeds.modal;
          });
        });
        feeds.modal.close();
      }
      return feeds;
    }

    init() {
      const feeds = this;
      feeds.loadFeed();
      feeds.attachEvents();
    }
    destroy() {
      const feeds = this;
      feeds.emit('local::beforeDestroy feedsBeforeDestroy', feeds);
      feeds.detachEvents();

      if (feeds.virtualList && feeds.virtualList.destroy) {
        feeds.virtualList.destroy();
      }

      delete feeds.$el[0].f7Feeds;
      feeds.app.utils.deleteProps(feeds);
      feeds.destroyed = true;
    }
  };
}
