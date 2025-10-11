import './App.css'
import { AppRouter } from './router/AppRouter'
import { AppProviders } from './contexts/AppProviders'

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}

export default App