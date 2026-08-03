/* eslint-disable @typescript-eslint/no-explicit-any */

declare class BarcodeDetectorOptions {
  formats?: string[];
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
  getSupportedFormats(): Promise<string[]>;
}

declare class DetectedBarcode {
  boundingBox: DOMRectReadOnly;
  cornerPoints: DOMPointReadOnly[];
  format: string;
  rawValue: string;
}

interface BarcodeDetectorEventMap {
  scanned: Event;
  error: Event;
}

declare interface MediaTrackConstraintSet {
  facingMode?: string;
}
