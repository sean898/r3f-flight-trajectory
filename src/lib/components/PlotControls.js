import {Html} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {initialCameraPosition} from './FlightPath.react';
import {getCoordinates} from '../util';

const cameraOffset = new Vector3(0, 50, 110);
const normal = new Vector3(0, 1, 0);
const origin = new Vector3(0, 0, 0);

export function PlotControls({
    currentData,
    incrementIndex,
    controlsRef,
    followMode,
    toggleFollowMode,
    ...props
}) {
    const camera = useThree((state) => state.camera);
    const setCameraPosition = (position) => {
        camera.position.set(...position);
    };

    function setCamera(position, target) {
        setCameraPosition(position);
        camera.updateProjectionMatrix();
        controlsRef.current.target.set(target.x, target.y, target.z);
        controlsRef.current.update();
    }

    const resetPlot = () => {
        setCamera(initialCameraPosition, origin);
    };

    const snapToAircraft = () => {
        const aircraftPosition = getCoordinates(currentData);
        const cameraPosition = aircraftPosition.clone().add(cameraOffset);
        setCamera(cameraPosition, aircraftPosition);
    };

    if (followMode) snapToAircraft();

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
            <button onClick={snapToAircraft}>Snap</button>
            <button onClick={toggleFollowMode}>Follow</button>
        </Html>
    );
}
