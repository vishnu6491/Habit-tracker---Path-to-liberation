import { useApp } from './hooks/useApp';

function App() {
  const { state } = useApp();

  return (
    <div
      style={{
        background: 'green',
        color: 'white',
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      useApp loaded successfully
    </div>
  );
}

export default App;
