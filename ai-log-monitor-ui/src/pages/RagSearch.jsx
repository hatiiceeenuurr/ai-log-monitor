import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchLogs } from '../services/api';
import LogDetailModal from '../components/modals/LogDetailModal';

function RagSearch() {
    const { t, i18n } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);

    const sampleQueries = [
        t("rag.sample_1"),
        t("rag.sample_2"),
        t("rag.sample_3"),
        t("rag.sample_4"),
        t("rag.sample_5")
    ];

    const translateText = async (text, targetLang) => {
        if (!text) return text;
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const json = await res.json();
            return json[0].map(item => item[0]).join('');
        } catch (e) {
            console.error("Translation error", e);
            return text;
        }
    };

    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) return;
        
        try {
            setLoading(true);
            setSearched(true);
            setError(null);
            
            // Cross-lingual RAG: Translate query to English for better vector matching
            let searchTarget = searchQuery.trim();
            if (i18n.language !== 'en') {
                searchTarget = await translateText(searchTarget, 'en');
                console.log("Cross-lingual RAG: Translated query to:", searchTarget);
            }
            
            const data = await searchLogs(searchTarget);
            setResults(data || []);
        } catch (err) {
            console.error("Vector search failed:", err);
            setError('Search failed. Please make sure the backend is running.');
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
                <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>{t('rag.title')}</h2>
                <p className="text-muted small mb-0">{t('rag.subtitle')}</p>
            </div>

            {/* Search Input Box */}
            <div className="card shadow-sm border-0 rounded-4 mb-4 p-3">
                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                        <div className="input-group input-group-lg mb-3">
                            <span className="input-group-text bg-light border-end-0">🔍</span>
                            <input 
                                type="text" 
                                className="form-control bg-light border-start-0 shadow-none" 
                                placeholder={t("rag.placeholder")}
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
                                        {t("rag.searching")}
                                    </>
                                ) : t("rag.search_btn")}
                            </button>
                        </div>
                    </form>

                    {/* Quick Sample Queries */}
                    <div>
                        <small className="text-muted fw-bold d-block mb-2">{t('rag.sample_queries')}</small>
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
            {error && (
                <div className="alert alert-danger rounded-4 p-4 text-center shadow-sm">
                    <h5>⚠️ Search Error</h5>
                    <p className="mb-0">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="text-center p-5 panel-subtle rounded-4 shadow-sm my-4">
                    <div className="spinner-border text-primary me-2" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                    <p className="mt-3 text-muted fw-semibold">{t('rag.generating_embedding')}</p>
                </div>
            ) : searched && results.length === 0 && !error ? (
                <div className="alert alert-info rounded-4 p-4 text-center shadow-sm">
                    <h5>{t('rag.no_results_title')}</h5>
                    <p className="mb-0 text-muted">No log entries matched the similarity threshold for query: "{query}"</p>
                </div>
            ) : results.length > 0 ? (
                <>
                <div className="mb-3">
                    <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">{results.length} result{results.length > 1 ? 's' : ''} found</span>
                </div>
                <div className="row g-4">
                    {results.map((result, idx) => {
                        const logItem = result.analysis;
                        return (
                            <div key={logItem.id || idx} className="col-12">
                                <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(logItem)}>
                                    <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-2">
                                            {getSimilarityBadge(result.similarity)}
                                            <span className={`badge ${logItem.severity === 'ERROR' ? 'bg-danger' : logItem.severity === 'WARN' ? 'bg-warning text-dark' : 'bg-success'}`} translate="no">
                                                {logItem.severity}
                                            </span>
                                            <span className="badge bg-secondary" translate="no">{logItem.priority || 'NORMAL'}</span>
                                        </div>
                                        <button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={(e) => { e.stopPropagation(); setSelectedLog(logItem); }}>
                                            {t('rag.inspect_btn')}
                                        </button>
                                    </div>
                                    <div className="card-body p-4">
                                        <h5 className="card-title text-danger mb-3 fw-bold">
                                            {t('rag.problem')} <span style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} translate="yes">{logItem.problem || logItem.logContent}</span>
                                        </h5>

                                        {logItem.cause && (
                                            <div className="mb-3">
                                                <small className="text-muted fw-bold text-uppercase">{t('rag.cause')}</small>
                                                <p className="panel-subtle p-3 rounded-3 border-start border-4 border-warning mt-1" style={{ color: 'var(--text-main)', wordBreak: 'break-word', overflowWrap: 'anywhere' }} translate="yes">
                                                    {logItem.cause}
                                                </p>
                                            </div>
                                        )}

                                        {logItem.solution && (
                                            <div className="mb-3">
                                                <small className="text-muted fw-bold text-uppercase">{t('rag.solution')}</small>
                                                <p className="panel-subtle text-success p-3 rounded-3 border-start border-4 border-success mt-1 font-monospace small" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} translate="yes">
                                                    {logItem.solution}
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <small className="text-muted fw-bold text-uppercase">{t('rag.matched_pattern')}</small>
                                            <pre className="p-3 bg-dark text-light rounded-3 font-monospace small mb-0 mt-1" style={{ overflowX: 'auto', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }} translate="no">
                                                <code>{logItem.logContent}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                </>
            ) : null}

            {selectedLog && (
                <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
            )}
        </div>
    );
}

export default RagSearch;