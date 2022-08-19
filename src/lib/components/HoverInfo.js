import {Html} from '@react-three/drei';
import {getCoordinates} from '../util';

export function HoverInfo({data, fields}) {
    if (data == null) return <></>;
    const position = getCoordinates(data);

    const formattedContent = fields
        .map((k) => `${k}: ${data[k].toFixed(2)}`)
        .join('\n');
    return (
        <Html
            wrapperClass="hover-info-wrapper"
            position={position}
            center
            scaleFactor={20}
        >
            <div className="hover-info">{formattedContent}</div>
        </Html>
    );
}
