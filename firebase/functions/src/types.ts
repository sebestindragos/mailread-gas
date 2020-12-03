export interface IPixelView {
  createdAt: number;
  agent: string;
}

export interface IPixel {
  createdAt: string;
  uri: string;
  views?: IPixelView[];
}
