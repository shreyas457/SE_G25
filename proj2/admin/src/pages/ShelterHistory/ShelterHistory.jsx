import React, { useEffect, useMemo, useState } from "react";
import "./ShelterHistory.css";
import axios from "axios";
import { toast } from "react-toastify";
import { url, currency } from "../../assets/assets";

const ShelterHistory = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  // quick text filter (client-side)
  const [q, setQ] = useState("");

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${url}/api/reroutes`, {
        params: { page: p, limit },
      });
      if (res.data?.success) {
        setRows(res.data.data || []);
        setTotal(res.data.total || 0);
        setPage(res.data.page || p);
      } else {
        const msg = res.data?.message || "Failed to fetch shelter history";
        setErr(msg);
        toast.error(msg);
      }
    } catch (e) {
      setErr("Network error while fetching shelter history");
      toast.error("Network error while fetching shelter history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / limit));

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const orderTxt = (r.order?.orderNumber || r.orderId || "")
        .toString()
        .toLowerCase();
      const shelterTxt = (r.shelter?.name || r.shelterName || "").toLowerCase();
      const restTxt = (
        r.restaurant?.name ||
        r.restaurantName ||
        ""
      ).toLowerCase();
      return (
        orderTxt.includes(needle) ||
        shelterTxt.includes(needle) ||
        restTxt.includes(needle)
      );
    });
  }, [rows, q]);

  const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <div className="shelter-history-page">
      <div className="sh-header">
        <h3>Shelter Redistribution History</h3>
        <div className="sh-tools">
          <input
            className="sh-search"
            placeholder="Filter by order / shelter / restaurant"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <a className="sh-link" href="/shelters">
            Back to Shelters
          </a>
        </div>
      </div>

      {loading && <p className="sh-status">Loading…</p>}
      {!loading && err && <p className="sh-error">Error: {err}</p>}

      {!loading && !err && (
        <>
          <div className="sh-card">
            <div className="sh-table-wrap">
              <table className="sh-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order</th>
                    <th>Restaurant</th>
                    <th>Shelter</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="sh-status">
                        No redistribution records yet.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r._id} title={fmt(r.createdAt)}>
                        <td className="muted">{fmt(r.createdAt)}</td>

                        {/* monospace id with truncation + tooltip */}
                        <td
                          className="mono ellipsis"
                          title={r.order?.orderNumber || r.orderId}
                        >
                          {r.order?.orderNumber || r.orderId}
                        </td>

                        {/* truncated names with tooltip */}
                        <td
                          className="ellipsis"
                          title={r.restaurant?.name || r.restaurantName || "—"}
                        >
                          {r.restaurant?.name || r.restaurantName || "—"}
                        </td>
                        <td
                          className="ellipsis"
                          title={r.shelter?.name || r.shelterName || "—"}
                        >
                          {r.shelter?.name || r.shelterName || "—"}
                        </td>

                        {/* items as chips */}
                        <td>
                          <div className="chips">
                            {(r.items || []).map((it, i) => (
                              <span
                                key={i}
                                className="chip"
                                title={`${it.name} × ${it.qty}`}
                              >
                                {it.name} <strong>× {it.qty}</strong>
                              </span>
                            ))}
                          </div>
                        </td>

                        <td>
                          {r.total != null ? `${currency}${r.total}` : "—"}
                        </td>
                        <td className="ellipsis" title={r.reason || "—"}>
                          {r.reason || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pageCount > 1 && (
            <div className="sh-pager">
              <button
                className="btn"
                disabled={page === 1}
                onClick={() => fetchHistory(page - 1)}
              >
                Prev
              </button>
              <span>
                Page {page} of {pageCount}
              </span>
              <button
                className="btn"
                disabled={page === pageCount}
                onClick={() => fetchHistory(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShelterHistory;
