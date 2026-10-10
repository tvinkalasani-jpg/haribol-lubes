import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import styles from "./form-controls.module.css";

type FieldState = "default" | "error" | "success";

type FieldFrameProps = {
  children: ReactNode;
  helperText?: string;
  id: string;
  label: string;
  state?: FieldState;
};

function FieldFrame({
  children,
  helperText,
  id,
  label,
  state = "default",
}: FieldFrameProps) {
  return (
    <div className={`${styles.field} ${styles[state]}`}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {helperText ? (
        <p className={styles.helper} id={`${id}-message`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  helperText?: string;
  id: string;
  label: string;
  state?: FieldState;
};

export function TextField({
  helperText,
  id,
  label,
  state = "default",
  type = "text",
  ...props
}: TextFieldProps) {
  const messageId = helperText ? `${id}-message` : undefined;

  return (
    <FieldFrame helperText={helperText} id={id} label={label} state={state}>
      <input
        {...props}
        aria-describedby={messageId}
        aria-invalid={state === "error" || undefined}
        className={styles.control}
        id={id}
        type={type}
      />
    </FieldFrame>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  children: ReactNode;
  helperText?: string;
  id: string;
  label: string;
  state?: FieldState;
};

export function SelectField({
  children,
  helperText,
  id,
  label,
  state = "default",
  ...props
}: SelectFieldProps) {
  return (
    <FieldFrame helperText={helperText} id={id} label={label} state={state}>
      <select
        {...props}
        aria-describedby={helperText ? `${id}-message` : undefined}
        aria-invalid={state === "error" || undefined}
        className={styles.control}
        id={id}
      >
        {children}
      </select>
    </FieldFrame>
  );
}

type TextareaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  helperText?: string;
  id: string;
  label: string;
  state?: FieldState;
};

export function TextareaField({
  helperText,
  id,
  label,
  state = "default",
  ...props
}: TextareaFieldProps) {
  return (
    <FieldFrame helperText={helperText} id={id} label={label} state={state}>
      <textarea
        {...props}
        aria-describedby={helperText ? `${id}-message` : undefined}
        aria-invalid={state === "error" || undefined}
        className={styles.control}
        id={id}
      />
    </FieldFrame>
  );
}

type ChoiceFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  id: string;
  label: string;
  type: "checkbox" | "radio";
};

export function ChoiceField({ id, label, type, ...props }: ChoiceFieldProps) {
  return (
    <label className={styles.choice} htmlFor={id}>
      <input {...props} id={id} type={type} />
      <span aria-hidden className={styles.choiceMark} />
      <span>{label}</span>
    </label>
  );
}
