import {Html} from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/** Plot  legend */
function Legend({segmentInfo}) {
    return (
        <Html
            wrapperClass="plot-legend-wrapper"
            onOcclude={() => {}}
            className="plot-legend"
        >
            <ul>
                {segmentInfo.map((entry, i) => {
                    const color = new THREE.Color(...entry.color).getHexString();
                    return (
                        <li key={i}>
                            <span
                                className="plot-legend-icon"
                                style={{
                                    backgroundColor: `#${color}`,
                                }}
                            ></span>
                            {`${entry.maneuver} ${entry.number}`}
                        </li>
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
