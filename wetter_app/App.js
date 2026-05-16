
import React, { useEffect, useState } from "react";

function App() {
  const [weather, setWeather] = useState(null);
  const [sols, setSols] = useState([]);
  const [selectedSol, setSelectedSol] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(
      "https://api.nasa.gov/insight_weather/?api_key=DEMO_KEY&feedtype=json&ver=1.0"
    )
      .then((res) => {
        if (!res.ok) throw new Error("Fehler beim Laden der Daten");
        return res.json();
      })
      .then((data) => {
        const sol_keys = data.sol_keys || [];
        setSols(sol_keys);
        setWeather(data);
        setSelectedSol(sol_keys[sol_keys.length - 1] || 0);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSolChange = (sol) => {
    setSelectedSol(sol);
  };

  return (
    <div style={{ fontFamily: "Arial", maxWidth: 400, margin: "2rem auto" }}>
      <h1>Mars Wetter App (InSight)</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {sols.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <span>Sol auswählen: </span>
          {sols.map((sol) => (
            <button
              key={sol}
              onClick={() => handleSolChange(sol)}
              style={{
                margin: "0 4px",
                background: sol === selectedSol ? "#1976d2" : "#eee",
                color: sol === selectedSol ? "#fff" : "#000",
                border: "none",
                borderRadius: 4,
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              {sol}
            </button>
          ))}
        </div>
      )}
      {weather && selectedSol && weather[selectedSol] && (
        <div style={{ background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
          <h2>Sol {selectedSol}</h2>
          <p>
            <b>Temperatur:</b> {weather[selectedSol].AT?.av ?? "-"}°C
            <br />
            <b>Min:</b> {weather[selectedSol].AT?.mn ?? "-"}°C,
            <b> Max:</b> {weather[selectedSol].AT?.mx ?? "-"}°C
          </p>
          <p>
            <b>Luftdruck:</b> {weather[selectedSol].PRE?.av ?? "-"} Pa
          </p>
          <p>
            <b>Windgeschwindigkeit:</b> {weather[selectedSol].HWS?.av ?? "-"} m/s
          </p>
          <p>
            <b>Erster Messzeitpunkt:</b> {weather[selectedSol].First_UTC}
            <br />
            <b>Letzter Messzeitpunkt:</b> {weather[selectedSol].Last_UTC}
          </p>
        </div>
      )}
      <footer style={{ marginTop: 32, fontSize: 12, color: "#888" }}>
        Daten von der NASA InSight Weather API
      </footer>
    </div>
  );
}

export default App;