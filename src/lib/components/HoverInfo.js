import {Html} from '@react-three/drei';

export function HoverInfo({data, position, fields}) {
    if (position == null || data == null) return <></>;

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
