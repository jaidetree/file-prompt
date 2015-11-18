import App from './app';
import IndexPage from './pages/index_page';

App.PAGES.index = IndexPage;

let app = new App({
  initialPage: 'index'
});

process.stdout.write('\n');
App.mount(app);
// app.renderComponent();
