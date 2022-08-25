import {useGLTF} from '@react-three/drei';
import {useRef, useMemo, useEffect} from 'react';
import modelFile from '../../assets/F-16.glb';
import {degreesToRadians} from '../util';
import {useThree} from '@react-three/fiber';
const headingOffset = -120;

function clamp(value, minValue, maxValue) {
    return Math.max(Math.min(value, maxValue), minValue);
}

const minModelScale = 0.6;
const maxModelScale = 30;
const color = 'green';
let scale;

export default function Aircraft({positionData, ...otherProps}) {
    const ref = useRef();
    const modelRef = useRef();
    const {camera} = useThree();
    const model = useGLTF(modelFile, false);
    useMemo(() => {
        model.materials['Material.002'].color.set(color);
    }, [color]);

    useEffect(() => {
        if (positionData != null) {
            /* Position */
            const {x, y, z, heading, pitch, bank} = positionData;
            ref.current.position.set(x, y, z);

            /* Rotation */
            ref.current.rotation.y =
                (heading + headingOffset) * degreesToRadians;
            ref.current.rotation.z = pitch * degreesToRadians;
            ref.current.rotation.x = bank * degreesToRadians;

            /* Scale */
            const distance = camera.position.distanceTo(ref.current.position);
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
                {...otherProps}
            />
            <axesHelper args={[20]} setColors={['red', 'green', 'blue']} />
        </group>
    );
}
