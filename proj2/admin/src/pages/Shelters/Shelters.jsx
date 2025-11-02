import React, { useEffect, useState } from "react";
import "./Shelters.css";
import axios from "axios";
import { toast } from "react-toastify";
import { url, currency } from "../../assets/assets";

const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeShelter, setActiveShelter] = useState(null);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const fetchShelters = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${url}/api/shelters/list`);
      if (res.data?.success) setShelters(res.data.data || []);
      else setErr(res.data?.message || "Failed to fetch shelters");
    } catch (e) {
      setErr("Network error while fetching shelters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShelters(); }, []);

  const openRedistributeModal = async (shelter) => {
    setActiveShelter(shelter);
    setModalOpen(true);
    setSelected(new Set());
    setCancelledOrders([]);
    setOrdersLoading(true);

    try {
      const res = await axios.get(`${url}/api/order/list`);
      if (res.data?.success) {
        const cancelled = (res.data.data || []).filter(
          (o) => o.status === "Cancelled"
        );
        setCancelledOrders(cancelled);
      } else {
        toast.error(res.data?.message || "Failed to fetch orders");
      }
    } catch (e) {
      toast.error("Network error while fetching orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const toggleSelect = (orderId) => {
    const next = new Set(selected);
    if (next.has(orderId)) next.delete(orderId);
    else next.add(orderId);
    setSelected(next);
  };

  const allSelected = selected.size > 0 && selected.size === cancelledOrders.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(cancelledOrders.map((o) => o._id)));
  };

  const assignSelected = async () => {
    if (!activeShelter || selected.size === 0) {
      toast.info("Select at least one cancelled order.");
      return;
    }

    try {
      const payloads = Array.from(selected).map((orderId) =>
        axios.post(`${url}/api/order/assign-shelter`, {
          orderId,
          shelterId: activeShelter._id,
        })
      );

      const results = await Promise.allSettled(payloads);
      const ok = results.filter((r) => r.status === "fulfilled" && r.value?.data?.success).length;
      const fail = results.length - ok;

      if (ok > 0) toast.success(`Assigned ${ok} order(s) to ${activeShelter.name}`);
      if (fail > 0) toast.error(`${fail} order(s) failed to assign`);

      // Refresh modal list
      await openRedistributeModal(activeShelter);
    } catch (e) {
      toast.error("Bulk assignment failed");
    }
  };

  return (
    <div className="shelters-page">
      <h3>Partner Shelters</h3>

      {loading && <p>Loading…</p>}
      {!loading && err && <p style={{ color: "#d9534f" }}>Error: {err}</p>}

      {!loading && !err && shelters.length === 0 && (
        <p>No shelters found. Seed from the backend and refresh.</p>
      )}

      {!loading && !err && shelters.length > 0 && (
        <div className="shelter-list">
          {shelters.map((s) => (
            <div className="shelter-card" key={s._id}>
              <h4>{s.name}</h4>
              {!!s.contactName && <p>Contact: {s.contactName}</p>}
              {s.capacity != null && <p>Capacity: {s.capacity}</p>}
              {s.address && (
                <p>
                  {[
                    s.address.street,
                    s.address.city,
                    s.address.state,
                    s.address.zipcode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              <button
                className="btn-assign"
                onClick={() => openRedistributeModal(s)}
              >
                Redistribute Cancelled Orders
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h4>Cancelled Orders → {activeShelter?.name}</h4>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>

            {ordersLoading && <p>Loading orders…</p>}

            {!ordersLoading && cancelledOrders.length === 0 && (
              <p>No cancelled orders available.</p>
            )}

            {!ordersLoading && cancelledOrders.length > 0 && (
              <>
                <div className="select-all-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />{" "}
                    Select all ({cancelledOrders.length})
                  </label>
                  <button
                    className="btn-assign small"
                    onClick={assignSelected}
                    disabled={selected.size === 0}
                  >
                    Assign {selected.size || ""} selected
                  </button>
                </div>

                <div className="orders-scroll">
                  {cancelledOrders.map((o) => (
                    <div key={o._id} className="row-order">
                      <label className="row-check">
                        <input
                          type="checkbox"
                          checked={selected.has(o._id)}
                          onChange={() => toggleSelect(o._id)}
                        />
                      </label>

                      <div className="row-main">
                        <div className="row-line strong">
                          {o.items
                            .map((it) => `${it.name} x ${it.quantity}`)
                            .join(", ")}
                        </div>
                        <div className="row-line">
                          {o.address?.firstName} {o.address?.lastName} •{" "}
                          {o.address?.city}, {o.address?.state}
                        </div>
                      </div>

                      <div className="row-meta">
                        <div>Items: {o.items?.length || 0}</div>
                        <div>
                          {currency}
                          {o.amount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shelters;
