import {Html} from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/** Plot  legend */
let color = new THREE.Color();

function traceLegend(segmentInfo) {
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

function Legend({segmentInfo, traceTitles}) {
    return (
        <Html
            wrapperClass="plot-legend-wrapper"
            onOcclude={() => {}}
            className="plot-legend"
        >
            <ul>
                {segmentInfo.map((traceSegmentInfo, traceIndex) => {
                    return (
                        <div>
                            <div className="legend-group-title">
                                {traceTitles[traceIndex]}
                            </div>
                            <ul>{traceLegend(traceSegmentInfo)}</ul>
                        </div>
                    );
                })}
            </ul>
        </Html>
    );
}

Legend.propTypes = {
    /** Array of information about segments. */
    segmentInfo: PropTypes.array,
};

export {Legend};
