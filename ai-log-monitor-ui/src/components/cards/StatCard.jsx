function StatCard({ title, value, color }) {
    return (
        <div className="col-md-3 mb-4">
            <div className={`card border-0 shadow-sm bg-${color} text-white h-100`}>
                <div className="card-body text-center">

                    <h5 className="card-title fw-bold">
                        {title}
                    </h5>

                    <h1 className="display-5 fw-bold">
                        {value}
                    </h1>

                </div>
            </div>
        </div>
    );
}

export default StatCard;