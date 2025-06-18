import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Provider } from 'react-redux';
import store from './store/index.jsx';
import AuthListener from './components/Auth/AuthListener.jsx';
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthListener>
        <App />
      </AuthListener>
    </Provider>
  </StrictMode>,
)
