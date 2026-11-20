import Layout from '../components/Layout'
import { RouteI18nProvider } from '../i18n/context'

function App() {
  return (
    <RouteI18nProvider>
      <Layout />
    </RouteI18nProvider>
  )
}

export default App
