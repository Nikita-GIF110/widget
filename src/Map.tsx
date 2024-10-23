import {
  useState,
  useRef,
  MouseEvent,
  ReactEventHandler,
  ChangeEvent,
  useEffect,
  useCallback,
} from "react";
import "./Map.css";

type Size = "small" | "medium" | "large";
type MapImageState = "static" | "moving";

interface MapProps {
  imageSrc: string;
  imageWidth?: number;
  imageHeight?: number;
  size?: Size;
}

const getMousePositionRelativeToElement = <El extends HTMLElement>(
  client: { x: number; y: number },
  element: El
) => {
  // Получаем абсолютные координаты мыши
  const mouseX = client.x;
  const mouseY = client.y;

  // Получаем позицию элемента
  const rect = element.getBoundingClientRect();

  // Вычитаем позицию элемента из координат мыши
  const relativeX = mouseX - rect.left;
  const relativeY = mouseY - rect.top;

  return { x: relativeX, y: relativeY };
};

const isCossedBorder = (shift: number): boolean => shift > 0 || shift < 0;

// const getShift = (shift: number, border: number): number => {
//   // if (shift <= (imageSize / 2) * -1) {
//   //   return (imageSize / 2) * -1;
//   // }
//   // if (shift >= 0) {
//   //   return 0;
//   // }
//   // return shift;
// };

const checkShift = (shiftValue: number): number => {
  if (shiftValue >= 0 || shiftValue <= 0) {
    return 0;
  }
  return shiftValue;
};

const CENTER = -2000; // In px
const SHIFT_RATIO = 6;

// const CONTAINERS_SIZES: Record<Size, number> = {
//   large: 800,
//   medium: 600,
//   small: 400,
// };
const SIZES_CLASSES: Record<Size, string> = {
  large: "map-large",
  medium: "map-medium",
  small: "map-small",
};
const MAP_CURSOR_CLASSES: Record<MapImageState, string> = {
  moving: "map-container_moving",
  static: "map-container_static",
};
const ZOOMS: Record<string, number> = {
  0.1: 0.1,
  0.2: 0.2,
  0.4: 0.4,
  0.6: 0.6,
  0.8: 0.8,
  1: 1,
  "1.1": 1.1,
  "1.2": 1.2,
};

export const Map = ({
  imageSrc,
  size = "small",
  imageWidth = 4000,
  imageHeight = 4000,
}: MapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [startCoordinates, setStartCoordinates] = useState({ x: 0, y: 0 });
  const [imageShift, setImageShift] = useState({ x: CENTER, y: CENTER });

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [imageState, setImageState] = useState<MapImageState>("static");
  const [imageSize, setImageSize] = useState({
    width: imageWidth,
    height: imageHeight,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [zoomValue, setZoomValue] = useState("0.1");

  const clearState = () => {
    setIsMouseDown(false);
    setImageState("static");
  };

  const onMouseDown = (event: MouseEvent<HTMLImageElement>) => {
    if (!containerRef.current || !imageRef.current) {
      return;
    }

    setIsMouseDown(true);
    const newCoords = getMousePositionRelativeToElement(
      { x: event.clientX, y: event.clientY },
      containerRef.current
    );
    const newCoords2 = getMousePositionRelativeToElement(
      newCoords,
      containerRef.current
    );
    // console.log(imageRef.current.width, " | ", imageSize.width);
    // console.log(imageSize.width * ZOOMS[zoomValue]);

    setStartCoordinates(newCoords);
  };

  const onMoseMove = (event: MouseEvent<HTMLImageElement>) => {
    if (isMouseDown && containerRef.current && imageRef.current) {
      const { x, y } = getMousePositionRelativeToElement(
        { x: event.clientX, y: event.clientY },
        containerRef.current
      );

      const distanceX = (startCoordinates.x - x) / SHIFT_RATIO;
      const distanceY = (startCoordinates.y - y) / SHIFT_RATIO;

      const shiftX = imageShift.x + distanceX * -1;
      const shiftY = imageShift.y + distanceY * -1;

      // const containerWidth = CONTAINERS_SIZES[size];
      // const containerHeight = CONTAINERS_SIZES[size];

      const containerRect = containerRef.current.getBoundingClientRect();
      const { x: imageShiftX, y: imageShiftY } = getMousePositionRelativeToElement(
        { x: containerRect.x, y: containerRect.y },
        imageRef.current
      );

      console.log(`startCoordinates -> ${startCoordinates.x}`, `x -> ${x}`);

      setImageShift((prevShift) => {
        // const shiftX = prevShift.x + distanceX * -1;
        // const shiftY = prevShift.y + distanceY * -1;
        // console.log(prevShift.x >= startCoordinates.x ? "plus" : "minus");
        return { x: shiftX, y: shiftY };
      });
      setImageState("moving");


 
      // console.log(Math.ceil(imageShiftX));

      // isCossedBorder(Math.ceil(imageShiftX))
      // const newImagePositionX = checkShift(imageShiftX);
      // const newImagePositionY = checkShift(imageShiftY);
      // setImageShift({ x: newImagePositionX, y: newImagePositionY });

      // console.log(imageShiftX, );

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

  const onChangeZoom = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setZoomValue(ZOOMS[value]);
  };

  const checkContainerBounds = () => {
    if (imageRef.current && containerRef.current) {
      const { width, height } = imageRef.current;
      setImageSize({ width, height });

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const containerCenterX =
        ((containerWidth / 2 / ZOOMS[zoomValue]) * -1 - containerWidth / 2) / 2;
      const containerCenterY =
        ((containerHeight / 2 / ZOOMS[zoomValue]) * -1 - containerHeight / 2) /
        2;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerPositionX = containerRect.x;
      const containerPositionY = containerRect.y;

      const currentImageWidth = width * ZOOMS[zoomValue];
      const currentImageHeight = height * ZOOMS[zoomValue];

      const imageRect = imageRef.current.getBoundingClientRect();

      const imageSmallerContainer =
        currentImageWidth < containerWidth ||
        currentImageHeight < containerHeight;

      const { x, y } = getMousePositionRelativeToElement(
        { x: containerRect.x, y: containerRect.y },
        imageRef.current
      );

      const newImagePositionX = checkShift(x);
      const newImagePositionY = checkShift(y);

      setImageShift({ x: newImagePositionX, y: newImagePositionY });

      // const imagePositionX = x;
      // const imagePositionY = y;
    }
  };

  // useEffect(() => {
  //   checkContainerBounds();
  // }, [zoomValue]);
  // useEffect(() => {
  //   checkContainerBounds();
  // }, [imageShift]);

  return (
    <div
      className={`map ${SIZES_CLASSES[size]}`}
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMoseMove}
      onMouseUp={clearState}
      onMouseLeave={clearState}
    >
      <div className="map-controls">
        <select name="zoomValues" onChange={onChangeZoom} value={zoomValue}>
          <option value="">--Please choose an option--</option>

          {Object.keys(ZOOMS).map((key) => (
            <option key={ZOOMS[key]} value={ZOOMS[key]}>
              {ZOOMS[key]}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`map-container ${MAP_CURSOR_CLASSES[imageState]}`}
        ref={containerRef}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          className="map-image"
          style={{
            transform: `translate(${imageShift.x}px, ${imageShift.y}px) scale(${zoomValue})`,
          }}
          onLoad={onLoadImage}
        />

        {isLoading && <div className="map-spinner"></div>}
      </div>

      <div className="map-center-marker" />
    </div>
  );
};
