export interface MediaOptionsInterface {
  buttonLabel: string;
  buttonColor?: string;
  required?: boolean;
  requiredOnce?: boolean;
  minQuantity?: number;
  onlyNewPhoto?: boolean;
  height?: number;
  width?: number;
  quality?: number;
  greyscale?: boolean;
  requiredDescription?: boolean;
  minLengthDescription?: number;
  allowCropPhoto?: boolean;
  allowRemove?: boolean;
  thumbnail?: boolean;
  callbackBeforeSave?: () => Promise<any>;
  class?: string;
}
