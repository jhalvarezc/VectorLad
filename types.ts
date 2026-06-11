
export interface VectorData {
  id: string;
  x: number;
  y: number;
  z: number;
  color: string;
  label: string;
  isResult?: boolean;
}

export interface AngleVisual {
  v1: VectorData;
  v2: VectorData;
  angle: number;
}

export type DimensionMode = '2D' | '3D';

export type OperationType = 'SUM' | 'SUB' | 'CROSS' | 'DOT' | 'NORMALIZE' | 'ANGLE' | 'PROJECTION' | 'DISTANCE' | 'SCALAR';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AIExplanation {
  title: string;
  explanation: string;
  physicalInterpretation: string;
}
