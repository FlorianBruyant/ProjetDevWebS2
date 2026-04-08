import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/test/")
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>🧪 Page de test Django + React</h1>

      <h2>React</h2>
      <p style={{ color: "green" }}>✅ React fonctionne !</p>

      <h2>Django (API)</h2>
      {loading && <p>⏳ Connexion à l'API...</p>}
      {error && (
        <p style={{ color: "red" }}>
          ❌ Erreur : {error} — vérifie que Django tourne sur le port 8000.
        </p>
      )}
      {data && (
        <div style={{ color: "green" }}>
          <p>✅ {data.message}</p>
          <p>🕐 Heure serveur : {data.heure}</p>
        </div>
      )}
    </div>
  );
}