import * as PDF417u from 'pdf417-generator';
import { useEffect, useRef } from "react";

export function PDF417({ ...props }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        PDF417u.draw(props.value, canvas);
    }, []);

    return <canvas ref={canvasRef} style={{ backgroundColor: 'white', width: '16rem' }} />;
}
