import * as THREE from 'three';
import PropTypes from 'prop-types';

/** Plot  legend */
let color = new THREE.Color();

function traceLegend(segmentInfo) {
    if (segmentInfo == null || segmentInfo.length === 0) return <></>
    return segmentInfo.map((entry, i) => {
        return (
            <li key={i}>
                <span
                    className="plot-legend-icon"
                    style={{
                        backgroundColor: `#${color
                            .clone()
                            .fromArray(entry.color)
                            .getHexString()}`,
                    }}
                ></span>
                {`${entry.maneuver} ${entry.number}`}
            </li>
        );
    });
}

function Legend({segmentInfo, traceTitles, currentTraceIndex, setCurrentTraceIndex}) {
    return (
        <div
            className="plot-legend"
        >
            <ul>
                {segmentInfo.map((traceSegmentInfo, traceIndex) => {
                    return (
                        <div key={`legend-trace-${traceIndex}`}>
                            <div className="legend-group-title">
                                {traceTitles[traceIndex]} 
                                <button onClick={() => setCurrentTraceIndex(traceIndex)} className={traceIndex === currentTraceIndex ? 'active' : ''}>Target</button>
                            </div>
                            <ul>{traceLegend(traceSegmentInfo)}</ul>
                        </div>
                    );
                })}
            </ul>
        </div>
    );
}

Legend.propTypes = {
    /** Array of information about segments. */
    segmentInfo: PropTypes.array,
};

export {Legend};
