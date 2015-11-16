import expect from 'expect';
import Prompt from 'src/prompt';
import StdoutInterceptor from 'tests/lib/stdout_interceptor';

const DEFINED_METHODS = [
  'constructor',
  'componentDidMount',
  'componentDidUpdate',
  'componentShouldUpdate',
  'componentWillMount',
  'componentWillUnmount',
  'componentWillUpdate',
  'getDefaultProps',
  'getInitialState',
  'forceUpdate',
  'listenTo',
  'listenToOnce',
  'off',
  'on',
  'remove',
  'render',
  'renderComponent',
  'set',
  'setProps',
  'setState',
  'stopListening'
];

let ceptor = new StdoutInterceptor(),
    comlink = new EventEmitter();

