import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [laws, setLaws] = useState([]);
  const [selectedLaw, setSelectedLaw] = useState(""); // ✅ Track selected law
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/laws/categories")
      .then((res) => setCategories(res.data.categories))
      .catch((err) => console.error(err));
  }, []);

  const selectCategory = async (category) => {
    try {
      setLoading(true);
      setSelectedCategory(category);
      setSelectedLaw(""); // Reset selected law when changing category
      setExplanation("");

      const lawsRes = await axios.get(
        `http://localhost:5000/api/laws/${encodeURIComponent(category)}`
      );
      setLaws(lawsRes.data.laws);

      const explainRes = await axios.post(
        "http://localhost:5000/api/laws/explain-category",
        { category }
      );
      setExplanation(explainRes.data.explanation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectLaw = async (law) => {
    try {
      setLoading(true);
      setSelectedLaw(law); // ✅ Mark law as selected

      const res = await axios.post(
        "http://localhost:5000/api/laws/explain-law",
        { category: selectedCategory, law }
      );
      setExplanation(res.data.explanation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>📚 LegalEase – Indian Laws Explorer</h1>
        <p>Learn Indian laws with fun AI stories 🇮🇳</p>
      </div>

      <h2 className="section-title">Categories</h2>
      <div className="categories">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => selectCategory(cat)}
            className={cat === selectedCategory ? "selected" : ""}
          >
            {cat}
          </button>
        ))}
      </div>

      <h2 className="section-title">Laws</h2>
      <div className="laws">
        {laws.map((law) => (
          <div
            key={law}
            onClick={() => selectLaw(law)}
            className={law === selectedLaw ? "selected-law" : ""}
          >
            {law}
          </div>
        ))}
      </div>

      {loading && <div className="loading">🤖 Thinking...</div>}

      {explanation && (
        <div className="explanation">
          <h3>AI Explanation</h3>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}

export default App;
