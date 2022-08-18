import {meshBounds, useGLTF, useHelper} from '@react-three/drei';
import {useRef, useMemo, useEffect} from 'react';
import modelFile from '../../assets/F-16.glb';
import {AxesHelper} from 'three';

const degreesToRadians = Math.PI / 180;
const headingOffset = -120;

export default function Aircraft({positionData, onClick, ...otherProps}) {
    const ref = useRef();
    // useHelper(ref, AxesHelper, 1000);
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
        }
    }, [positionData]);

    return (
        <group ref={ref}>
            <axesHelper args={[20]} setColors={['red', 'green', 'blue']} />
            <primitive
                object={model.scene}
                scale={0.3}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                {...otherProps}
            />
        </group>
    );
}
