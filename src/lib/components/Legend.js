import {Html} from '@react-three/drei';
import * as THREE from 'three';

export function Legend({segmentInfo}) {
    console.log(segmentInfo);
    return (
        <Html wrapperClass="plot-legend-wrapper" className="plot-legend">
            <ul>
                {segmentInfo.map((entry) => {
                    return (
                        <li>
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
