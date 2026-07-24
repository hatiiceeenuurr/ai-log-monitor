import { useState } from 'react';
import { searchLogs } from '../services/api';
import LogDetailModal from '../components/modals/LogDetailModal';

function RagSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const sampleQueries = [
        "PostgreSQL HikariPool connection timeout",
        "Redis operation latency warning",
        "HTTP 504 Gateway Timeout for inventory-service",
        "CircuitBreaker is OPEN and does not permit calls",
        "No space left on device while flushing log"
    ];

    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) return;
        
        try {
            setLoading(true);
            setSearched(true);
            const data = await searchLogs(searchQuery.trim());
            setResults(data || []);
        } catch (err) {
            console.error("Vector search failed:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuery = (q) => {
        setQuery(q);
        handleSearch(q);
    };

    const getSimilarityBadge = (score) => {
        const percentage = score ? score.toFixed(1) : "0.0";
        if (score >= 80) {
            return <span className="badge bg-success bg-gradient px-3 py-2 fs-6">🎯 {percentage}% Similarity Match</span>;
        } else if (score >= 60) {
            return <span className="badge bg-primary bg-gradient px-3 py-2 fs-6">🔍 {percentage}% Semantic Match</span>;
        } else {
            return <span className="badge bg-secondary bg-gradient px-3 py-2 fs-6">⚡ {percentage}% Low Match</span>;
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="mb-4">
                <h2 className="fw-bold text-dark mb-1">Semantic RAG Search</h2>
                <p className="text-muted small mb-0">Query PGVector database using 768-dimensional AI vector embeddings</p>
            </div>

            {/* Search Input Box */}
            <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white p-3">
                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                        <div className="input-group input-group-lg mb-3">
                            <span className="input-group-text bg-light border-end-0">🔍</span>
                            <input 
                                type="text" 
                                className="form-control bg-light border-start-0 shadow-none" 
                                placeholder="Enter an error message, stack trace, or problem description to search vector DB..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {query && (
                                <button 
                                    type="button" 
                                    className="btn btn-light border-0 text-muted"
                                    onClick={() => setQuery('')}
                                >
                                    ✖
                                </button>
                            )}
                            <button 
                                type="submit" 
                                className="btn btn-primary bg-gradient px-4 fw-bold"
                                disabled={loading || !query.trim()}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Searching Vector DB...
                                    </>
                                ) : 'Search Vector DB'}
                            </button>
                        </div>
                    </form>

                    {/* Quick Sample Queries */}
                    <div>
                        <small className="text-muted fw-bold d-block mb-2">🚀 One-Click Sample Vector Queries:</small>
                        <div className="d-flex flex-wrap gap-2">
                            {sampleQueries.map((sample, idx) => (
                                <button 
                                    key={idx}
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 opacity-85 hover-opacity-100"
                                    onClick={() => handleQuickQuery(sample)}
                                >
                                    {sample}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {loading ? (
                <div className="text-center p-5 bg-white rounded-4 shadow-sm my-4">
                    <div className="spinner-border text-primary me-2" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                    <p className="mt-3 text-muted fw-semibold">Generating query vector embedding & searching PGVector HNSW index...</p>
                </div>
            ) : searched && results.length === 0 ? (
                <div className="alert alert-info rounded-4 p-4 text-center shadow-sm">
                    <h5>No Related Logs Found</h5>
                    <p className="mb-0 text-muted">No log entries matched the similarity threshold for query: "{query}"</p>
                </div>
            ) : (
                <div className="row g-4">
                    {results.map((result, idx) => {
                        const logItem = result.analysis;
                        return (
                            <div key={logItem.id || idx} className="col-12">
                                <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(logItem)}>
                                    <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-2">
                                            {getSimilarityBadge(result.similarity)}
                                            <span className={`badge ${logItem.severity === 'ERROR' ? 'bg-danger' : logItem.severity === 'WARN' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                {logItem.severity}
                                            </span>
                                            <span className="badge bg-secondary">{logItem.priority || 'NORMAL'}</span>
                                        </div>
                                        <button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={(e) => { e.stopPropagation(); setSelectedLog(logItem); }}>
                                            Inspect Full Detail 🔍
                                        </button>
                                    </div>
                                    <div className="card-body p-4 bg-white">
                                        <h5 className="card-title text-danger mb-3 fw-bold">
                                            Problem: {logItem.problem || logItem.logContent}
                                        </h5>

                                        {logItem.cause && (
                                            <div className="mb-3">
                                                <small className="text-muted fw-bold text-uppercase">Probable Cause:</small>
                                                <p className="card-text text-dark bg-light p-3 rounded-3 border-start border-4 border-warning mt-1">
                                                    {logItem.cause}
                                                </p>
                                            </div>
                                        )}

                                        {logItem.solution && (
                                            <div className="mb-3">
                                                <small className="text-muted fw-bold text-uppercase">Recommended Solution (AI RAG Knowledge Base):</small>
                                                <p className="card-text text-success bg-light p-3 rounded-3 border-start border-4 border-success mt-1 font-monospace small">
                                                    {logItem.solution}
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <small className="text-muted fw-bold text-uppercase">Matched Log Pattern:</small>
                                            <pre className="p-3 bg-dark text-light rounded-3 font-monospace small mb-0 mt-1" style={{ overflowX: 'auto' }}>
                                                <code>{logItem.logContent}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedLog && (
                <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
            )}
        </div>
    );
}

export default RagSearch;