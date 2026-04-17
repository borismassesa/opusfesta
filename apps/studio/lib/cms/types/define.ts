import type { ZodType, ZodTypeDef } from 'zod';

// ============================================================================
// Field definitions
// ============================================================================

export interface FieldBase {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
  placeholder?: string;
}

export interface StringField extends FieldBase {
  type: 'string';
  maxLength?: number;
  default?: string;
}

export interface TextField extends FieldBase {
  type: 'text';
  rows?: number;
  maxLength?: number;
  default?: string;
}

export interface NumberField extends FieldBase {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  default?: number;
}

export interface BooleanField extends FieldBase {
  type: 'boolean';
  default?: boolean;
}

export interface SelectField extends FieldBase {
  type: 'select';
  options: { value: string; label: string }[];
  default?: string;
}

export interface DateField extends FieldBase {
  type: 'date';
  includeTime?: boolean;
  default?: string;
}

export interface RichTextField extends FieldBase {
  type: 'richtext';
  /** Optional allowlist of marks and nodes. Defaults to a sensible set. */
  features?: Array<'bold' | 'italic' | 'link' | 'heading' | 'list' | 'blockquote' | 'code'>;
}

export interface ImageField extends FieldBase {
  type: 'image';
  /** Optional accept attribute override; defaults to 'image/*'. */
  accept?: string;
  /** Optional aspect ratio hint shown in the preview (width / height). */
  aspectRatio?: number;
}

/**
 * Array / repeater field. Nests an object shape with its own sub-fields,
 * rendered per item. Primitive-item arrays are not supported in Phase 2 —
 * wrap them in a single-field object if you need an array of strings.
 */
export interface ArrayField extends FieldBase {
  type: 'array';
  /** Label for each item, e.g. "Section", "Call-out". */
  itemLabel: string;
  /** Fields that make up each item. */
  itemFields: FieldDef[];
  /** Optional limits on array length. */
  minItems?: number;
  maxItems?: number;
}

export type FieldDef =
  | StringField
  | TextField
  | NumberField
  | BooleanField
  | SelectField
  | DateField
  | RichTextField
  | ImageField
  | ArrayField;

// ============================================================================
// Content type definition
// ============================================================================

export interface ContentType<T extends Record<string, unknown> = Record<string, unknown>> {
  /** URL/type slug, e.g. 'faq' */
  type: string;
  /** Singular human label, e.g. 'FAQ' */
  label: string;
  /** Plural human label, e.g. 'FAQs' */
  pluralLabel: string;
  /** react-icons name for the nav/list icon */
  icon?: string;
  /**
   * Zod schema for draft_content / published_content validation.
   * Input is unknown so schemas can use `.default()` / `.coerce` freely;
   * output is the strict parsed shape.
   */
  schema: ZodType<T, ZodTypeDef, unknown>;
  /** Which field to render as the row title in list views */
  titleField: keyof T & string;
  /** Optional secondary field shown below the title */
  subtitleField?: keyof T & string;
  /** Form field definitions (render order is preserved) */
  fields: FieldDef[];
  /** Default sort for list view */
  defaultSort?: 'created_at' | 'updated_at' | 'title';
  defaultSortDirection?: 'asc' | 'desc';
  /** Whether documents of this type support a single-publish workflow */
  publishable?: boolean;
}

export function defineContentType<T extends Record<string, unknown>>(
  config: ContentType<T>
): ContentType<T> {
  // Return as-is; this is just a typed identity wrapper for ergonomics.
  return config;
}
