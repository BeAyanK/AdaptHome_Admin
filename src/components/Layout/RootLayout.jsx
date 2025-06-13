import { Outlet } from 'react-router-dom'; 
import Header from './Header';
import { useSelector } from 'react-redux';

function RootLayout() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {isLoggedIn && <Header />}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
