import FeedsClassConstructor from './feeds-class';

let Feeds;

export default {
  name: 'feeds',
  install() {
    const Framework7 = this;
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
      renderList: null,
      renderVirtualListItem: null,
      renderItemPage: null,
      renderItemPopup: null,
    },
  },
  create() {
    const app = this;
    app.feeds = {
      create(params) {
        return new Feeds(app, params);
      },
      get(selector) {
        if (selector instanceof Feeds) return selector;
        const $el = app.$(selector);
        if ($el.length > 0 && $el[0] && $el[0].f7Feeds) {
          return $el[0].f7Feeds;
        }
        return undefined;
      },
      destroy(selector) {
        if (selector instanceof Feeds) {
          if (selector.destroy) selector.destroy();
          return;
        }
        const $el = app.$(selector);
        if (!$el.length) return;
        if ($el[0] && $el[0].f7Feeds && $el[0].f7Feeds.destroy) {
          $el[0].f7Feeds.destroy();
        }
      },
    };
  },
  on: {
    pageInit(page) {
      const app = page.app;
      const $ = app.$;
      const Utils = app.utils;
      page.$el.find('.feeds-init').each((feedsEl) => {
        const $el = $(feedsEl);
        app.feeds.create(Utils.extend(
          { el: feedsEl },
          $el.dataset()
        ));
      });
    },
    pageBeforeRemove(page) {
      const app = page.app;
      page.$el.find('.feeds-init').each((feedsEl) => {
        app.feeds.destroy(feedsEl);
      });
    },
  },
};
