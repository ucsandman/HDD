import { useCustomerPortal } from './hooks/usePortalData';
import { CustomerLogin } from './components/CustomerLogin';
import { CustomerDashboard } from './components/CustomerDashboard';

function App() {
  const {
    customer,
    projects,
    isLoading,
    error,
    login,
    logout,
    sendMessage,
  } = useCustomerPortal();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#2F5233] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">HDD</span>
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return <CustomerLogin onLogin={login} error={error} />;
  }

  return (
    <CustomerDashboard
      customer={customer}
      projects={projects}
      onLogout={logout}
      onSendMessage={sendMessage}
    />
  );
}

export default App;
