/**
 * Book Size Types
 * Classic/standard book trim sizes for picture books and children's literature
 */

export type Unit = "in" | "cm";

export type BookCategory =
  | "FICTION"
  | "NON_FICTION"
  | "HARDCOVER"
  | "CHILDREN"
  | "ISO_EU";

export type UseCase =
  | "NOVEL"
  | "BUSINESS"
  | "CHILD_BOARD"
  | "CHILD_PICTURE"
  | "TECHNICAL"
  | "POETRY";

export interface BookSize {
  id: string;
  name: string;
  category: BookCategory;
  widthIn: number;
  heightIn: number;
  widthCm: number;
  heightCm: number;
  notes?: string;
  tags?: string[];
}

export interface Recommendation {
  useCase: UseCase;
  sizeId: string;
  reason: string;
}

export interface BookSizePickerProps {
  valueId?: string;
  onChange: (size: BookSize) => void;
  defaultCategory?: BookCategory;
  unit?: Unit;
  useCase?: UseCase;
  disabled?: boolean;
}
