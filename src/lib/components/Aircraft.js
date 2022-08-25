import {meshBounds, useGLTF, useHelper} from '@react-three/drei';
import {useRef, useMemo, useEffect} from 'react';
import modelFile from '../../assets/F-16.glb';
import {AxesHelper} from 'three';
import {degreesToRadians} from '../util';
import {useFrame, useThree} from '@react-three/fiber';
const headingOffset = -120;

function clamp(value, minValue, maxValue) {
    return Math.max(Math.min(value, maxValue), minValue);
}

const minModelScale = 0.6;
const maxModelScale = 30;

export default function Aircraft({positionData, onClick, ...otherProps}) {
    const ref = useRef();
    const modelRef = useRef();
    const {camera} = useThree();
    const model = useGLTF(modelFile, false);
    const color = 'green';
    useMemo(() => {
        model.materials['Material.002'].color.set(color);
    }, [color]);

    useEffect(() => {
        if (positionData != null) {
            const {x, y, z, heading, pitch, bank} = positionData;
            ref.current.position.x = x;
            ref.current.position.y = y;
            ref.current.position.z = z;

            ref.current.rotation.y =
                (heading + headingOffset) * degreesToRadians;
            ref.current.rotation.z = pitch * degreesToRadians;
            ref.current.rotation.x = bank * degreesToRadians;

            const distance = camera.position.distanceTo(ref.current.position);
            let scale;
            if (distance > 10000) {
                scale = maxModelScale;
            } else if (distance > 5000) {
                scale = maxModelScale / 2;
            } else {
                scale = minModelScale;
            }
            if (scale && scale != modelRef.current.scale) {
                modelRef.current.scale.set(scale, scale, scale);
                modelRef.current.updateMatrix();
            }
        }
    }, [positionData]);

    return (
        <group ref={ref}>
            <primitive
                ref={modelRef}
                object={model.scene}
                scale={minModelScale}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                {...otherProps}
            />
            <axesHelper args={[20]} setColors={['red', 'green', 'blue']} />
        </group>
    );
}
