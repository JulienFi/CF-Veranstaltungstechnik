import { AuthProvider } from './contexts/AuthContext';
import Router from './Router';
import ToastContainer from './components/Toast';

function App() {
  return (
    <AuthProvider>
      <Router />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
