import { useEffect, useState } from "react"

function App() {
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("http://localhost:8000")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
  }, [])

  return (
    <div>
      <h1>StatLab</h1>
      <p>Backend says: {message}</p>
    </div>
  )
}

export default App