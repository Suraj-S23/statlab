import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout.tsx"
import HomePage from "./pages/HomePage.tsx"
import AppPage from "./pages/AppPage.tsx"
import SamplesPage from "./pages/SamplesPage.tsx"
import MethodsPage from "./pages/MethodsPage.tsx"
import DocsPage from "./pages/DocsPage.tsx"
import PrivacyPage from "./pages/PrivacyPage.tsx"

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/samples" element={<SamplesPage />} />
        <Route path="/methods" element={<MethodsPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  )
}