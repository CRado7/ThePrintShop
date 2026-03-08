import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuoteStore } from "../store/quoteStore.js";
import { Card, Nav, Button, Collapse } from "react-bootstrap";
import {
  BsHouse,
  BsFileText,
  BsChevronDown,
  BsChevronRight,
  BsList,
  BsX
} from "react-icons/bs";

export default function Sidebar() {
  const navigate = useNavigate();
  const quotes = useQuoteStore((s) => s.quotes);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(isMobile);
  const [quotesOpen, setQuotesOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const latestQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
  const extraQuotesCount = quotes.length - latestQuotes.length;

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(3px)",
    zIndex: 998,
    display: collapsed ? "none" : "block",
  };

  // Map status to dot colors
  const statusColors = {
    approved: "bg-success",
    rejected: "bg-danger",
    pending: "bg-warning",
    draft: "bg-primary",
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && !collapsed && (
        <div style={overlayStyle} onClick={() => setCollapsed(true)}></div>
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: collapsed ? 60 : 250,
          transition: "width 0.3s",
          height: "100vh",
          borderRight: "1px solid #ddd",
          backgroundColor: "#fff",
          zIndex: 999,
        }}
      >
        <Card style={{ height: "100%", border: "none", boxShadow: "none" }}>
          <Card.Body className="d-flex flex-column p-2">
            {/* Collapse Toggle */}
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setCollapsed(!collapsed)}
              className="mb-3"
            >
              {collapsed ? <BsList size={20} /> : <BsX size={20} />}
            </Button>

            {/* Navigation */}
            <Nav className="flex-column">
              {/* Catalog */}
              <Nav.Link
                onClick={() => navigate("/")}
                className="mb-2 d-flex align-items-center"
              >
                <BsHouse size={18} />
                {!collapsed && <span className="ms-2">Catalog</span>}
              </Nav.Link>

              {/* Quotes Accordion */}
              <div>
                <div
                  onClick={() => {
                    if (collapsed) {
                      navigate("/quotes");
                    } else {
                      setQuotesOpen(!quotesOpen);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: collapsed ? "center" : "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <div className="d-flex align-items-center">
                    <BsFileText size={18} />
                    {!collapsed && <span className="ms-2">Quotes</span>}
                  </div>
                  {!collapsed && (
                    <span style={{ fontSize: 12 }}>
                      {quotesOpen ? <BsChevronDown /> : <BsChevronRight />}
                    </span>
                  )}
                </div>

                {/* Submenu */}
                <Collapse in={quotesOpen}>
                  <div>
                    {!collapsed &&
                      latestQuotes.map((q) => {
                        const statusColor = statusColors[q.status] || "#0d6efd";

                        return (
                          <Nav.Link
                            key={q.id}
                            className="ms-3 d-flex align-items-center"
                            onClick={() => navigate(`/quote/${q.id}`)}
                          >
                            {/* Status dot */}
                            <span
                              className={statusColor}
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor: statusColor,
                                display: "inline-block",
                                marginRight: 8,
                              }}
                            />
                            {q.name}
                          </Nav.Link>
                        );
                      })}

                    {!collapsed && extraQuotesCount > 0 && (
                      <Nav.Link
                        className="ms-3"
                        onClick={() => navigate("/quotes")}
                      >
                        See all quotes ({quotes.length})
                      </Nav.Link>
                    )}
                  </div>
                </Collapse>
              </div>
            </Nav>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}