import App from './app';
import IndexPage from './pages/index_page';
import path from 'path';

App.PAGES.index = IndexPage;

let app = new App({
  basedir: path.join(process.cwd(), 'src')
});

process.stdout.write('\n');
App.mount(app);
// app.renderComponent();
