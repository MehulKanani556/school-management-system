import logo from './logo.svg';
import './App.css';
import { Provider } from 'react-redux';
import { configureStore } from './redux/Store';
const { store, persistor } = configureStore();
function App() {
  return (
 <>
 <Provider store={store}>

 <h1>Hello World</h1>
 </Provider>
 </>
  );
}

export default App;
