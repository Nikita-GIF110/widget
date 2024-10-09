import { useState, useRef, MouseEvent, ReactEventHandler } from "react";
import "./Map.css";

type Size = "small" | "medium" | "large";
type MapImageState = "static" | "moving";

interface MapProps {
  imageSrc: string;
  size?: Size;
}

const getMousePositionRelativeToElement = <Ev, El extends HTMLElement>(
  event: MouseEvent<Ev>,
  element: El
) => {
  // Получаем абсолютные координаты мыши
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  // Получаем позицию элемента
  const rect = element.getBoundingClientRect();

  // Вычитаем позицию элемента из координат мыши
  const relativeX = mouseX - rect.left;
  const relativeY = mouseY - rect.top;

  return { x: relativeX, y: relativeY };
};

const getShift = (shift: number, border: number): number => {
  // if (shift <= (imageSize / 2) * -1) {
  //   return (imageSize / 2) * -1;
  // }
  // if (shift >= 0) {
  //   return 0;
  // }
  // return shift;
};

const CENTER = -200; // In px
const SHIFT_RATIO = 6;

const CONTAINERS_SIZES: Record<Size, number> = {
  large: 800,
  medium: 600,
  small: 400,
};
const SIZES_CLASSES: Record<Size, string> = {
  large: "map-large",
  medium: "map-medium",
  small: "map-small",
};
const MAP_CURSOR_CLASSES: Record<MapImageState, string> = {
  moving: "map-container_moving",
  static: "map-container_static",
};

export const Map = ({ imageSrc, size = "small" }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const [startCoordinates, setStartCoordinates] = useState({ x: 0, y: 0 });
  const [imageShift, setImageShift] = useState({ x: CENTER, y: CENTER });

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [imageState, setImageState] = useState<MapImageState>("static");

  const [isLoading, setIsLoading] = useState(true);

  const onMouseDown = (event: MouseEvent<HTMLImageElement>) => {
    if (!mapRef.current) {
      return;
    }

    setIsMouseDown(true);

    setStartCoordinates(
      getMousePositionRelativeToElement(event, mapRef.current)
    );
  };

  const clearState = () => {
    setIsMouseDown(false);
    setImageState("static");
  };

  const onMoseMove = (event: MouseEvent<HTMLImageElement>) => {
    if (isMouseDown && mapRef.current) {
      const { x, y } = getMousePositionRelativeToElement(event, mapRef.current);

      const distanceX = (startCoordinates.x - x) / SHIFT_RATIO;
      const distanceY = (startCoordinates.y - y) / SHIFT_RATIO;

      // const shiftX = imageShift.x + distanceX * -1;
      // const shiftY = imageShift.y + distanceY * -1;

      // const containerWidth = CONTAINERS_SIZES[size];
      // const containerHeight = CONTAINERS_SIZES[size];

      setImageShift((prevShift) => {
        const shiftX = prevShift.x + distanceX * -1;
        const shiftY = prevShift.y + distanceY * -1;

        return { x: shiftX, y: shiftY };
      });
      setImageState("moving");

      // console.log(shiftX, imageShift.x, distanceX, startCoordinates.x, x);

      // console.log(imageShift.x + distanceX * -1);
      // console.log(shiftX - containerWidth, shiftX);
      // 0 => start X
      // shiftX - containerWidth === imageWidth => end X (negative intiger)

      // console.log(Math.round(shiftX - SIZES[size]));
      // console.log(getShift(shiftX, 4000));

      // setImageShift({ x: shiftX, y: shiftY });
      // setImageShift({
      //   x: getShift(shiftX, CONTAINERS_SIZES[size]),
      //   y: getShift(shiftY, CONTAINERS_SIZES[size]),
      // });
    }
  };

  const onLoadImage: ReactEventHandler<HTMLImageElement> = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`map ${SIZES_CLASSES[size]}`}
      ref={mapRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMoseMove}
      onMouseUp={clearState}
      onMouseLeave={clearState}
    >
      <div className={`map-container ${MAP_CURSOR_CLASSES[imageState]}`}>
        <img
          src={imageSrc}
          className="map-image"
          style={{
            transform: `translate(${imageShift.x}px, ${imageShift.y}px)`,
          }}
          onLoad={onLoadImage}
        />

        {isLoading && <div className="map-spinner"></div>}
      </div>
    </div>
  );
};
