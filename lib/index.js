'use strict';

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _index_page = require('./pages/index_page');

var _index_page2 = _interopRequireDefault(_index_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_app2.default.PAGES.index = _index_page2.default;

var app = new _app2.default({
  initialPage: 'index'
});

_app2.default.mount(app);
// app.renderComponent();