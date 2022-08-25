import {useCallback} from 'react';
import {Html, useBounds} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {initialCameraPosition} from './FlightPath.react';
import {getCoordinates} from '../util';

const origin = new Vector3(0, 0, 0);

function pointBetween(p0, p1, dist) {
    const direction = p1.clone().sub(p0).normalize().multiplyScalar(dist);
    return p0.clone().add(direction);
}

export function PlotControls({
    currentData,
    incrementIndex,
    controlsRef,
    followMode,
    toggleFollowMode,
    ...props
}) {
    const camera = useThree((state) => state.camera);
    const snapCallback = useCallback((e) => {
        e.stopPropagation();
        snapToAircraft();
    });

    function setCamera(position, target) {
        camera.position.copy(position);
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
    }

    const resetPlot = () => {
        setCamera(initialCameraPosition, origin);
    };

    function snapToAircraft(alpha = 0.9, ...args) {
        const aircraftPosition = getCoordinates(currentData);
        const targetDiff = aircraftPosition
            .clone()
            .sub(controlsRef.current.target);
        const goal = pointBetween(aircraftPosition, camera.position, 200).add(
            targetDiff
        );
        camera.position.lerp(goal, alpha);
        controlsRef.current.target.copy(aircraftPosition);
        controlsRef.current.update();
    }

    if (followMode) snapToAircraft(0.3);

    return (
        <Html
            wrapperClass="plot-controls-wrapper"
            className="plot-controls"
            transform={false}
            center={false}
            fullScreen
            onOcclude={() => {}} /* don't occlude */
        >
            <button onClick={resetPlot}>Reset</button>
            <button onClick={snapCallback}>Snap</button>
            <button onClick={toggleFollowMode}>Follow</button>
        </Html>
    );
}
