import {Html} from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

function Legend({segmentInfo}) {
    return (
        <Html
            wrapperClass="plot-legend-wrapper"
            onOcclude={() => {}}
            className="plot-legend"
        >
            <ul>
                {segmentInfo.map((entry, i) => {
                    return (
                        <li key={i}>
                            <span
                                className="plot-legend-icon"
                                style={{
                                    backgroundColor: new THREE.Color(
                                        ...entry.color
                                    ).getHexString(),
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
