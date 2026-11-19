import { useEffect, useRef, useState, useCallback } from "react";

type TransformType = {
	x: number;
	y: number;
	scale: number;
	rotate: number;
};

type CanvasProps = {
	isEditMode: boolean;
	transform: TransformType;
	setTransform: React.Dispatch<React.SetStateAction<TransformType>>;
	userPhoto: HTMLImageElement | null;
	frameSrc: string;
	frameWidth?: number;
	frameHeight?: number;
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	onDimensionsLoaded?: (width: number, height: number) => void;
};

export default function TwibbonCanvas({
	userPhoto,
	transform,
	frameSrc,
	frameWidth = 1080,
	frameHeight = 1080,
	isEditMode,
	setTransform,
	canvasRef,
	onDimensionsLoaded,
}: CanvasProps) {
	const [dimensions, setDimensions] = useState({ width: frameWidth, height: frameHeight });
	const frameRef = useRef(new Image());
	const isDragging = useRef(false);
	const lastPos = useRef({ x: 0, y: 0 });

	const draw = useCallback(() => {
		const canvas = canvasRef?.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const { width, height } = dimensions;
		ctx.clearRect(0, 0, width, height);

		// 1. Draw User Photo underneath
		if (userPhoto) {
			ctx.save();
			ctx.translate(width / 2 + transform.x, height / 2 + transform.y);
			ctx.rotate((transform.rotate * Math.PI) / 180);
			ctx.scale(transform.scale / 100, transform.scale / 100);
			ctx.drawImage(userPhoto, -userPhoto.width / 2, -userPhoto.height / 2);
			ctx.restore();
		}

		// 2. Draw Twibbon Frame overlay
		if (frameRef.current.complete && frameRef.current.naturalWidth > 0) {
			ctx.drawImage(frameRef.current, 0, 0, width, height);
		}
	}, [canvasRef, dimensions, userPhoto, transform]);

	useEffect(() => {
		const img = frameRef.current;
		img.crossOrigin = "anonymous";
		img.src = frameSrc;
		img.onload = () => {
			const w = img.naturalWidth || frameWidth || 1080;
			const h = img.naturalHeight || frameHeight || 1080;
			setDimensions({ width: w, height: h });
			onDimensionsLoaded?.(w, h);
		};
	}, [frameSrc, frameWidth, frameHeight, onDimensionsLoaded]);

	useEffect(() => {
		draw();
	}, [draw]);

	function handleDragDown(e: React.PointerEvent<HTMLCanvasElement>) {
		if (!isEditMode) return;
		isDragging.current = true;
		lastPos.current = { x: e.clientX, y: e.clientY };
		e.currentTarget.setPointerCapture(e.pointerId);
	}

	function handleDragMove(e: React.PointerEvent<HTMLCanvasElement>) {
		if (!isEditMode || !isDragging.current || !canvasRef.current) return;

		const dx = e.clientX - lastPos.current.x;
		const dy = e.clientY - lastPos.current.y;
		lastPos.current = { x: e.clientX, y: e.clientY };

		const canvas = canvasRef.current;
		const ratioX = canvas.width / canvas.clientWidth;
		const ratioY = canvas.height / canvas.clientHeight;

		setTransform((prev) => ({
			...prev,
			x: prev.x + dx * ratioX,
			y: prev.y + dy * ratioY,
		}));
	}

	function handleDragUp() {
		if (!isEditMode) return;
		isDragging.current = false;
	}

	return (
		<div className="relative flex justify-center items-center raycast-card p-3 shadow-2xl">
			<canvas
				ref={canvasRef}
				width={dimensions.width}
				height={dimensions.height}
				className={`max-h-[60vh] max-w-full w-auto h-auto object-contain select-none touch-none rounded-xl ${
					isEditMode ? "cursor-move" : ""
				}`}
				onPointerDown={handleDragDown}
				onPointerMove={handleDragMove}
				onPointerUp={handleDragUp}
			/>
		</div>
	);
}
