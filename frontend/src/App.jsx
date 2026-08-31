import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [summary, setSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    balance: 0,
  });

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [txRes, catRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/transactions`),
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/summary`),
      ]);

      if (!txRes.ok || !catRes.ok || !sumRes.ok) {
        throw new Error("Failed to load data");
      }

      setTransactions(await txRes.json());
      setCategories(await catRes.json());
      setSummary(await sumRes.json());
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Could not load your finance data. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setAmount("");
    setDescription("");
    setDate("");
    setType("expense");
    setCategoryId("");
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          date,
          type,
          category_id: parseInt(categoryId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add transaction");
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error("Error adding transaction:", error);
      setError("Could not add transaction. Please try again.");
    }
  }

  function startEditing(transaction) {
    setEditingId(transaction.id);
    setAmount(transaction.amount.toString());
    setDescription(transaction.description);
    setDate(transaction.date);
    setType(transaction.type);
    setCategoryId(transaction.category_id.toString());
    setError("");
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/transactions/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            description,
            date,
            type,
            category_id: parseInt(categoryId),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error("Error updating transaction:", error);
      setError("Could not update transaction. Please try again.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/transactions/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      await loadData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError("Could not delete transaction. Please try again.");
    }
  }

  function categoryName(id) {
    const match = categories.find((category) => category.id === id);
    return match ? match.name : "Uncategorized";
  }

  function clearFilters() {
    setSelectedCategory("");
    setStartDate("");
    setEndDate("");
  }

  const filteredTransactions = transactions
  .filter((transaction) => {
    const matchesCategory =
      !selectedCategory ||
      transaction.category_id === parseInt(selectedCategory);

    const matchesStartDate =
      !startDate || transaction.date >= startDate;

    const matchesEndDate =
      !endDate || transaction.date <= endDate;

    return matchesCategory && matchesStartDate && matchesEndDate;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="page">
      {loading ? (
        <div className="loading-state">
          <p>Loading your finances...</p>
        </div>
      ) : (
        <>
          <header className="app-header">
            <h1>Finance Tracker</h1>
            <p className="subtitle">
              A running record of income and expenses
            </p>
          </header>

          <section className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">Income</span>
              <span className="summary-value positive">
                £{summary.total_income.toFixed(2)}
              </span>
            </div>

            <div className="summary-card">
              <span className="summary-label">Expenses</span>
              <span className="summary-value negative">
                £{summary.total_expenses.toFixed(2)}
              </span>
            </div>

            <div className="summary-card balance">
              <span className="summary-label">Balance</span>
              <span className="summary-value">
                £{summary.balance.toFixed(2)}
              </span>
            </div>
          </section>

          {error && (
            <p className="form-error">{error}</p>
          )}

          <form
            className="tx-form"
            onSubmit={
              editingId === null
                ? handleSubmit
                : handleUpdate
            }
          >
            <div className="form-row">
              <input
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                type="number"
                step="0.01"
                required
              />

              <input
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
              />
            </div>

            <div className="form-row">
              <input
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                required
              />

              <select
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <select
                className="input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <button
                type="submit"
                className="btn-primary"
              >
                {editingId === null
                  ? "Add Transaction"
                  : "Save Changes"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <section className="tx-list">
            <h2>Recent Transactions</h2>

            <div className="filters">
              <div className="filter-group">
                <label>Category</label>

                <select
                  className="filter-select"
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value)
                  }
                >
                  <option value="">All categories</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>From</label>

                <input
                  className="filter-select"
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                />
              </div>

              <div className="filter-group">
                <label>To</label>

                <input
                  className="filter-select"
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                />
              </div>

              <button
                type="button"
                className="btn-clear"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>

            {transactions.length === 0 ? (
              <p className="empty-state">
                No transactions yet. Add your first transaction above.
              </p>
            ) : filteredTransactions.length === 0 ? (
              <p className="empty-state">
                No transactions match your current filters.
              </p>
            ) : null}

            <ul>
              {filteredTransactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="tx-item"
                >
                  <div className="tx-info">
                    <span className="tx-description">
                      {transaction.description}
                    </span>

                    <span className="tx-meta">
                      <span className="tx-category">
                        {categoryName(
                          transaction.category_id
                        )}
                      </span>

                      <span className="tx-date">
                        {transaction.date}
                      </span>
                    </span>
                  </div>

                  <div className="tx-right">
                    <span
                      className={`tx-amount ${
                        transaction.type === "income"
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {transaction.type === "income"
                        ? "+"
                        : "-"}
                      £{transaction.amount.toFixed(2)}
                    </span>

                    <button
                      className="btn-edit"
                      onClick={() =>
                        startEditing(transaction)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() =>
                        handleDelete(transaction.id)
                      }
                      aria-label="Delete transaction"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default App;